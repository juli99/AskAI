from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db import get_db
from app.models.user import UserPublic
from app.schemas.auth import AuthResponse, GoogleLoginRequest, LoginRequest, RegisterRequest
from app.services.auth_service import create_access_token, hash_password, verify_password
from app.services.google_oauth import verify_google_id_token

router = APIRouter(prefix="/auth", tags=["auth"])


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
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

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
        update = {"updated_at": now}
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
