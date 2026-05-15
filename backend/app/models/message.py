from datetime import datetime
from typing import Literal

from pydantic import BaseModel

Role = Literal["user", "assistant"]


class MessagePublic(BaseModel):
    id: str
    conversation_id: str
    role: Role
    content: str
    created_at: datetime

    @classmethod
    def from_db(cls, doc: dict) -> "MessagePublic":
        return cls(
            id=str(doc["_id"]),
            conversation_id=str(doc["conversation_id"]),
            role=doc["role"],
            content=doc["content"],
            created_at=doc["created_at"],
        )
