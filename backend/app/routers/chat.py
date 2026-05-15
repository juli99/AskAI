from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.db import get_db
from app.deps import get_current_user
from app.models.conversation import ConversationPublic
from app.models.message import MessagePublic
from app.schemas.chat import SendMessageRequest, SendMessageResponse
from app.services.ai_service import ChatMessage, get_ai_provider

router = APIRouter(prefix="/chat", tags=["chat"])


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id") from exc


async def _load_conversation(
    db: AsyncIOMotorDatabase, conversation_id: str, user_id: ObjectId
) -> dict:
    conv = await db.conversations.find_one({"_id": _oid(conversation_id), "user_id": user_id})
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conv


@router.get("/conversations", response_model=list[ConversationPublic])
async def list_conversations(
    user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)
) -> list[ConversationPublic]:
    cursor = db.conversations.find({"user_id": user["_id"]}).sort("updated_at", -1)
    return [ConversationPublic.from_db(doc) async for doc in cursor]


@router.post("/conversations", response_model=ConversationPublic, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)
) -> ConversationPublic:
    now = datetime.now(timezone.utc)
    doc = {"user_id": user["_id"], "title": "", "created_at": now, "updated_at": now}
    result = await db.conversations.insert_one(doc)
    doc["_id"] = result.inserted_id
    return ConversationPublic.from_db(doc)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessagePublic])
async def list_messages(
    conversation_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[MessagePublic]:
    await _load_conversation(db, conversation_id, user["_id"])
    cursor = db.messages.find({"conversation_id": _oid(conversation_id)}).sort("created_at", 1)
    return [MessagePublic.from_db(doc) async for doc in cursor]


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=SendMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    conversation_id: str,
    payload: SendMessageRequest,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SendMessageResponse:
    conv = await _load_conversation(db, conversation_id, user["_id"])
    now = datetime.now(timezone.utc)

    user_doc = {
        "conversation_id": conv["_id"],
        "role": "user",
        "content": payload.content,
        "model": None,
        "created_at": now,
    }
    user_result = await db.messages.insert_one(user_doc)
    user_doc["_id"] = user_result.inserted_id

    history_cursor = db.messages.find({"conversation_id": conv["_id"]}).sort("created_at", 1)
    history: list[ChatMessage] = [
        {"role": doc["role"], "content": doc["content"]} async for doc in history_cursor
    ]

    provider = get_ai_provider()
    try:
        reply_text = await provider.generate(history)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI provider error: {exc}"
        ) from exc

    assistant_doc = {
        "conversation_id": conv["_id"],
        "role": "assistant",
        "content": reply_text,
        "model": settings.gemini_model,
        "created_at": datetime.now(timezone.utc),
    }
    assistant_result = await db.messages.insert_one(assistant_doc)
    assistant_doc["_id"] = assistant_result.inserted_id

    new_title = conv["title"]
    if not conv["title"]:
        new_title = payload.content[:40].strip()
    await db.conversations.update_one(
        {"_id": conv["_id"]},
        {"$set": {"updated_at": assistant_doc["created_at"], "title": new_title}},
    )
    conv["title"] = new_title
    conv["updated_at"] = assistant_doc["created_at"]

    return SendMessageResponse(
        user_message=MessagePublic.from_db(user_doc),
        assistant_message=MessagePublic.from_db(assistant_doc),
        conversation=ConversationPublic.from_db(conv),
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    conv = await _load_conversation(db, conversation_id, user["_id"])
    await db.messages.delete_many({"conversation_id": conv["_id"]})
    await db.conversations.delete_one({"_id": conv["_id"]})
