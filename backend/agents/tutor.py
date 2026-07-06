"""
Tutor Agent
-----------
Generates a personalized 5-day study plan for the student
based on verified diagnosis + curriculum context.
"""
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dataclasses import dataclass, field, asdict
from agents.diagnosis import DiagnosisResult
from agents.critic import CriticResult
from rag.retriever import retrieve
from llm_client import chat, parse_json_response, MOCK_MODE
from mock_responses import get_mock_response


@dataclass
class DayPlan:
    day: int
    focus: str
    concepts: list[str]
    resources: list[str]
    exercise: str
    estimated_time: str


@dataclass
class TutorPlan:
    student_name: str
    weak_topic: str
    overall_goal: str
    days: list[DayPlan]
    prerequisite_check: str
    success_metric: str

    def to_dict(self) -> dict:
        return asdict(self)


async def run_tutor(diagnosis: DiagnosisResult, critic: CriticResult) -> TutorPlan:
    """
    Generate a 5-day personalized study plan for the diagnosed student.
    """
    weak_topic = diagnosis.weak_topic

    # Short-circuit in mock mode — skip RAG/ChromaDB calls
    if MOCK_MODE:
        m = get_mock_response("tutor")
        days = [
            DayPlan(
                day=d["day"],
                focus=d["focus"],
                concepts=d["concepts"],
                resources=d["resources"],
                exercise=d["exercise"],
                estimated_time=d["estimated_time"],
            )
            for d in m["days"]
        ]
        return TutorPlan(
            student_name=diagnosis.student_name,
            weak_topic=weak_topic,
            overall_goal=m["overall_goal"],
            days=days,
            prerequisite_check=m["prerequisite_check"],
            success_metric=m["success_metric"],
        )

    # Retrieve curriculum content for the weak topic
    curriculum_chunks = retrieve(
        query=f"{weak_topic} learning outcomes prerequisites exercises practice",
        source_filter="curriculum",
        n=6,
    )

    # Also retrieve any peer data (what good students do for this topic)
    peer_chunks = retrieve(
        query=f"high score performance {weak_topic} successful student",
        source_filter="quiz_results",
        n=4,
    )

    context = "\n".join([
        "=== Curriculum Content ===",
        *curriculum_chunks,
        "\n=== High-Performing Peer Data ===",
        *peer_chunks,
    ])

    system_prompt = """You are EduOS AI's Tutor Agent — a world-class personalized education planner.
You create structured, realistic, and actionable 5-day study plans tailored to a student's exact weakness.
Plans must be specific (not generic), include concrete exercises, and fit a working student's schedule.
Return valid JSON only."""

    user_prompt = f"""Create a personalized 5-day study plan for this student.

STUDENT PROFILE:
- Name: {diagnosis.student_name}
- Batch: {diagnosis.batch}
- Attendance: {diagnosis.attendance_pct}%
- Identified Weak Topic: {weak_topic}
- Verified: {critic.verdict} (confidence: {critic.confidence:.0%})
- Diagnosis Reasoning: {diagnosis.reasoning}
- Tutor Recommendation: {critic.recommendation}

CURRICULUM & PEER CONTEXT:
{context}

QUIZ PERFORMANCE: {json.dumps(diagnosis.quiz_scores)}

Design a 5-day focused recovery plan. Each day should:
- Build on the previous day (no jumping ahead)
- Include a concrete, doable exercise (not just "read about X")
- Be realistic: 1-2 hours max per day
- Reference actual techniques from the curriculum context

Return EXACTLY this JSON (no extra text):
{{
  "overall_goal": "one sentence describing what the student should achieve by day 5",
  "prerequisite_check": "what the student must review/confirm they know before day 1",
  "success_metric": "how the student and faculty will know they've succeeded",
  "days": [
    {{
      "day": 1,
      "focus": "specific focus for this day",
      "concepts": ["concept 1", "concept 2"],
      "resources": ["resource or technique 1", "resource or technique 2"],
      "exercise": "specific hands-on exercise — e.g., 'Write a recursive function to compute factorial without looking at notes'",
      "estimated_time": "e.g. 90 minutes"
    }},
    ... (5 days total)
  ]
}}
"""

    if MOCK_MODE:
        m = get_mock_response("tutor")
        days = [
            DayPlan(
                day=d["day"],
                focus=d["focus"],
                concepts=d["concepts"],
                resources=d["resources"],
                exercise=d["exercise"],
                estimated_time=d["estimated_time"],
            )
            for d in m["days"]
        ]
        return TutorPlan(
            student_name=diagnosis.student_name,
            weak_topic=weak_topic,
            overall_goal=m["overall_goal"],
            days=days,
            prerequisite_check=m["prerequisite_check"],
            success_metric=m["success_metric"],
        )

    raw = chat(system_prompt, user_prompt, temperature=0.4)
    parsed = parse_json_response(raw)

    days = [
        DayPlan(
            day=d["day"],
            focus=d["focus"],
            concepts=d["concepts"],
            resources=d["resources"],
            exercise=d["exercise"],
            estimated_time=d["estimated_time"],
        )
        for d in parsed["days"]
    ]

    return TutorPlan(
        student_name=diagnosis.student_name,
        weak_topic=weak_topic,
        overall_goal=parsed["overall_goal"],
        days=days,
        prerequisite_check=parsed["prerequisite_check"],
        success_metric=parsed["success_metric"],
    )
