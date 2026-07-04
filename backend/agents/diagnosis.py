"""
Diagnosis Agent
---------------
Given a student name, retrieves quiz and engagement data via RAG
and identifies the weakest topic with supporting evidence.
"""
import os
import sys
import json
import csv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dataclasses import dataclass, field, asdict
from typing import Any
from rag.retriever import retrieve
from llm_client import chat, parse_json_response, MOCK_MODE
from mock_responses import get_mock_response

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


@dataclass
class DiagnosisResult:
    student_id: str
    student_name: str
    batch: str
    attendance_pct: str
    weak_topic: str
    evidence: list[str]
    quiz_scores: dict[str, Any]
    confidence: float
    reasoning: str
    risk_level: str  # "high" | "medium" | "low"

    def to_dict(self) -> dict:
        return asdict(self)


def _lookup_student(name: str) -> dict | None:
    """Find a student record by name from the CSV."""
    filepath = os.path.join(DATA_DIR, "students.csv")
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        name_lower = name.strip().lower()
        for row in reader:
            if row["name"].strip().lower() == name_lower:
                return row
    return None


def _get_quiz_scores(student_id: str) -> dict:
    """Return avg quiz scores per topic for a student."""
    filepath = os.path.join(DATA_DIR, "quiz_results.csv")
    topic_scores: dict[str, list[int]] = {}
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["student_id"] == student_id:
                topic = row["topic"]
                if topic not in topic_scores:
                    topic_scores[topic] = []
                topic_scores[topic].append(int(row["score"]))
    return {topic: round(sum(scores) / len(scores), 1) for topic, scores in topic_scores.items()}


async def run_diagnosis(student_name: str) -> DiagnosisResult:
    """
    Main entry point. Returns a DiagnosisResult for the given student.
    """
    # 1. Look up student record
    student = _lookup_student(student_name)
    if not student:
        raise ValueError(f"Student '{student_name}' not found in database.")

    student_id = student["student_id"]

    # 2. Retrieve quiz evidence from RAG
    quiz_chunks = retrieve(
        query=f"quiz scores performance results for student {student_name} {student_id}",
        source_filter="quiz_results",
        student_id_filter=student_id,
        n=8,
    )

    # 3. Retrieve video engagement evidence
    video_chunks = retrieve(
        query=f"video engagement lesson completion for student {student_name} {student_id}",
        source_filter="video_engagement",
        student_id_filter=student_id,
        n=6,
    )

    # 4. Get raw quiz scores for structured data
    quiz_scores = _get_quiz_scores(student_id)

    # 5. Build context and call LLM
    context = "\n".join([
        "=== Quiz Performance ===",
        *quiz_chunks,
        "\n=== Video Engagement ===",
        *video_chunks,
    ])

    system_prompt = """You are EduOS AI's Diagnosis Agent — an expert educational analytics system.
Your role is to analyze student performance data and identify the topic a student is struggling with most.
Be precise, evidence-based, and return valid JSON only. Do not guess — base conclusions strictly on the data."""

    user_prompt = f"""Analyze this student's academic performance data and identify their weakest topic.

Student: {student_name} (ID: {student_id}, Batch: {student['batch']}, Attendance: {student['attendance_pct']}%)

Retrieved Evidence:
{context}

Structured Quiz Averages: {json.dumps(quiz_scores)}

Return a JSON object with EXACTLY this structure (no extra text):
{{
  "weak_topic": "the specific topic name",
  "evidence": ["evidence point 1", "evidence point 2", "evidence point 3"],
  "confidence": 0.0-1.0,
  "reasoning": "2-3 sentence explanation of why this topic was identified",
  "risk_level": "high" or "medium" or "low"
}}

Confidence guide:
- high (0.85+): Multiple failing data points across quiz + video + assignments
- medium (0.65-0.84): Clear quiz failure but limited other evidence
- low (below 0.65): Borderline or inconclusive data
"""

    if MOCK_MODE:
        m = get_mock_response("diagnosis")
        return DiagnosisResult(
            student_id=student_id,
            student_name=student_name,
            batch=student["batch"],
            attendance_pct=student["attendance_pct"],
            weak_topic=m["weak_topic"],
            evidence=m["evidence"],
            quiz_scores=quiz_scores,
            confidence=float(m["confidence"]),
            reasoning=m["reasoning"],
            risk_level=m["risk_level"],
        )

    raw = chat(system_prompt, user_prompt, temperature=0.2)
    parsed = parse_json_response(raw)

    return DiagnosisResult(
        student_id=student_id,
        student_name=student_name,
        batch=student["batch"],
        attendance_pct=student["attendance_pct"],
        weak_topic=parsed["weak_topic"],
        evidence=parsed["evidence"],
        quiz_scores=quiz_scores,
        confidence=float(parsed["confidence"]),
        reasoning=parsed["reasoning"],
        risk_level=parsed["risk_level"],
    )
