import json
import os
import statistics
from fastapi import APIRouter, Depends, HTTPException
import anthropic
from dotenv import load_dotenv

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import AgentChatRequest, AgentChatResponse

load_dotenv()

router = APIRouter()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are a health assistant specialized in blood glucose analysis.

IMPORTANT RULES:
1. You MUST call the provided tools to fetch real user data before drawing any conclusions.
2. Never invent or assume data. Always use tool results.
3. After gathering data, provide clear, actionable insights about patterns and trends.
4. Normal ranges: fasting 70-100 mg/dL, post-meal <140 mg/dL, bedtime 100-140 mg/dL.
5. Always remind the user you are not a doctor and they should consult a healthcare professional.
6. Be warm, encouraging, and specific when referencing actual numbers from the data."""

TOOL_DEFINITIONS = [
    {
        "name": "get_recent_readings",
        "description": "Fetches the most recent blood glucose readings for the user.",
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "Number of readings to return (max 100). Defaults to 20.",
                }
            },
            "required": [],
        },
    },
    {
        "name": "get_readings_by_date_range",
        "description": "Fetches all blood glucose readings within a date range.",
        "input_schema": {
            "type": "object",
            "properties": {
                "start_date": {"type": "string", "description": "Start date in YYYY-MM-DD format."},
                "end_date": {"type": "string", "description": "End date in YYYY-MM-DD format."},
            },
            "required": ["start_date", "end_date"],
        },
    },
    {
        "name": "get_statistics",
        "description": (
            "Computes statistics over the user's blood glucose readings: average, min, max, "
            "standard deviation, count, and percentage of readings in normal range (70-140 mg/dL). "
            "Optionally filter to a date range."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "start_date": {"type": "string", "description": "Optional start date YYYY-MM-DD."},
                "end_date": {"type": "string", "description": "Optional end date YYYY-MM-DD."},
            },
            "required": [],
        },
    },
    {
        "name": "get_readings_by_type",
        "description": "Fetches all readings of a specific type for the user.",
        "input_schema": {
            "type": "object",
            "properties": {
                "reading_type": {
                    "type": "string",
                    "enum": ["fasting", "post_meal", "bedtime", "random"],
                    "description": "The reading type to filter by.",
                }
            },
            "required": ["reading_type"],
        },
    },
]


async def handle_get_recent_readings(user_id: int, limit: int = 20) -> list[dict]:
    limit = min(limit, 100)
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, glucose_level, reading_type, notes, recorded_at FROM blood_glucose_readings "
            "WHERE user_id = ? ORDER BY recorded_at DESC LIMIT ?",
            (user_id, limit),
        )
        rows = await cursor.fetchall()
    return [dict(r) for r in rows]


async def handle_get_readings_by_date_range(user_id: int, start_date: str, end_date: str) -> list[dict]:
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, glucose_level, reading_type, notes, recorded_at FROM blood_glucose_readings "
            "WHERE user_id = ? AND DATE(recorded_at) BETWEEN ? AND ? ORDER BY recorded_at DESC",
            (user_id, start_date, end_date),
        )
        rows = await cursor.fetchall()
    return [dict(r) for r in rows]


async def handle_get_statistics(user_id: int, start_date: str = None, end_date: str = None) -> dict:
    async with get_db() as db:
        if start_date and end_date:
            cursor = await db.execute(
                "SELECT glucose_level FROM blood_glucose_readings "
                "WHERE user_id = ? AND DATE(recorded_at) BETWEEN ? AND ?",
                (user_id, start_date, end_date),
            )
        else:
            cursor = await db.execute(
                "SELECT glucose_level FROM blood_glucose_readings WHERE user_id = ?",
                (user_id,),
            )
        rows = await cursor.fetchall()

    if not rows:
        return {"count": 0, "message": "No readings found for the specified period."}

    levels = [r["glucose_level"] for r in rows]
    in_range = sum(1 for v in levels if 70 <= v <= 140)

    result = {
        "count": len(levels),
        "average": round(statistics.mean(levels), 1),
        "min": round(min(levels), 1),
        "max": round(max(levels), 1),
        "in_range_pct": round(in_range / len(levels) * 100, 1),
    }
    if len(levels) >= 2:
        result["std_dev"] = round(statistics.stdev(levels), 1)
    if start_date and end_date:
        result["period"] = f"{start_date} to {end_date}"

    return result


async def handle_get_readings_by_type(user_id: int, reading_type: str) -> list[dict]:
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, glucose_level, reading_type, notes, recorded_at FROM blood_glucose_readings "
            "WHERE user_id = ? AND reading_type = ? ORDER BY recorded_at DESC",
            (user_id, reading_type),
        )
        rows = await cursor.fetchall()
    return [dict(r) for r in rows]


async def dispatch_tool(user_id: int, name: str, inputs: dict):
    match name:
        case "get_recent_readings":
            return await handle_get_recent_readings(user_id, **inputs)
        case "get_readings_by_date_range":
            return await handle_get_readings_by_date_range(user_id, **inputs)
        case "get_statistics":
            return await handle_get_statistics(user_id, **inputs)
        case "get_readings_by_type":
            return await handle_get_readings_by_type(user_id, **inputs)
        case _:
            return {"error": f"Unknown tool: {name}"}


async def run_agent(user_id: int, user_message: str) -> AgentChatResponse:
    messages = [{"role": "user", "content": user_message}]
    tool_calls_log = []
    max_iterations = 10

    for _ in range(max_iterations):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            tools=TOOL_DEFINITIONS,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            text = next(
                (b.text for b in response.content if b.type == "text"), ""
            )
            return AgentChatResponse(reply=text, tool_calls_made=tool_calls_log)

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    tool_calls_log.append(block.name)
                    result = await dispatch_tool(user_id, block.name, block.input)
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": json.dumps(result),
                        }
                    )

            messages.append({"role": "user", "content": tool_results})
        else:
            break

    return AgentChatResponse(
        reply="I wasn't able to complete the analysis. Please try again.",
        tool_calls_made=tool_calls_log,
    )


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(body: AgentChatRequest, current_user: dict = Depends(get_current_user)):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    return await run_agent(current_user["id"], body.message)
