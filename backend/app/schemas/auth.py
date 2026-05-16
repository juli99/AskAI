from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserPublic


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    display_name: str = Field(min_length=1, max_length=64)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class VerifyEmailRequest(BaseModel):
    code: str = Field(min_length=4, max_length=10)


class VerifyEmailResponse(BaseModel):
    user: UserPublic
