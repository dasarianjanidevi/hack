"""
Instructor Router — EduOS AI
============================
Endpoints for the Instructor Dashboard:
  GET  /api/instructor/students                       — all students list
  GET  /api/instructor/progress/{student_id}/{m}/{y}  — load saved progress for a month
  POST /api/instructor/progress                        — save/upsert topic rows
  POST /api/instructor/report                          — generate AI analysis report
  GET  /api/instructor/report/{student_id}/{m}/{y}    — retrieve cached report
  GET  /api/instructor/compare/{student_id}/{m}/{y}   — compare with previous month

Student Management (used by main router for student CRUD):
  POST /api/students   — create a new student (writes to CSV)
"""
import os
import sys
import csv
import json
import sqlite3
from datetime import datetime
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from db import get_connection
from llm_client import chat, MOCK_MODE

router = APIRouter(prefix="/api/instructor", tags=["instructor"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

TOPICS = [
    "Arrays",
    "Linked Lists",
    "Recursion",
    "Trees",
    "Sorting",
    "Dynamic Programming",
    "Graphs",
]


# ── Pydantic Models ────────────────────────────────────────────────────────────

class TopicEntry(BaseModel):
    topic: str
    quiz_score: Optional[float] = None
    videos_completed: bool = False
    coding_part1: bool = False
    coding_part2: bool = False
    notes: str = ""


class SaveProgressRequest(BaseModel):
    student_id: str
    month: int
    year: int
    topics: list[TopicEntry]


class GenerateReportRequest(BaseModel):
    student_id: str
    month: int
    year: int


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_student(student_id: str) -> dict | None:
    filepath = os.path.join(DATA_DIR, "students.csv")
    with open(filepath, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["student_id"] == student_id:
                return dict(row)
    return None


def _load_progress(student_id: str, month: int, year: int) -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT topic, quiz_score, videos_completed, coding_part1, coding_part2, notes
            FROM monthly_progress
            WHERE student_id = ? AND month = ? AND year = ?
            ORDER BY topic
            """,
            (student_id, month, year),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def _compute_report(student: dict, current: list[dict], previous: list[dict]) -> dict:
    """
    Compute the AI analysis report.
    Works in both mock mode (pure math) and live mode (uses LLM for recommendations).
    """
    if not current:
        return {"error": "No progress data found for this month."}

    # ── Compute metrics ────────────────────────────────────────────────────────
    total_topics = len(current)
    scored_topics = [t for t in current if t["quiz_score"] is not None]
    avg_score = (
        sum(t["quiz_score"] for t in scored_topics) / len(scored_topics)
        if scored_topics else 0
    )

    videos_done = sum(1 for t in current if t["videos_completed"])
    coding1_done = sum(1 for t in current if t["coding_part1"])
    coding2_done = sum(1 for t in current if t["coding_part2"])

    # Completion: each topic has 4 items (video, c1, c2, quiz)
    total_items = total_topics * 4
    completed_items = (
        videos_done + coding1_done + coding2_done +
        sum(1 for t in current if t["quiz_score"] is not None and t["quiz_score"] >= 60)
    )
    completion_pct = round(completed_items / total_items * 100, 1) if total_items > 0 else 0

    # Weak topics: quiz score < 60 or no quiz done + nothing completed
    weak_topics = []
    pending_tasks = []
    for t in current:
        score = t["quiz_score"]
        is_weak = (score is not None and score < 60) or (
            score is None and not t["videos_completed"]
        )
        if is_weak:
            weak_topics.append(t["topic"])
        if not t["videos_completed"]:
            pending_tasks.append(f"Complete video for {t['topic']}")
        if not t["coding_part1"]:
            pending_tasks.append(f"Finish Coding Part 1 for {t['topic']}")
        if not t["coding_part2"]:
            pending_tasks.append(f"Finish Coding Part 2 for {t['topic']}")

    # Risk level
    if len(weak_topics) >= 3 or (avg_score < 55 and avg_score > 0):
        risk_level = "High"
        risk_color = "#ef4444"
    elif len(weak_topics) >= 1 or (avg_score < 70 and avg_score > 0):
        risk_level = "Medium"
        risk_color = "#f59e0b"
    else:
        risk_level = "Low"
        risk_color = "#10b981"

    # Month-over-month improvement
    improvement = None
    improved_topics = []
    declined_topics = []
    if previous:
        prev_map = {p["topic"]: p for p in previous}
        prev_avg = (
            sum(p["quiz_score"] for p in previous if p["quiz_score"] is not None)
            / max(1, len([p for p in previous if p["quiz_score"] is not None]))
        )
        improvement = round(avg_score - prev_avg, 1)
        for t in current:
            if t["topic"] in prev_map and t["quiz_score"] is not None:
                prev_score = prev_map[t["topic"]].get("quiz_score")
                if prev_score is not None:
                    diff = t["quiz_score"] - prev_score
                    if diff > 5:
                        improved_topics.append(f"{t['topic']} (+{diff:.0f})")
                    elif diff < -5:
                        declined_topics.append(f"{t['topic']} ({diff:.0f})")

    # ── Generate recommendations ───────────────────────────────────────────────
    if MOCK_MODE or not weak_topics:
        recommendations = _rule_based_recommendations(
            weak_topics, pending_tasks, avg_score, risk_level,
            student.get("attendance_pct", "N/A")
        )
    else:
        recommendations = _llm_recommendations(
            student, current, weak_topics, avg_score, risk_level
        )

    return {
        "student_id": student["student_id"],
        "student_name": student["name"],
        "batch": student["batch"],
        "month": current[0]["notes"],  # placeholder
        "overall_completion_pct": completion_pct,
        "average_quiz_score": round(avg_score, 1),
        "weak_topics": weak_topics,
        "pending_tasks": pending_tasks[:8],  # top 8
        "improvement_vs_last_month": improvement,
        "improved_topics": improved_topics,
        "declined_topics": declined_topics,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "videos_completed": f"{videos_done}/{total_topics}",
        "coding_part1_done": f"{coding1_done}/{total_topics}",
        "coding_part2_done": f"{coding2_done}/{total_topics}",
        "recommendations": recommendations,
        "generated_at": datetime.now().isoformat(),
    }


def _rule_based_recommendations(
    weak_topics, pending_tasks, avg_score, risk_level, attendance
) -> list[str]:
    recs = []
    if weak_topics:
        recs.append(
            f"Schedule a focused revision session for: {', '.join(weak_topics[:3])}. "
            "These topics show quiz scores below 60% — immediate intervention required."
        )
    if avg_score > 0 and avg_score < 65:
        recs.append(
            "Overall quiz average is below 65%. Consider conducting a mid-module review "
            "session to reinforce fundamentals before proceeding to advanced topics."
        )
    if pending_tasks:
        video_pending = [t for t in pending_tasks if "video" in t.lower()]
        if video_pending:
            recs.append(
                f"Student has {len(video_pending)} incomplete video lessons. "
                "Encourage completion of all videos before the next quiz attempt."
            )
    try:
        att = float(attendance)
        if att < 65:
            recs.append(
                f"Attendance is critically low at {att}%. Personal outreach is recommended — "
                "schedule a 1-on-1 check-in to identify barriers to attendance."
            )
        elif att < 75:
            recs.append(
                f"Attendance at {att}% is below the 75% threshold. "
                "Send a reminder about the attendance policy and offer support."
            )
    except (ValueError, TypeError):
        pass
    if risk_level == "High":
        recs.append(
            "HIGH RISK student — recommend escalating to Academic Head and creating "
            "a formal academic support plan with weekly check-ins."
        )
    if not recs:
        recs.append("Student is performing well. Continue monitoring and maintain current trajectory.")
    return recs


def _llm_recommendations(student, current, weak_topics, avg_score, risk_level) -> list[str]:
    try:
        topic_summary = "\n".join(
            f"- {t['topic']}: score={t['quiz_score']}, video={'done' if t['videos_completed'] else 'pending'}, "
            f"coding1={'done' if t['coding_part1'] else 'pending'}, coding2={'done' if t['coding_part2'] else 'pending'}"
            for t in current
        )
        prompt = f"""Generate 3-4 specific, actionable instructor recommendations for this student:

Student: {student['name']} (Batch: {student['batch']}, Attendance: {student.get('attendance_pct', 'N/A')}%)
Average Quiz Score: {avg_score:.1f}
Weak Topics: {', '.join(weak_topics) if weak_topics else 'None'}
Risk Level: {risk_level}

Progress:
{topic_summary}

Return a JSON array of recommendation strings. Each must be specific and actionable, not generic.
Example: ["Schedule a Recursion lab session — student scored 45% across 3 attempts...", ...]
Return ONLY the JSON array."""
        raw = chat("You are an education advisor. Give specific instructor recommendations.", prompt, 0.4)
        raw = raw.strip()
        if raw.startswith("["):
            return json.loads(raw)
        return _rule_based_recommendations(weak_topics, [], avg_score, risk_level, student.get("attendance_pct", ""))
    except Exception:
        return _rule_based_recommendations(weak_topics, [], avg_score, risk_level, student.get("attendance_pct", ""))


# ── Routes ─────────────────────────────────────────────────────────────────────

import random


class GenerateDataRequest(BaseModel):
    student_id: str
    month: int
    year: int
    performance_level: Optional[str] = "auto"  # "strong" | "average" | "weak" | "auto"


@router.post("/generate")
async def generate_student_data(req: GenerateDataRequest):
    """
    Auto-generate realistic monthly progress data for a student and save it.
    Simulates: videos watched, coding completions, quiz scores based on
    attendance and optional performance level hint.
    """
    student = _get_student(req.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{req.student_id}' not found.")

    # Determine base engagement from attendance
    try:
        attendance = float(student.get("attendance_pct", 75))
    except (ValueError, TypeError):
        attendance = 75.0

    # Override with explicit performance level
    level = req.performance_level or "auto"
    if level == "strong":
        base_score = random.uniform(78, 95)
        video_prob = 0.95
        c1_prob = 0.92
        c2_prob = 0.88
    elif level == "weak":
        base_score = random.uniform(30, 58)
        video_prob = 0.40
        c1_prob = 0.35
        c2_prob = 0.25
    elif level == "average":
        base_score = random.uniform(58, 78)
        video_prob = 0.72
        c1_prob = 0.65
        c2_prob = 0.55
    else:  # auto — derive from attendance
        base_score = attendance * 0.82 + random.uniform(-8, 8)
        base_score = max(20, min(98, base_score))
        video_prob = min(0.97, attendance / 100 * 1.1)
        c1_prob = video_prob * 0.88
        c2_prob = c1_prob * 0.82

    conn = get_connection()
    generated = []
    try:
        for topic in TOPICS:
            # Each topic gets slightly varied scores for realism
            topic_variance = random.uniform(-12, 12)
            quiz_score = round(max(0, min(100, base_score + topic_variance)), 1)
            videos_done = random.random() < video_prob
            # Coding done only if videos done (realistic dependency)
            c1_done = videos_done and random.random() < c1_prob
            c2_done = c1_done and random.random() < c2_prob
            notes = ""

            conn.execute(
                """
                INSERT INTO monthly_progress
                    (student_id, month, year, topic, quiz_score, videos_completed,
                     coding_part1, coding_part2, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(student_id, month, year, topic)
                DO UPDATE SET
                    quiz_score       = excluded.quiz_score,
                    videos_completed = excluded.videos_completed,
                    coding_part1     = excluded.coding_part1,
                    coding_part2     = excluded.coding_part2,
                    notes            = excluded.notes,
                    created_at       = CURRENT_TIMESTAMP
                """,
                (
                    req.student_id, req.month, req.year, topic,
                    quiz_score, int(videos_done), int(c1_done), int(c2_done), notes,
                ),
            )
            generated.append({
                "topic": topic,
                "quiz_score": quiz_score,
                "videos_completed": videos_done,
                "coding_part1": c1_done,
                "coding_part2": c2_done,
            })
        conn.commit()
    finally:
        conn.close()

    return {
        "status": "generated",
        "student_id": req.student_id,
        "month": req.month,
        "year": req.year,
        "performance_level": level,
        "rows_generated": len(generated),
        "topics": generated,
    }


@router.get("/students")
async def get_students():
    """List all students for the instructor dropdown."""
    filepath = os.path.join(DATA_DIR, "students.csv")
    students = []
    with open(filepath, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            students.append({
                "student_id": row["student_id"],
                "name": row["name"],
                "batch": row["batch"],
                "attendance_pct": row["attendance_pct"],
            })
    return {"students": students, "topics": TOPICS}


@router.get("/progress/{student_id}/{month}/{year}")
async def load_progress(student_id: str, month: int, year: int):
    """Load saved monthly progress for a student."""
    student = _get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

    rows = _load_progress(student_id, month, year)

    # Fill in missing topics with empty entries
    saved_topics = {r["topic"] for r in rows}
    for topic in TOPICS:
        if topic not in saved_topics:
            rows.append({
                "topic": topic,
                "quiz_score": None,
                "videos_completed": 0,
                "coding_part1": 0,
                "coding_part2": 0,
                "notes": "",
            })

    # Sort by TOPICS order
    topic_order = {t: i for i, t in enumerate(TOPICS)}
    rows.sort(key=lambda r: topic_order.get(r["topic"], 99))

    return {
        "student": student,
        "month": month,
        "year": year,
        "progress": rows,
        "has_data": len(saved_topics) > 0,
    }


@router.post("/progress")
async def save_progress(req: SaveProgressRequest):
    """Upsert topic progress rows for a student/month/year."""
    student = _get_student(req.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{req.student_id}' not found.")

    conn = get_connection()
    try:
        for entry in req.topics:
            conn.execute(
                """
                INSERT INTO monthly_progress
                    (student_id, month, year, topic, quiz_score, videos_completed,
                     coding_part1, coding_part2, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(student_id, month, year, topic)
                DO UPDATE SET
                    quiz_score       = excluded.quiz_score,
                    videos_completed = excluded.videos_completed,
                    coding_part1     = excluded.coding_part1,
                    coding_part2     = excluded.coding_part2,
                    notes            = excluded.notes,
                    created_at       = CURRENT_TIMESTAMP
                """,
                (
                    req.student_id,
                    req.month,
                    req.year,
                    entry.topic,
                    entry.quiz_score,
                    int(entry.videos_completed),
                    int(entry.coding_part1),
                    int(entry.coding_part2),
                    entry.notes,
                ),
            )
        conn.commit()
        return {"status": "saved", "rows": len(req.topics), "student_id": req.student_id}
    finally:
        conn.close()


@router.post("/report")
async def generate_report(req: GenerateReportRequest):
    """Generate an AI analysis report for a student's monthly progress."""
    student = _get_student(req.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{req.student_id}' not found.")

    current = _load_progress(req.student_id, req.month, req.year)
    if not current:
        raise HTTPException(
            status_code=400,
            detail="No progress data found for this month. Please save progress first.",
        )

    # Load previous month's data for comparison
    prev_month = req.month - 1 if req.month > 1 else 12
    prev_year = req.year if req.month > 1 else req.year - 1
    previous = _load_progress(req.student_id, prev_month, prev_year)

    report = _compute_report(student, current, previous)

    # Cache the report
    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT INTO ai_reports (student_id, month, year, report_json)
            VALUES (?, ?, ?, ?)
            """,
            (req.student_id, req.month, req.year, json.dumps(report)),
        )
        conn.commit()
    finally:
        conn.close()

    return report


@router.get("/report/{student_id}/{month}/{year}")
async def get_cached_report(student_id: str, month: int, year: int):
    """Retrieve the most recent cached AI report."""
    conn = get_connection()
    try:
        row = conn.execute(
            """
            SELECT report_json FROM ai_reports
            WHERE student_id = ? AND month = ? AND year = ?
            ORDER BY created_at DESC LIMIT 1
            """,
            (student_id, month, year),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No report found. Generate one first.")
        return json.loads(row["report_json"])
    finally:
        conn.close()


@router.get("/compare/{student_id}/{month}/{year}")
async def compare_months(student_id: str, month: int, year: int):
    """Return current vs previous month progress for comparison."""
    student = _get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

    current = _load_progress(student_id, month, year)
    prev_month = month - 1 if month > 1 else 12
    prev_year = year if month > 1 else year - 1
    previous = _load_progress(student_id, prev_month, prev_year)

    # Build comparison map
    prev_map = {p["topic"]: p for p in previous}
    comparison = []
    for row in current:
        prev = prev_map.get(row["topic"], {})
        score_change = None
        if row["quiz_score"] is not None and prev.get("quiz_score") is not None:
            score_change = round(row["quiz_score"] - prev["quiz_score"], 1)
        comparison.append({
            "topic": row["topic"],
            "current_score": row["quiz_score"],
            "previous_score": prev.get("quiz_score"),
            "score_change": score_change,
            "current_video": bool(row["videos_completed"]),
            "previous_video": bool(prev.get("videos_completed", 0)),
            "current_coding1": bool(row["coding_part1"]),
            "previous_coding1": bool(prev.get("coding_part1", 0)),
            "current_coding2": bool(row["coding_part2"]),
            "previous_coding2": bool(prev.get("coding_part2", 0)),
        })

    return {
        "student": student,
        "current_month": month,
        "current_year": year,
        "previous_month": prev_month,
        "previous_year": prev_year,
        "has_previous_data": len(previous) > 0,
        "comparison": comparison,
    }
