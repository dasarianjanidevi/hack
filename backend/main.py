"""
EduOS AI — FastAPI Backend
==========================
Endpoints:
  POST /api/run              — Start a pipeline run, returns run_id + SSE stream
  GET  /api/stream/{run_id}  — SSE stream for existing run
  GET  /api/result/{run_id}  — Full JSON result after completion
  GET  /api/students         — List all students for the frontend dropdown
"""
import os
import sys
import uuid
import csv
import asyncio
import json
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from pipeline import run_pipeline, get_result
from db import init_db
from routers.instructor import router as instructor_router

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# ── Active runs store (run_id → async generator) ──────────────────────────────
_active_runs: dict[str, object] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # Ensure SQLite tables exist
    print("[START] EduOS AI backend starting...")
    yield
    print("[STOP] EduOS AI backend shutting down.")


app = FastAPI(
    title="EduOS AI",
    description="Multi-agent student success pipeline",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(instructor_router)


# ── Models ────────────────────────────────────────────────────────────────────

class RunRequest(BaseModel):
    student_name: str


class RunResponse(BaseModel):
    run_id: str
    student_name: str
    stream_url: str


class CreateStudentRequest(BaseModel):
    student_id: str
    name: str
    batch: str
    attendance_pct: int


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_all_students(query: str = "") -> list[dict]:
    filepath = os.path.join(DATA_DIR, "students.csv")
    students = []
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            students.append({
                "student_id": row["student_id"],
                "name": row["name"],
                "batch": row["batch"],
                "attendance_pct": row["attendance_pct"],
            })
    if query:
        q = query.strip().lower()
        students = [
            s for s in students
            if q in s["student_id"].lower() or q in s["name"].lower() or q in s["batch"].lower()
        ]
    return students


def student_id_exists(student_id: str) -> bool:
    filepath = os.path.join(DATA_DIR, "students.csv")
    with open(filepath, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["student_id"] == student_id:
                return True
    return False


def append_student_to_csv(student: CreateStudentRequest):
    filepath = os.path.join(DATA_DIR, "students.csv")
    with open(filepath, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            student.student_id,
            student.name,
            student.batch,
            student.attendance_pct,
        ])


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "EduOS AI",
        "version": "1.0.0",
        "status": "online",
        "endpoints": ["/api/students", "/api/run", "/api/stream/{run_id}", "/api/result/{run_id}"],
    }


@app.get("/api/students")
async def list_students(q: str = ""):
    """Return all students for the dropdown selector. Supports ?q= search by roll no or name."""
    students = get_all_students(query=q)
    return {"students": students, "count": len(students)}


@app.post("/api/students")
async def create_student(request: CreateStudentRequest):
    """Create a new student and append to students.csv."""
    # Validate student_id format
    if not request.student_id.strip():
        raise HTTPException(status_code=400, detail="student_id cannot be empty.")
    if not request.name.strip():
        raise HTTPException(status_code=400, detail="Student name cannot be empty.")
    if student_id_exists(request.student_id.strip()):
        raise HTTPException(status_code=409, detail=f"Student ID '{request.student_id}' already exists.")
    if not (0 <= request.attendance_pct <= 100):
        raise HTTPException(status_code=400, detail="attendance_pct must be between 0 and 100.")

    student_data = CreateStudentRequest(
        student_id=request.student_id.strip().upper(),
        name=request.name.strip(),
        batch=request.batch.strip(),
        attendance_pct=request.attendance_pct,
    )
    append_student_to_csv(student_data)
    return {
        "status": "created",
        "student": {
            "student_id": student_data.student_id,
            "name": student_data.name,
            "batch": student_data.batch,
            "attendance_pct": str(student_data.attendance_pct),
        },
    }


@app.post("/api/run")
async def start_run(request: RunRequest):
    """
    Start a new pipeline run. Returns run_id immediately.
    Client should then connect to /api/stream/{run_id} for live events.
    """
    run_id = str(uuid.uuid4())

    async def sse_generator():
        async for event in run_pipeline(request.student_name, run_id):
            yield event

    _active_runs[run_id] = sse_generator()

    return RunResponse(
        run_id=run_id,
        student_name=request.student_name,
        stream_url=f"/api/stream/{run_id}",
    )


@app.get("/api/stream/{run_id}")
async def stream_run(run_id: str):
    """
    SSE endpoint — streams agent step events for a running pipeline.
    Each event: data: { "step": "...", "status": "running"|"done"|"error", "data": {...} }
    """
    generator = _active_runs.get(run_id)
    if generator is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    async def event_stream():
        async for chunk in generator:
            yield chunk
        # Cleanup
        _active_runs.pop(run_id, None)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/run/stream")
async def run_and_stream(request: RunRequest):
    """
    Combined endpoint: starts pipeline AND streams SSE in a single request.
    Useful for clients that can't make two sequential requests easily.
    """
    run_id = str(uuid.uuid4())

    async def event_stream():
        async for event in run_pipeline(request.student_name, run_id):
            yield event

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/result/{run_id}")
async def get_run_result(run_id: str):
    """Return the full pipeline result after completion."""
    result = get_result(run_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Result for run '{run_id}' not found. Pipeline may still be running or run_id is invalid.",
        )
    return result


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
