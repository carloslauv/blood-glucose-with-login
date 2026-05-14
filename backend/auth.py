import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

from backend.database import get_db
from backend.models import UserRegister, UserLogin, UserOut, Token

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router = APIRouter()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: int, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "username": username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        username: str = payload.get("username")
        if user_id is None or username is None:
            raise credentials_error
    except JWTError:
        raise credentials_error

    async with get_db() as db:
        cursor = await db.execute("SELECT id, username, email, created_at FROM users WHERE id = ?", (user_id,))
        row = await cursor.fetchone()

    if row is None:
        raise credentials_error
    return {"id": row["id"], "username": row["username"], "email": row["email"], "created_at": row["created_at"]}


@router.post("/register", response_model=Token)
async def register(body: UserRegister):
    hashed = hash_password(body.password)
    try:
        async with get_db() as db:
            cursor = await db.execute(
                "INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)",
                (body.username, body.email, hashed),
            )
            await db.commit()
            user_id = cursor.lastrowid
    except Exception:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    token = create_token(user_id, body.username)
    return Token(access_token=token, token_type="bearer")


@router.post("/login", response_model=Token)
async def login(body: UserLogin):
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, hashed_password FROM users WHERE username = ?", (body.username,)
        )
        row = await cursor.fetchone()

    if row is None or not verify_password(body.password, row["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token(row["id"], body.username)
    return Token(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)
