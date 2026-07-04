"""
Prediction Agent
----------------
Predicts semester outcome, placement probability, dropout risk,
and learning trajectory for a student based on all available signals.
"""
import os
import sys
import json
import csv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dataclasses import dataclass, asdict
from agents.diagnosis import DiagnosisResult
from agents.critic import CriticResult
from llm_client import chat, parse_json_response, MOCK_MODE
from mock_responses import get_mock_response

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


@dataclass
class PredictionResult:
    student_name: str
    predicted_semester_grade: str          # e.g. "C+" or "B-"
    predicted_semester_score: float        # 0-100
    placement_probability_pct: float       # 0-100
    dropout_risk: str                      # "High" | "Medium" | "Low"
    dropout_risk_score: float              # 0-100 (higher = more risk)
    learning_velocity: str                 # "Accelerating" | "Stable" | "Declining"
    at_risk_topics: list[str]
    strong_topics: list[str]
    intervention_urgency: str             # "Immediate" | "Within a week" | "Monitor"
    prediction_confidence: float          # 0-1
    key_risk_factors: list[str]
    positive_signals: list[str]
    predicted_outcome_if_no_action: str
    predicted_outcome_with_intervention: str

    def to_dict(self) -> dict:
        return asdict(self)


def _load_full_student_context(student_id: str) -> dict:
    """Load all available data signals for a student."""
    signals = {}

    # Quiz averages
    quiz_path = os.path.join(DATA_DIR, "quiz_results.csv")
    quiz_by_topic = {}
    with open(quiz_path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["student_id"] == student_id:
                t = row["topic"]
                quiz_by_topic.setdefault(t, []).append(int(row["score"]))
    signals["quiz_averages"] = {t: round(sum(s)/len(s), 1) for t, s in quiz_by_topic.items()}

    # Video engagement
    video_path = os.path.join(DATA_DIR, "video_engagement.csv")
    video_data = []
    if os.path.exists(video_path):
        with open(video_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["student_id"] == student_id:
                    video_data.append({
                        "lesson": row["lesson"],
                        "pct": row["pct_watched"],
                        "status": row["completion_status"],
                    })
    signals["video_engagement"] = video_data

    # Assignments
    assign_path = os.path.join(DATA_DIR, "assignments.csv")
    assignment_data = []
    if os.path.exists(assign_path):
        with open(assign_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["student_id"] == student_id:
                    assignment_data.append({
                        "assignment": row["assignment"],
                        "status": row["status"],
                        "score": row.get("score", ""),
                    })
    signals["assignments"] = assignment_data

    # Coding platform
    coding_path = os.path.join(DATA_DIR, "coding_platform.csv")
    coding_data = []
    if os.path.exists(coding_path):
        with open(coding_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["student_id"] == student_id:
                    coding_data.append({
                        "topic": row["topics_practiced"],
                        "success_rate": row["success_rate_pct"],
                        "problems_solved": row["problems_solved"],
                    })
    signals["coding_platform"] = coding_data

    return signals


async def run_prediction(diagnosis: DiagnosisResult, critic: CriticResult) -> PredictionResult:
    """
    Generate multi-dimensional predictions for the student.
    """
    student_id = diagnosis.student_id
    signals = _load_full_student_context(student_id)

    system_prompt = """You are EduOS AI's Prediction Agent — a predictive analytics system for student outcomes.
Using multi-signal academic data, you predict: semester grade, placement probability, dropout risk, and learning velocity.
Base ALL predictions on the data provided. Be realistic — if signals are bad, predictions should reflect that.
Return valid JSON only."""

    user_prompt = f"""Generate comprehensive outcome predictions for this student.

STUDENT: {diagnosis.student_name} (ID: {student_id}, Batch: {diagnosis.batch})
ATTENDANCE: {diagnosis.attendance_pct}%
IDENTIFIED WEAK TOPIC: {diagnosis.weak_topic} (Risk: {diagnosis.risk_level})
VERIFIED DIAGNOSIS: {critic.verdict} (confidence: {critic.confidence:.0%})

ALL ACADEMIC SIGNALS:
Quiz Averages by Topic: {json.dumps(signals['quiz_averages'])}
Video Engagement: {json.dumps(signals['video_engagement'])}
Assignment Status: {json.dumps(signals['assignments'])}
Coding Platform: {json.dumps(signals['coding_platform'])}

Prediction guidelines:
- Dropout risk is HIGH if: attendance < 65% AND multiple failing topics AND missed assignments
- Placement probability is LOW if: weak in core DSA topics (Recursion, Trees, Graphs, DP)
- Learning velocity is Declining if quiz scores are getting worse across attempts
- Factor in that the student has NOW been diagnosed and will receive intervention

Return EXACTLY this JSON:
{{
  "predicted_semester_grade": "letter grade e.g. B-",
  "predicted_semester_score": <0-100>,
  "placement_probability_pct": <0-100>,
  "dropout_risk": "High" or "Medium" or "Low",
  "dropout_risk_score": <0-100>,
  "learning_velocity": "Accelerating" or "Stable" or "Declining",
  "at_risk_topics": ["topic1", "topic2"],
  "strong_topics": ["topic1"],
  "intervention_urgency": "Immediate" or "Within a week" or "Monitor",
  "prediction_confidence": <0.0-1.0>,
  "key_risk_factors": ["factor1", "factor2", "factor3"],
  "positive_signals": ["signal1", "signal2"],
  "predicted_outcome_if_no_action": "one sentence — what happens if nothing is done",
  "predicted_outcome_with_intervention": "one sentence — expected outcome with the tutor plan"
}}
"""

    if MOCK_MODE:
        m = get_mock_response("prediction")
        return PredictionResult(
            student_name=diagnosis.student_name,
            predicted_semester_grade=m["predicted_semester_grade"],
            predicted_semester_score=float(m["predicted_semester_score"]),
            placement_probability_pct=float(m["placement_probability_pct"]),
            dropout_risk=m["dropout_risk"],
            dropout_risk_score=float(m["dropout_risk_score"]),
            learning_velocity=m["learning_velocity"],
            at_risk_topics=m["at_risk_topics"],
            strong_topics=m["strong_topics"],
            intervention_urgency=m["intervention_urgency"],
            prediction_confidence=float(m["prediction_confidence"]),
            key_risk_factors=m["key_risk_factors"],
            positive_signals=m["positive_signals"],
            predicted_outcome_if_no_action=m["predicted_outcome_if_no_action"],
            predicted_outcome_with_intervention=m["predicted_outcome_with_intervention"],
        )

    raw = chat(system_prompt, user_prompt, temperature=0.3)
    parsed = parse_json_response(raw)

    return PredictionResult(
        student_name=diagnosis.student_name,
        predicted_semester_grade=parsed["predicted_semester_grade"],
        predicted_semester_score=float(parsed["predicted_semester_score"]),
        placement_probability_pct=float(parsed["placement_probability_pct"]),
        dropout_risk=parsed["dropout_risk"],
        dropout_risk_score=float(parsed["dropout_risk_score"]),
        learning_velocity=parsed["learning_velocity"],
        at_risk_topics=parsed["at_risk_topics"],
        strong_topics=parsed["strong_topics"],
        intervention_urgency=parsed["intervention_urgency"],
        prediction_confidence=float(parsed["prediction_confidence"]),
        key_risk_factors=parsed["key_risk_factors"],
        positive_signals=parsed["positive_signals"],
        predicted_outcome_if_no_action=parsed["predicted_outcome_if_no_action"],
        predicted_outcome_with_intervention=parsed["predicted_outcome_with_intervention"],
    )
