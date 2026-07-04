"""
Faculty Agent
-------------
Generates a professional, empathetic intervention note
for the faculty member responsible for the student.
This is the human-in-the-loop moment — the note goes to a human, not auto-executed.
"""
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dataclasses import dataclass, asdict
from agents.diagnosis import DiagnosisResult
from agents.critic import CriticResult
from agents.tutor import TutorPlan
from llm_client import chat, parse_json_response, MOCK_MODE
from mock_responses import get_mock_response


@dataclass
class FacultyNote:
    to: str
    from_agent: str
    subject: str
    student_name: str
    urgency: str          # "High" | "Medium" | "Low"
    summary: str
    body: str
    action_items: list[str]
    follow_up_date: str

    def to_dict(self) -> dict:
        return asdict(self)


async def run_faculty(
    diagnosis: DiagnosisResult,
    critic: CriticResult,
    tutor_plan: TutorPlan,
) -> FacultyNote:
    """
    Generate an instructor intervention note.
    """
    tutor_summary = f"5-day plan goal: {tutor_plan.overall_goal}. Success metric: {tutor_plan.success_metric}"
    day_titles = [f"Day {d.day}: {d.focus}" for d in tutor_plan.days]

    system_prompt = """You are EduOS AI's Faculty Agent — you write clear, professional, and empathetic 
academic intervention notes for instructors. The note must be actionable, specific, and motivate the 
instructor to reach out to the student immediately. Tone: professional yet human. Length: 150-200 words for body.
Return valid JSON only."""

    user_prompt = f"""Write an instructor intervention note for the following situation.

STUDENT DETAILS:
- Name: {diagnosis.student_name}
- Batch: {diagnosis.batch}
- Attendance: {diagnosis.attendance_pct}%
- Weak Topic Identified: {diagnosis.weak_topic}
- Verification Status: {critic.verdict} (confidence: {critic.confidence:.0%})
- Risk Level: {diagnosis.risk_level.upper()}

DIAGNOSIS EVIDENCE:
{json.dumps(diagnosis.evidence, indent=2)}

CRITIC SUPPORTING EVIDENCE:
{json.dumps(critic.supporting_evidence, indent=2)}

TUTOR PLAN SUMMARY:
{tutor_summary}
Study Plan Days: {', '.join(day_titles)}

PREREQUISITE TO CHECK: {tutor_plan.prerequisite_check}

Write the intervention note. Return EXACTLY this JSON:
{{
  "to": "Course Faculty — Batch {diagnosis.batch}",
  "subject": "Intervention Required: [Student Name] — [Topic] Risk Alert",
  "urgency": "High" or "Medium" or "Low",
  "summary": "One sentence executive summary (for email preview)",
  "body": "Professional 150-200 word intervention note body — mention the student by name, cite specific evidence numbers, reference the tutor plan, and request a specific action from the faculty",
  "action_items": [
    "Specific action 1 for the faculty member",
    "Specific action 2",
    "Specific action 3"
  ],
  "follow_up_date": "Suggest a follow-up date (e.g. 'Within 48 hours' or a specific day)"
}}
"""

    if MOCK_MODE:
        m = get_mock_response("faculty")
        return FacultyNote(
            to=m["to"],
            from_agent="EduOS AI — Faculty Notification Agent",
            subject=m["subject"],
            student_name=diagnosis.student_name,
            urgency=m["urgency"],
            summary=m["summary"],
            body=m["body"],
            action_items=m.get("action_items", []),
            follow_up_date=m.get("follow_up_date", "Within 48 hours"),
        )

    raw = chat(system_prompt, user_prompt, temperature=0.5)
    parsed = parse_json_response(raw)

    return FacultyNote(
        to=parsed["to"],
        from_agent="EduOS AI — Faculty Notification Agent",
        subject=parsed["subject"],
        student_name=diagnosis.student_name,
        urgency=parsed["urgency"],
        summary=parsed["summary"],
        body=parsed["body"],
        action_items=parsed.get("action_items", []),
        follow_up_date=parsed.get("follow_up_date", "Within 48 hours"),
    )
