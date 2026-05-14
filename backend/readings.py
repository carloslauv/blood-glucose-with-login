from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Query

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import ReadingCreate, ReadingOut

router = APIRouter()


@router.get("/", response_model=list[ReadingOut])
async def list_readings(current_user: dict = Depends(get_current_user)):
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT * FROM blood_glucose_readings WHERE user_id = ? ORDER BY recorded_at DESC",
            (current_user["id"],),
        )
        rows = await cursor.fetchall()
    return [ReadingOut(**dict(r)) for r in rows]


@router.post("/", response_model=ReadingOut)
async def create_reading(body: ReadingCreate, current_user: dict = Depends(get_current_user)):
    valid_types = {"fasting", "post_meal", "bedtime", "random"}
    if body.reading_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"reading_type must be one of {valid_types}")
    if body.glucose_level <= 0:
        raise HTTPException(status_code=400, detail="glucose_level must be positive")

    recorded_at = body.recorded_at or datetime.now(timezone.utc).isoformat()

    async with get_db() as db:
        cursor = await db.execute(
            "INSERT INTO blood_glucose_readings (user_id, glucose_level, reading_type, notes, recorded_at) VALUES (?, ?, ?, ?, ?)",
            (current_user["id"], body.glucose_level, body.reading_type, body.notes, recorded_at),
        )
        await db.commit()
        row_id = cursor.lastrowid
        cursor2 = await db.execute("SELECT * FROM blood_glucose_readings WHERE id = ?", (row_id,))
        row = await cursor2.fetchone()

    return ReadingOut(**dict(row))


@router.get("/range", response_model=list[ReadingOut])
async def readings_by_range(
    start: str = Query(..., description="Start date YYYY-MM-DD"),
    end: str = Query(..., description="End date YYYY-MM-DD"),
    current_user: dict = Depends(get_current_user),
):
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT * FROM blood_glucose_readings WHERE user_id = ? AND DATE(recorded_at) BETWEEN ? AND ? ORDER BY recorded_at DESC",
            (current_user["id"], start, end),
        )
        rows = await cursor.fetchall()
    return [ReadingOut(**dict(r)) for r in rows]


@router.get("/{reading_id}", response_model=ReadingOut)
async def get_reading(reading_id: int, current_user: dict = Depends(get_current_user)):
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT * FROM blood_glucose_readings WHERE id = ? AND user_id = ?",
            (reading_id, current_user["id"]),
        )
        row = await cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Reading not found")
    return ReadingOut(**dict(row))


@router.delete("/{reading_id}")
async def delete_reading(reading_id: int, current_user: dict = Depends(get_current_user)):
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id FROM blood_glucose_readings WHERE id = ? AND user_id = ?",
            (reading_id, current_user["id"]),
        )
        row = await cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Reading not found")
        await db.execute("DELETE FROM blood_glucose_readings WHERE id = ?", (reading_id,))
        await db.commit()

    return {"deleted": True}
