from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field

PyObjectId = Annotated[str, BeforeValidator(str)]


class UserInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId | None = Field(default=None, alias="_id")
    email: EmailStr
    display_name: str
    password_hash: str | None = None
    google_id: str | None = None
    is_email_verified: bool = False
    created_at: datetime
    updated_at: datetime


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    is_email_verified: bool

    @classmethod
    def from_db(cls, doc: dict) -> "UserPublic":
        return cls(
            id=str(doc["_id"]),
            email=doc["email"],
            display_name=doc["display_name"],
            is_email_verified=bool(doc.get("is_email_verified", False)),
        )
