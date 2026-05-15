from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings


class _MongoState:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


state = _MongoState()


async def connect_to_mongo() -> None:
    state.client = AsyncIOMotorClient(settings.mongo_uri)
    state.db = state.client[settings.mongo_db_name]
    await state.db.users.create_index("email", unique=True)
    await state.db.users.create_index("google_id", sparse=True)
    await state.db.conversations.create_index("user_id")
    await state.db.messages.create_index("conversation_id")


async def close_mongo_connection() -> None:
    if state.client is not None:
        state.client.close()
        state.client = None
        state.db = None


def get_db() -> AsyncIOMotorDatabase:
    if state.db is None:
        raise RuntimeError("MongoDB is not connected. Call connect_to_mongo() at startup.")
    return state.db
