from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.models.user import UserPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)) -> UserPublic:
    return UserPublic.from_db(user)
