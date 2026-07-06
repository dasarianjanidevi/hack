"""
Critic Agent
------------
Cross-verifies the Diagnosis result against a SECOND data source
(assignments + video engagement that the Diagnosis Agent did NOT primarily use).
Produces a confidence score and explicit verification verdict.

This is the key differentiator — it shows the system self-checks before acting.
"""
import os
import sys
import json
import csv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dataclasses import dataclass, asdict
from agents.diagnosis import DiagnosisResult
from rag.retriever import retrieve
from llm_client import chat, parse_json_response, MOCK_MODE
from mock_responses import get_mock_response

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


@dataclass
class CriticResult:
    verified: bool
    confidence: float           # 0.0 – 1.0, updated after cross-check
    original_confidence: float  # Diagnosis Agent's confidence
    verdict: str                # "CONFIRMED" | "CHALLENGED" | "INCONCLUSIVE"
    supporting_evidence: list[str]
    contradicting_evidence: list[str]
    reason: str
    recommendation: str         # What to do next

    def to_dict(self) -> dict:
        return asdict(self)


def _get_assignment_data(student_id: str, topic: str) -> list[dict]:
    """Pull assignment records for a specific student and topic."""
    filepath = os.path.join(DATA_DIR, "assignments.csv")
    records = []
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["student_id"] == student_id:
                records.append(row)
    return records


def _get_video_data(student_id: str, topic: str) -> list[dict]:
    """Pull video engagement for a specific student and topic."""
    filepath = os.path.join(DATA_DIR, "video_engagement.csv")
    records = []
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["student_id"] == student_id:
                records.append(row)
    return records


async def run_critic(diagnosis: DiagnosisResult) -> CriticResult:
    """
    Cross-checks the diagnosis using secondary data sources.
    Diagnosis used: quiz + video engagement
    Critic uses: assignments + video (different angle) + curriculum context
    """
    student_id = diagnosis.student_id
    weak_topic = diagnosis.weak_topic

    # Short-circuit in mock mode — skip RAG/ChromaDB calls
    if MOCK_MODE:
        m = get_mock_response("critic")
        return CriticResult(
            verified=bool(m["verified"]),
            confidence=float(m["confidence"]),
            original_confidence=diagnosis.confidence,
            verdict=m["verdict"],
            supporting_evidence=m.get("supporting_evidence", []),
            contradicting_evidence=m.get("contradicting_evidence", []),
            reason=m["reason"],
            recommendation=m["recommendation"],
        )

    # 1. Retrieve assignment evidence (primary cross-check source)
    assignment_chunks = retrieve(
        query=f"assignment submission completion status {weak_topic} {diagnosis.student_name}",
        source_filter="assignments",
        student_id_filter=student_id,
        n=8,
    )

    # 2. Retrieve curriculum context about the weak topic
    curriculum_chunks = retrieve(
        query=f"{weak_topic} topic prerequisites difficulty instructor note warning",
        source_filter="curriculum",
        n=4,
    )

    # 3. Get raw data for structured context
    all_assignments = _get_assignment_data(student_id, weak_topic)
    all_videos = _get_video_data(student_id, weak_topic)

    assignments_str = json.dumps(all_assignments, indent=2)
    videos_str = json.dumps(all_videos, indent=2)

    context = "\n".join([
        "=== Assignment Records (Cross-Source) ===",
        *assignment_chunks,
        "\n=== Curriculum Context ===",
        *curriculum_chunks,
    ])

    system_prompt = """You are EduOS AI's Critic Agent — an independent verification system.
Your job is to challenge or confirm a diagnosis made by another AI agent.
You have access to DIFFERENT data sources than the Diagnosis Agent used.
Be skeptical. Look for contradicting evidence. Your verification adds trust to the system.
Return valid JSON only."""

    user_prompt = f"""A Diagnosis Agent has flagged this student:

ORIGINAL DIAGNOSIS:
- Student: {diagnosis.student_name} (ID: {student_id}, Batch: {diagnosis.batch})
- Identified Weak Topic: {weak_topic}
- Diagnosis Confidence: {diagnosis.confidence}
- Diagnosis Evidence: {json.dumps(diagnosis.evidence)}
- Diagnosis Reasoning: {diagnosis.reasoning}

YOUR CROSS-SOURCE EVIDENCE (assignments + curriculum — different from what Diagnosis used):
{context}

RAW ASSIGNMENT DATA:
{assignments_str}

RAW VIDEO ENGAGEMENT DATA:
{videos_str}

Cross-verify this diagnosis. Look for:
1. Does the assignment data CONFIRM or CONTRADICT the weak topic?
2. Does the curriculum note that {weak_topic} is a known difficult/high-risk topic?
3. Is there any evidence the student performed WELL in {weak_topic} that the Diagnosis may have missed?

Return EXACTLY this JSON (no extra text):
{{
  "verified": true or false,
  "confidence": 0.0-1.0,
  "verdict": "CONFIRMED" or "CHALLENGED" or "INCONCLUSIVE",
  "supporting_evidence": ["evidence 1", "evidence 2"],
  "contradicting_evidence": ["contradiction 1"] or [],
  "reason": "2-3 sentence explanation of your verification decision",
  "recommendation": "One clear action sentence: what should happen next"
}}

Confidence guide:
- 0.85+: Strong cross-source confirmation — multiple independent signals agree
- 0.65-0.84: Moderate — assignment data partially confirms
- below 0.65: Weak — limited cross-source evidence or contradictions found
"""

    if MOCK_MODE:
        m = get_mock_response("critic")
        return CriticResult(
            verified=bool(m["verified"]),
            confidence=float(m["confidence"]),
            original_confidence=diagnosis.confidence,
            verdict=m["verdict"],
            supporting_evidence=m.get("supporting_evidence", []),
            contradicting_evidence=m.get("contradicting_evidence", []),
            reason=m["reason"],
            recommendation=m["recommendation"],
        )

    raw = chat(system_prompt, user_prompt, temperature=0.2)
    parsed = parse_json_response(raw)

    return CriticResult(
        verified=bool(parsed["verified"]),
        confidence=float(parsed["confidence"]),
        original_confidence=diagnosis.confidence,
        verdict=parsed["verdict"],
        supporting_evidence=parsed.get("supporting_evidence", []),
        contradicting_evidence=parsed.get("contradicting_evidence", []),
        reason=parsed["reason"],
        recommendation=parsed["recommendation"],
    )
