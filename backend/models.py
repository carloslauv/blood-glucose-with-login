from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: str


class Token(BaseModel):
    access_token: str
    token_type: str


class ReadingCreate(BaseModel):
    glucose_level: float
    reading_type: str
    notes: Optional[str] = None
    recorded_at: Optional[str] = None


class ReadingOut(BaseModel):
    id: int
    user_id: int
    glucose_level: float
    reading_type: str
    notes: Optional[str]
    recorded_at: str


class AgentChatRequest(BaseModel):
    message: str


class AgentChatResponse(BaseModel):
    reply: str
    tool_calls_made: list[str]
