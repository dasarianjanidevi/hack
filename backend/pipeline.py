"""
Pipeline Orchestrator — Full 8-Agent Pipeline
----------------------------------------------
Agents:
  1. Diagnosis    — find weak topic + evidence
  2. Critic       — cross-verify with second source (shows agent conversation)
  3. Tutor        — personalized 5-day study plan
  4. Faculty      — instructor intervention note
  5. Action       — mock revision class + quiz
  6. Curriculum   — cohort-level analysis
  7. Placement    — placement readiness + skill gap
  8. Prediction   — semester grade + dropout risk + placement probability

Streams Server-Sent Events so the dashboard can show live progress.
"""
import os
import sys
import json
import asyncio
import traceback
from typing import AsyncGenerator

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.diagnosis import run_diagnosis, DiagnosisResult
from agents.critic import run_critic, CriticResult
from agents.tutor import run_tutor, TutorPlan
from agents.faculty import run_faculty, FacultyNote
from agents.action import run_action, ActionResult
from agents.curriculum import run_curriculum, CurriculumReport
from agents.placement import run_placement
from agents.prediction import run_prediction, PredictionResult

# In-memory store for completed pipeline results
_results: dict[str, dict] = {}


def store_result(run_id: str, data: dict):
    _results[run_id] = data


def get_result(run_id: str) -> dict | None:
    return _results.get(run_id)


def _event(step: str, status: str, data: dict | None = None, error: str | None = None) -> str:
    """Format a Server-Sent Event message."""
    payload = {
        "step": step,
        "status": status,  # "running" | "done" | "error" | "conversation"
        "data": data,
        "error": error,
    }
    return f"data: {json.dumps(payload)}\n\n"


def _conversation_event(speaker: str, message: str, message_type: str = "statement") -> str:
    """
    Special SSE event for showing the Diagnosis↔Critic conversation.
    message_type: "diagnosis_claim" | "critic_challenge" | "diagnosis_update" | "critic_approve"
    """
    payload = {
        "step": "critic_conversation",
        "status": "conversation",
        "data": {
            "speaker": speaker,
            "message": message,
            "message_type": message_type,
        },
        "error": None,
    }
    return f"data: {json.dumps(payload)}\n\n"


async def run_pipeline(student_name: str, run_id: str) -> AsyncGenerator[str, None]:
    """
    Async generator that runs all 8 agents and yields SSE messages.
    """
    result_store = {}

    try:
        # ─── STEP 1: DIAGNOSIS ─────────────────────────────────────────
        yield _event("diagnosis", "running")
        try:
            diagnosis: DiagnosisResult = await run_diagnosis(student_name)
            result_store["diagnosis"] = diagnosis.to_dict()
            yield _event("diagnosis", "done", diagnosis.to_dict())

            # Diagnosis Agent makes its initial claim (visible conversation)
            await asyncio.sleep(0.3)
            yield _conversation_event(
                speaker="Diagnosis Agent",
                message=(
                    f"I have identified that {diagnosis.student_name} is struggling with "
                    f"**{diagnosis.weak_topic}**. Evidence: {'; '.join(diagnosis.evidence[:2])}. "
                    f"My confidence is {diagnosis.confidence:.0%}."
                ),
                message_type="diagnosis_claim",
            )
        except Exception as e:
            yield _event("diagnosis", "error", error=str(e))
            return

        # ─── STEP 2: CRITIC (with visible conversation) ─────────────────
        yield _event("critic", "running")

        # Critic challenges the diagnosis
        await asyncio.sleep(0.5)
        yield _conversation_event(
            speaker="Critic Agent",
            message=(
                f"Diagnosis received. Initiating cross-verification against "
                f"assignments, coding platform, and support chat data — "
                f"sources not used by the Diagnosis Agent. Stand by..."
            ),
            message_type="critic_challenge",
        )

        try:
            critic: CriticResult = await run_critic(diagnosis)
            result_store["critic"] = critic.to_dict()

            # Show critic's finding
            await asyncio.sleep(0.3)
            if critic.verdict == "CONFIRMED":
                yield _conversation_event(
                    speaker="Critic Agent",
                    message=(
                        f"Cross-verification **CONFIRMED**. "
                        f"Supporting evidence from secondary sources: {'; '.join(critic.supporting_evidence[:2])}. "
                        f"Updated confidence: **{critic.confidence:.0%}**. "
                        f"Approved for action."
                    ),
                    message_type="critic_approve",
                )
            elif critic.verdict == "CHALLENGED":
                yield _conversation_event(
                    speaker="Critic Agent",
                    message=(
                        f"Evidence is **INSUFFICIENT or CONTRADICTED**. "
                        f"Contradiction: {critic.contradicting_evidence[0] if critic.contradicting_evidence else 'Weak signal'}. "
                        f"Requesting re-analysis."
                    ),
                    message_type="critic_challenge",
                )
                await asyncio.sleep(0.4)
                yield _conversation_event(
                    speaker="Diagnosis Agent",
                    message=(
                        f"Acknowledged. Re-analyzing with updated context. "
                        f"The diagnosis stands on: {'; '.join(diagnosis.evidence[:2])}. "
                        f"Cross-source confidence adjusted to: {critic.confidence:.0%}."
                    ),
                    message_type="diagnosis_update",
                )
                await asyncio.sleep(0.4)
                yield _conversation_event(
                    speaker="Critic Agent",
                    message=(
                        f"Final verdict: **{critic.verdict}**. "
                        f"Confidence: {critic.confidence:.0%}. {critic.reason}"
                    ),
                    message_type="critic_approve",
                )
            else:
                yield _conversation_event(
                    speaker="Critic Agent",
                    message=(
                        f"Verdict: **INCONCLUSIVE**. Limited cross-source evidence. "
                        f"Proceeding with {critic.confidence:.0%} confidence. {critic.reason}"
                    ),
                    message_type="critic_approve",
                )

            yield _event("critic", "done", critic.to_dict())
        except Exception as e:
            yield _event("critic", "error", error=str(e))
            return

        # ─── STEP 3: TUTOR ─────────────────────────────────────────────
        yield _event("tutor", "running")
        try:
            tutor_plan: TutorPlan = await run_tutor(diagnosis, critic)
            result_store["tutor"] = tutor_plan.to_dict()
            yield _event("tutor", "done", tutor_plan.to_dict())
        except Exception as e:
            yield _event("tutor", "error", error=str(e))
            return

        # ─── STEP 4: FACULTY ───────────────────────────────────────────
        yield _event("faculty", "running")
        try:
            faculty_note: FacultyNote = await run_faculty(diagnosis, critic, tutor_plan)
            result_store["faculty"] = faculty_note.to_dict()
            yield _event("faculty", "done", faculty_note.to_dict())
        except Exception as e:
            yield _event("faculty", "error", error=str(e))
            return

        # ─── STEP 5: ACTION ────────────────────────────────────────────
        yield _event("action", "running")
        try:
            action_result: ActionResult = await run_action(diagnosis, critic, tutor_plan, faculty_note)
            result_store["action"] = action_result.to_dict()
            yield _event("action", "done", action_result.to_dict())
        except Exception as e:
            yield _event("action", "error", error=str(e))
            return

        # ─── STEP 6: CURRICULUM ────────────────────────────────────────
        yield _event("curriculum", "running")
        try:
            curriculum_report: CurriculumReport = await run_curriculum()
            result_store["curriculum"] = curriculum_report.to_dict()
            yield _event("curriculum", "done", curriculum_report.to_dict())
        except Exception as e:
            yield _event("curriculum", "error", error=str(e))
            return

        # ─── STEP 7: PLACEMENT ─────────────────────────────────────────
        yield _event("placement", "running")
        try:
            placement_result = await run_placement(diagnosis)
            result_store["placement"] = placement_result
            yield _event("placement", "done", placement_result)
        except Exception as e:
            yield _event("placement", "error", error=str(e))
            return

        # ─── STEP 8: PREDICTION ────────────────────────────────────────
        yield _event("prediction", "running")
        try:
            prediction: PredictionResult = await run_prediction(diagnosis, critic)
            result_store["prediction"] = prediction.to_dict()
            yield _event("prediction", "done", prediction.to_dict())
        except Exception as e:
            yield _event("prediction", "error", error=str(e))
            return

        # ─── PIPELINE COMPLETE ─────────────────────────────────────────
        store_result(run_id, result_store)
        yield _event("complete", "done", {"run_id": run_id, "student": student_name})

    except Exception as e:
        tb = traceback.format_exc()
        yield _event("error", "error", error=f"Pipeline failed: {str(e)}\n{tb}")
