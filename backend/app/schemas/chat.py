from pydantic import BaseModel, Field

from app.models.conversation import ConversationPublic
from app.models.message import MessagePublic


class SendMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


class SendMessageResponse(BaseModel):
    user_message: MessagePublic
    assistant_message: MessagePublic
    conversation: ConversationPublic
