"""
Placement Agent
---------------
Compares a student's current skills against target job role requirements.
Generates a placement readiness score and identifies skill gaps.
"""
import os
import sys
import json
import csv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dataclasses import dataclass, field, asdict
from agents.diagnosis import DiagnosisResult
from rag.retriever import retrieve
from llm_client import chat, parse_json_response, MOCK_MODE
from mock_responses import get_mock_response

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

# Target job descriptions (simulated — in production fetched from job portal)
JOB_DESCRIPTIONS = {
    "Software Engineer": {
        "required_skills": ["Python", "Data Structures", "Algorithms", "Recursion", "Trees", "Graphs",
                            "Dynamic Programming", "System Design", "SQL", "Git", "REST APIs"],
        "nice_to_have": ["Docker", "Kubernetes", "Microservices", "Cloud"],
        "min_placement_score": 70,
    },
    "Data Scientist": {
        "required_skills": ["Python", "ML", "Statistics", "SQL", "Data Structures", "Recursion",
                            "Pandas", "NumPy", "Data Visualization"],
        "nice_to_have": ["Deep Learning", "Spark", "MLOps", "Cloud"],
        "min_placement_score": 72,
    },
    "Full Stack Developer": {
        "required_skills": ["JavaScript", "React", "Node.js", "SQL", "REST APIs", "HTML", "CSS",
                            "Data Structures", "Git"],
        "nice_to_have": ["Docker", "TypeScript", "GraphQL", "AWS"],
        "min_placement_score": 68,
    },
}


def _get_student_placement_data(student_id: str) -> dict | None:
    filepath = os.path.join(DATA_DIR, "placement_data.csv")
    if not os.path.exists(filepath):
        return None
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["student_id"] == student_id:
                return row
    return None


async def run_placement(diagnosis: DiagnosisResult) -> dict:
    """
    Analyze placement readiness for a student.
    Returns placement gap analysis and readiness score.
    """
    student_id = diagnosis.student_id
    placement_data = _get_student_placement_data(student_id)

    # Use fallback if no placement record exists
    if not placement_data:
        placement_data = {
            "target_role": "Software Engineer",
            "resume_skills": "Python, Arrays, Sorting",
            "mock_interview_score": "55",
            "communication_score": "60",
            "technical_score": "50",
            "placement_readiness_score": "52",
            "missing_skills": "Recursion, Trees, System Design",
            "github_projects": "0 projects",
            "certifications": "None",
        }

    target_role = placement_data.get("target_role", "Software Engineer")
    job_desc = JOB_DESCRIPTIONS.get(target_role, JOB_DESCRIPTIONS["Software Engineer"])

    # Retrieve relevant industry/curriculum context
    curriculum_chunks = retrieve(
        query=f"skills required for {target_role} placement readiness advanced topics",
        source_filter="curriculum",
        n=4,
    )
    context = "\n".join(curriculum_chunks)

    system_prompt = """You are EduOS AI's Placement Agent — a career readiness analyst.
You compare a student's current skills against job market requirements and generate a gap analysis.
Be specific about missing skills and give realistic, actionable upskilling steps.
Return valid JSON only."""

    user_prompt = f"""Analyze this student's placement readiness.

STUDENT: {diagnosis.student_name} (ID: {student_id})
TARGET ROLE: {target_role}

STUDENT PROFILE:
- Current Skills: {placement_data.get('resume_skills', 'N/A')}
- Mock Interview Score: {placement_data.get('mock_interview_score', 'N/A')}/100
- Communication Score: {placement_data.get('communication_score', 'N/A')}/100
- Technical Score: {placement_data.get('technical_score', 'N/A')}/100
- Self-Reported Missing Skills: {placement_data.get('missing_skills', 'N/A')}
- GitHub Projects: {placement_data.get('github_projects', '0')}
- Certifications: {placement_data.get('certifications', 'None')}
- Diagnosed Weak Topic (from AI): {diagnosis.weak_topic}
- Academic Risk Level: {diagnosis.risk_level}

JOB REQUIREMENTS FOR {target_role}:
- Required Skills: {json.dumps(job_desc['required_skills'])}
- Nice to Have: {json.dumps(job_desc['nice_to_have'])}
- Minimum Placement Score: {job_desc['min_placement_score']}

CURRICULUM CONTEXT:
{context}

Return EXACTLY this JSON:
{{
  "placement_readiness_score": <0-100>,
  "target_role": "{target_role}",
  "ready_for_placement": true or false,
  "matched_skills": ["skill1", "skill2"],
  "missing_critical_skills": ["skill1", "skill2"],
  "missing_nice_to_have": ["skill1"],
  "skill_gap_severity": "Critical" or "Moderate" or "Minor",
  "upskilling_plan": [
    {{"skill": "skill name", "priority": "High/Medium", "estimated_weeks": 2, "approach": "how to learn it"}}
  ],
  "placement_timeline": "estimated months until ready",
  "key_insight": "one sentence summary of placement readiness"
}}
"""

    if MOCK_MODE:
        m = get_mock_response("placement")
        m["student_name"] = diagnosis.student_name
        m["student_id"] = student_id
        return m

    raw = chat(system_prompt, user_prompt, temperature=0.3)
    parsed = parse_json_response(raw)
    parsed["student_name"] = diagnosis.student_name
    parsed["student_id"] = student_id
    return parsed
