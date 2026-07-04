"""
Curriculum Agent
----------------
Analyzes ALL students across the cohort to identify systemic weaknesses.
Recommends curriculum-level interventions (new videos, extra practice sessions, etc.)
rather than per-student fixes.
"""
import os
import sys
import json
import csv
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dataclasses import dataclass, field, asdict
from rag.retriever import retrieve
from llm_client import chat, parse_json_response, MOCK_MODE
from mock_responses import get_mock_response

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


@dataclass
class CurriculumRecommendation:
    topic: str
    students_struggling: int
    total_students: int
    failure_rate_pct: float
    root_causes: list[str]
    recommendations: list[dict]  # [{type, description, priority}]


@dataclass
class CurriculumReport:
    total_students_analyzed: int
    critical_topics: list[CurriculumRecommendation]
    overall_health_score: float  # 0-100
    top_insight: str
    action_summary: list[str]

    def to_dict(self) -> dict:
        return asdict(self)


def _compute_topic_stats() -> dict:
    """Compute average quiz scores per topic across all students."""
    topic_scores = defaultdict(list)
    filepath = os.path.join(DATA_DIR, "quiz_results.csv")
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            topic_scores[row["topic"]].append(int(row["score"]))

    stats = {}
    for topic, scores in topic_scores.items():
        avg = sum(scores) / len(scores)
        failing = sum(1 for s in scores if s < 60)
        stats[topic] = {
            "avg_score": round(avg, 1),
            "total_attempts": len(scores),
            "failing_attempts": failing,
            "failure_rate": round(failing / len(scores) * 100, 1),
        }
    return stats


def _get_support_chat_topics() -> dict:
    """Count support chat mentions per topic."""
    topic_counts = defaultdict(int)
    filepath = os.path.join(DATA_DIR, "support_chats.csv")
    if not os.path.exists(filepath):
        return {}
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("topic_mentioned"):
                topic_counts[row["topic_mentioned"]] += 1
    return dict(topic_counts)


async def run_curriculum() -> CurriculumReport:
    """Analyze all students and generate cohort-level curriculum recommendations."""
    topic_stats = _compute_topic_stats()
    chat_mentions = _get_support_chat_topics()

    # Get curriculum context
    curriculum_chunks = retrieve(
        query="topic difficulty instructor note high risk drop warning students fail",
        source_filter="curriculum",
        n=8,
    )

    context = "\n".join(curriculum_chunks)

    system_prompt = """You are EduOS AI's Curriculum Agent — a cohort-level education analyst.
You analyze performance data across ALL students (not individuals) to identify systemic issues in the curriculum.
Your recommendations target the institution, not individual students. Be data-driven and specific.
Return valid JSON only."""

    user_prompt = f"""Analyze cohort-wide topic performance and identify curriculum-level interventions needed.

TOPIC PERFORMANCE STATS (across all students):
{json.dumps(topic_stats, indent=2)}

SUPPORT CHAT MENTIONS PER TOPIC (student complaints/questions):
{json.dumps(chat_mentions, indent=2)}

CURRICULUM CONTEXT:
{context}

Identify the 2-3 topics with the worst failure rates. For each, recommend specific curriculum improvements.

Return EXACTLY this JSON:
{{
  "total_students_analyzed": <number>,
  "overall_health_score": <0-100 where 100 is perfect cohort performance>,
  "top_insight": "One sentence: the most critical systemic finding",
  "critical_topics": [
    {{
      "topic": "topic name",
      "students_struggling": <estimated number>,
      "total_students": <estimated total>,
      "failure_rate_pct": <percentage>,
      "root_causes": ["cause 1", "cause 2"],
      "recommendations": [
        {{"type": "Video", "description": "specific recommendation", "priority": "High"}},
        {{"type": "Assignment", "description": "specific recommendation", "priority": "Medium"}},
        {{"type": "Session", "description": "specific recommendation", "priority": "High"}}
      ]
    }}
  ],
  "action_summary": ["action 1", "action 2", "action 3"]
}}
"""

    if MOCK_MODE:
        m = get_mock_response("curriculum")
        critical = [
            CurriculumRecommendation(
                topic=t["topic"],
                students_struggling=t["students_struggling"],
                total_students=t["total_students"],
                failure_rate_pct=t["failure_rate_pct"],
                root_causes=t["root_causes"],
                recommendations=t["recommendations"],
            )
            for t in m.get("critical_topics", [])
        ]
        return CurriculumReport(
            total_students_analyzed=m.get("total_students_analyzed", 60),
            critical_topics=critical,
            overall_health_score=float(m.get("overall_health_score", 70)),
            top_insight=m.get("top_insight", ""),
            action_summary=m.get("action_summary", []),
        )

    raw = chat(system_prompt, user_prompt, temperature=0.3)
    parsed = parse_json_response(raw)

    critical = []
    for t in parsed.get("critical_topics", []):
        critical.append(CurriculumRecommendation(
            topic=t["topic"],
            students_struggling=t["students_struggling"],
            total_students=t["total_students"],
            failure_rate_pct=t["failure_rate_pct"],
            root_causes=t["root_causes"],
            recommendations=t["recommendations"],
        ))

    return CurriculumReport(
        total_students_analyzed=parsed.get("total_students_analyzed", 60),
        critical_topics=critical,
        overall_health_score=float(parsed.get("overall_health_score", 70)),
        top_insight=parsed.get("top_insight", ""),
        action_summary=parsed.get("action_summary", []),
    )
