import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.services.auth_service import hash_password, verify_password


def generate_verification_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


async def issue_verification_code(db: AsyncIOMotorDatabase, user_id: Any) -> str:
    code = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.verification_code_ttl_minutes)
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "verification_code_hash": hash_password(code),
                "verification_code_expires_at": expires_at,
                "verification_attempts": 0,
            }
        },
    )
    return code


async def consume_verification_code(
    db: AsyncIOMotorDatabase, user: dict, submitted_code: str
) -> tuple[bool, str | None]:
    if user.get("is_email_verified"):
        return True, "already_verified"

    stored_hash = user.get("verification_code_hash")
    expires_at = user.get("verification_code_expires_at")
    if not stored_hash or not expires_at:
        return False, "no_active_code"

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        return False, "expired"

    attempts = int(user.get("verification_attempts") or 0)
    if attempts >= settings.verification_max_attempts:
        return False, "too_many_attempts"

    if not verify_password(submitted_code, stored_hash):
        await db.users.update_one({"_id": user["_id"]}, {"$inc": {"verification_attempts": 1}})
        return False, "wrong_code"

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"is_email_verified": True, "updated_at": datetime.now(timezone.utc)},
            "$unset": {
                "verification_code_hash": "",
                "verification_code_expires_at": "",
                "verification_attempts": "",
            },
        },
    )
    return True, None
