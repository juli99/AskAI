import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db import get_db
from app.deps import get_current_user
from app.models.user import UserPublic
from app.schemas.auth import (
    AuthResponse,
    GoogleLoginRequest,
    LoginRequest,
    RegisterRequest,
    VerifyEmailRequest,
    VerifyEmailResponse,
)
from app.services.auth_service import create_access_token, hash_password, verify_password
from app.services.email_service import EmailNotConfiguredError, send_verification_code
from app.services.google_oauth import verify_google_id_token
from app.services.verification_service import (
    consume_verification_code,
    issue_verification_code,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


async def _send_code_to_user(db: AsyncIOMotorDatabase, user_doc: dict) -> None:
    code = await issue_verification_code(db, user_doc["_id"])
    try:
        await send_verification_code(user_doc["email"], user_doc["display_name"], code)
    except EmailNotConfiguredError:
        logger.error("SMTP not configured; cannot send verification email")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service is not configured on the server",
        )
    except Exception as exc:
        logger.exception("Failed to send verification email")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send verification email",
        ) from exc


@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_db)) -> AuthResponse:
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    now = datetime.now(timezone.utc)
    doc = {
        "email": email,
        "display_name": payload.display_name,
        "password_hash": hash_password(payload.password),
        "google_id": None,
        "is_email_verified": False,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    await _send_code_to_user(db, doc)

    return AuthResponse(
        access_token=create_access_token(str(result.inserted_id)),
        user=UserPublic.from_db(doc),
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)) -> AuthResponse:
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return AuthResponse(
        access_token=create_access_token(str(user["_id"])),
        user=UserPublic.from_db(user),
    )


@router.post("/google", response_model=AuthResponse)
async def google_login(payload: GoogleLoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)) -> AuthResponse:
    info = verify_google_id_token(payload.id_token)
    if not info:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

    email = info.email.lower()
    now = datetime.now(timezone.utc)

    user = await db.users.find_one({"$or": [{"google_id": info.sub}, {"email": email}]})
    if user:
        update = {"updated_at": now, "is_email_verified": True}
        if not user.get("google_id"):
            update["google_id"] = info.sub
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
        user.update(update)
    else:
        doc = {
            "email": email,
            "display_name": info.name or email.split("@")[0],
            "password_hash": None,
            "google_id": info.sub,
            "is_email_verified": True,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.users.insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc

    return AuthResponse(
        access_token=create_access_token(str(user["_id"])),
        user=UserPublic.from_db(user),
    )


@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email(
    payload: VerifyEmailRequest,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> VerifyEmailResponse:
    ok, reason = await consume_verification_code(db, user, payload.code.strip())
    if not ok:
        detail_map = {
            "no_active_code": "No active verification code. Please request a new one.",
            "expired": "Verification code expired. Please request a new one.",
            "too_many_attempts": "Too many attempts. Please request a new code.",
            "wrong_code": "Incorrect verification code",
        }
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail_map.get(reason or "", "Verification failed"),
        )

    refreshed = await db.users.find_one({"_id": user["_id"]})
    return VerifyEmailResponse(user=UserPublic.from_db(refreshed))


@router.post("/resend-verification", status_code=status.HTTP_204_NO_CONTENT)
async def resend_verification(
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    if user.get("is_email_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified",
        )
    await _send_code_to_user(db, user)
