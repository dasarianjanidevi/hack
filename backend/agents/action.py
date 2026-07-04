"""
Action Agent
------------
Mocks the creation of a revision class and a diagnostic quiz.
No LLM needed — pure structured output based on the tutor plan.
In production this would call an LMS API (Moodle / Canvas / custom).
"""
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dataclasses import dataclass, asdict
from agents.diagnosis import DiagnosisResult
from agents.critic import CriticResult
from agents.tutor import TutorPlan
from agents.faculty import FacultyNote


@dataclass
class RevisionClass:
    title: str
    topic: str
    scheduled_date: str
    duration: str
    mode: str
    max_students: int
    location: str
    instructor_note: str
    status: str


@dataclass
class Quiz:
    title: str
    topic: str
    num_questions: int
    question_types: list[str]
    due_date: str
    auto_graded: bool
    passing_score: int
    retake_allowed: bool
    status: str


@dataclass
class ActionResult:
    revision_class: RevisionClass
    quiz: Quiz
    notifications_sent: list[str]
    lms_status: str
    created_at: str
    action_summary: str

    def to_dict(self) -> dict:
        return asdict(self)


async def run_action(
    diagnosis: DiagnosisResult,
    critic: CriticResult,
    tutor_plan: TutorPlan,
    faculty_note: FacultyNote,
) -> ActionResult:
    """
    Mock-create a revision class and quiz based on the verified diagnosis.
    Returns structured confirmation — no actual LMS calls made.
    """
    now = datetime.now()

    # Schedule revision class for next Monday at 10am
    days_until_monday = (7 - now.weekday()) % 7 or 7
    revision_date = now + timedelta(days=days_until_monday)
    revision_date_str = revision_date.strftime("%A, %B %d, %Y — 10:00 AM")

    # Quiz due in 3 days
    quiz_due = now + timedelta(days=3)
    quiz_due_str = quiz_due.strftime("%A, %B %d, %Y — 11:59 PM")

    weak_topic = diagnosis.weak_topic

    revision_class = RevisionClass(
        title=f"{weak_topic} Bootcamp — Recovery Session",
        topic=weak_topic,
        scheduled_date=revision_date_str,
        duration="90 minutes",
        mode="Small Group (max 8 students)",
        max_students=8,
        location="Virtual — Zoom Room B / Lab 3",
        instructor_note=f"Focus on: {tutor_plan.prerequisite_check}. Use call-stack visualization exercises.",
        status="SCHEDULED",
    )

    quiz = Quiz(
        title=f"{weak_topic} Diagnostic Quiz v2 — {diagnosis.student_name}",
        topic=weak_topic,
        num_questions=10,
        question_types=["Multiple Choice (4)", "Code Trace (3)", "Short Write (2)", "Debug Fix (1)"],
        due_date=quiz_due_str,
        auto_graded=True,
        passing_score=70,
        retake_allowed=True,
        status="CREATED",
    )

    notifications = [
        f"📧 Email → {faculty_note.to}: Intervention note delivered",
        f"📱 SMS → {diagnosis.student_name}: Study plan assigned",
        f"📅 Calendar → {diagnosis.student_name}: Revision class scheduled for {revision_date.strftime('%b %d')}",
        f"📝 LMS → {diagnosis.student_name}: Quiz '{quiz.title}' assigned (due {quiz_due.strftime('%b %d')})",
    ]

    return ActionResult(
        revision_class=revision_class,
        quiz=quiz,
        notifications_sent=notifications,
        lms_status="MOCK — No actual LMS connected (demo mode)",
        created_at=now.isoformat(),
        action_summary=(
            f"Successfully created: 1 revision class ({revision_date.strftime('%b %d')}) "
            f"and 1 diagnostic quiz (due {quiz_due.strftime('%b %d')}) "
            f"for {diagnosis.student_name} on topic '{weak_topic}'. "
            f"Faculty notified. Student notified."
        ),
    )
