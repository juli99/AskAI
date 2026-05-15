from datetime import datetime

from pydantic import BaseModel


class ConversationPublic(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, doc: dict) -> "ConversationPublic":
        return cls(
            id=str(doc["_id"]),
            title=doc.get("title", "שיחה חדשה"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )
