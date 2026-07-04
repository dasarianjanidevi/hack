"""
Mock LLM responses for demo/testing when API quota is exhausted.
Set MOCK_MODE=true in .env to use these instead of real API calls.
"""
import json

MOCK_DIAGNOSIS = {
    "weak_topic": "Recursion",
    "evidence": [
        "Quiz scores: 45, 38, 41 across 3 attempts — all below 50%",
        "Video engagement: Only 22% of 'Understanding Recursion' watched; 0% on follow-up lessons",
        "Coding platform: 0 out of 5 recursion problems solved across 2 sessions"
    ],
    "confidence": 0.94,
    "reasoning": (
        "Aryan Sharma shows consistent and severe underperformance in Recursion across every data source. "
        "Three quiz attempts show a declining trend (45→38→41), video engagement is critically low at 22%, "
        "and zero coding problems were solved. This is a clear, multi-signal failure pattern."
    ),
    "risk_level": "high"
}

MOCK_CRITIC = {
    "verified": True,
    "confidence": 0.96,
    "verdict": "CONFIRMED",
    "supporting_evidence": [
        "Assignment 3 (Fibonacci Recursion) — status: not_submitted. Only missing assignment for this student.",
        "Curriculum note flags Recursion as '#1 high-drop-risk topic' with intervention threshold at score < 60.",
        "Support chat logs show 4 separate help requests on Recursion between Jan 22–27, all unresolved."
    ],
    "contradicting_evidence": [],
    "reason": (
        "Cross-source verification using assignments, support chat logs, and curriculum data independently "
        "confirms the Diagnosis Agent's finding. The not_submitted assignment and 4 unresolved support chats "
        "are particularly strong corroborating signals. Confidence raised from 94% to 96%."
    ),
    "recommendation": "Proceed immediately with personalized Recursion recovery plan and faculty notification."
}

MOCK_TUTOR = {
    "overall_goal": "Achieve ≥70% on a Recursion diagnostic quiz by Day 5 by building genuine conceptual understanding of the call stack.",
    "prerequisite_check": "Confirm student can explain what a function call does in memory — if not, spend 30 min on stack frames first.",
    "success_metric": "Score ≥70% on the Day-5 Recursion diagnostic quiz (10 questions) with at least 2/3 code-trace questions correct.",
    "days": [
        {
            "day": 1,
            "focus": "Call Stack Visualization — what recursion actually does in memory",
            "concepts": ["Call stack frames", "Base case as the stopping condition", "Stack overflow vs. correct base case"],
            "resources": ["Draw the call stack on paper for factorial(4)", "Python Tutor visualizer (pythontutor.com)"],
            "exercise": "Trace factorial(5) on paper step-by-step. Write what's on the stack at every call. Check against the visualizer.",
            "estimated_time": "75 minutes"
        },
        {
            "day": 2,
            "focus": "Writing your first recursive functions from scratch",
            "concepts": ["Identify base case first, then recursive case", "Trust the recursion — don't trace the whole tree"],
            "resources": ["Implement: power(base, exp)", "Implement: sum of digits of a number"],
            "exercise": "Write sum_digits(n) without looking at any reference. Run it. If it fails, draw the stack — find the bug.",
            "estimated_time": "90 minutes"
        },
        {
            "day": 3,
            "focus": "Fibonacci and the cost of naive recursion — intro to memoization",
            "concepts": ["Overlapping subproblems", "Memoization with a dictionary", "Time complexity: O(2^n) vs O(n)"],
            "resources": ["Implement naive Fibonacci", "Implement memoized Fibonacci", "Print call counts to see the difference"],
            "exercise": "Add a call counter to both versions. Run fibonacci(30). Record the call counts. Explain the difference in one sentence.",
            "estimated_time": "90 minutes"
        },
        {
            "day": 4,
            "focus": "Recursion on data structures — lists and strings",
            "concepts": ["Recursive list traversal", "Divide and conquer pattern", "When NOT to use recursion"],
            "resources": ["Implement: reverse a string recursively", "Implement: count occurrences of element in nested list"],
            "exercise": "Solve LeetCode #206 (Reverse Linked List) using recursion. If stuck, draw the stack for 3-node list first.",
            "estimated_time": "90 minutes"
        },
        {
            "day": 5,
            "focus": "Mock test + review weak spots",
            "concepts": ["Mixed recursion problems", "Time pressure practice", "Self-assessment"],
            "resources": ["10-question diagnostic quiz (assigned by faculty)", "Review any questions missed with call-stack diagrams"],
            "exercise": "Complete the assigned Recursion Diagnostic Quiz v2 under timed conditions (45 min). No references.",
            "estimated_time": "60 minutes"
        }
    ]
}

MOCK_FACULTY = {
    "to": "Course Faculty — Batch-B",
    "from_agent": "EduOS AI — Faculty Notification Agent",
    "subject": "Intervention Required: Aryan Sharma — Recursion Risk Alert",
    "student_name": "Aryan Sharma",
    "urgency": "High",
    "summary": "Aryan Sharma (S042, Batch-B) has been flagged as high-risk in Recursion with 96% confidence across 6 independent data signals.",
    "body": (
        "Dear Faculty,\n\n"
        "I am writing to alert you to an urgent academic situation requiring your attention.\n\n"
        "Aryan Sharma (Student ID: S042, Batch-B, Attendance: 61%) has been identified as critically "
        "at-risk in Recursion. This diagnosis has been independently verified with 96% confidence across "
        "6 data sources: three quiz attempts averaging 41/100 (declining trend), video engagement at 22% "
        "for the core Recursion lesson and 0% for follow-up sessions, zero coding problems solved, "
        "one missing assignment (Fibonacci Recursion), and four unresolved support chat requests "
        "submitted between January 22–27.\n\n"
        "A 5-day personalized recovery plan has been prepared. A revision class and diagnostic quiz "
        "have been scheduled. Your personal outreach to Aryan within 48 hours is critical — "
        "the attendance pattern (61%) suggests a risk of disengagement.\n\n"
        "Please review and approve the attached study plan before it is sent to the student.\n\n"
        "EduOS AI | Faculty Notification Agent"
    ),
    "action_items": [
        "Contact Aryan Sharma directly within 48 hours — a personal check-in is critical given 61% attendance",
        "Review and approve the 5-day Recursion recovery plan before it is shared with the student",
        "Attend or designate a colleague for the Recursion Bootcamp session scheduled for next Monday",
        "Monitor quiz performance after Day 5 — escalate to academic head if score remains below 60%"
    ],
    "follow_up_date": "Within 48 hours"
}

MOCK_CURRICULUM = {
    "total_students_analyzed": 60,
    "overall_health_score": 67.5,
    "top_insight": "Recursion has a 58% cohort-wide failure rate and is the single largest barrier to Trees and Dynamic Programming progress across both batches.",
    "critical_topics": [
        {
            "topic": "Recursion",
            "students_struggling": 35,
            "total_students": 60,
            "failure_rate_pct": 58.3,
            "root_causes": [
                "Video completion averages only 34% — students are not finishing the core lessons",
                "No hands-on call-stack visualization exercises in current curriculum",
                "Assignment difficulty jumps too quickly from factorial to tree recursion"
            ],
            "recommendations": [
                {"type": "Video", "description": "Add a 15-minute animated call-stack visualization video before the main Recursion lecture", "priority": "High"},
                {"type": "Assignment", "description": "Insert a new beginner-level assignment: trace 3 recursive functions on paper with provided diagrams", "priority": "High"},
                {"type": "Session", "description": "Add a mandatory 90-minute live Recursion lab in Week 3 with pair programming", "priority": "High"}
            ]
        },
        {
            "topic": "Dynamic Programming",
            "students_struggling": 28,
            "total_students": 60,
            "failure_rate_pct": 46.7,
            "root_causes": [
                "Prerequisite gap: students weak in Recursion cannot grasp memoization",
                "Current assignments lack incremental difficulty progression"
            ],
            "recommendations": [
                {"type": "Video", "description": "Create a 'From Recursion to DP' bridge video showing the memoization transformation", "priority": "High"},
                {"type": "Assignment", "description": "Add 3 warm-up DP problems before the main knapsack problem", "priority": "Medium"}
            ]
        }
    ],
    "action_summary": [
        "Schedule Recursion Bootcamp for Week 3 across both Batch-A and Batch-B immediately",
        "Commission animated call-stack visualization content from the curriculum team",
        "Block student progression to Trees until Recursion quiz score ≥ 65%",
        "Review curriculum sequencing — DP should only be taught after Recursion mastery is verified"
    ]
}

MOCK_PLACEMENT = {
    "student_name": "Aryan Sharma",
    "student_id": "S042",
    "placement_readiness_score": 48,
    "target_role": "Software Engineer",
    "ready_for_placement": False,
    "matched_skills": ["Python", "HTML", "CSS", "JavaScript", "Arrays", "Sorting", "SQL basics"],
    "missing_critical_skills": ["Recursion", "Trees", "Graphs", "Dynamic Programming", "System Design", "Data Structures (intermediate)", "Backend Frameworks"],
    "missing_nice_to_have": ["Docker", "Cloud", "Microservices"],
    "skill_gap_severity": "Critical",
    "upskilling_plan": [
        {"skill": "Recursion", "priority": "High", "estimated_weeks": 2, "approach": "Complete 5-day recovery plan + 20 LeetCode easy/medium recursion problems"},
        {"skill": "Trees & Graphs", "priority": "High", "estimated_weeks": 3, "approach": "Study BST, DFS/BFS; solve 30 tree problems on LeetCode after Recursion mastery"},
        {"skill": "System Design", "priority": "Medium", "estimated_weeks": 4, "approach": "Read 'Grokking System Design'; design URL shortener, rate limiter, and news feed"},
        {"skill": "Backend Framework", "priority": "Medium", "estimated_weeks": 3, "approach": "Build a REST API with FastAPI or Django; deploy a simple CRUD app"}
    ],
    "placement_timeline": "4-5 months with consistent daily practice",
    "key_insight": "Aryan's weakest placement blocker is core DSA — specifically Recursion, Trees, and Graphs, which appear in 80%+ of SWE technical interviews."
}

MOCK_PREDICTION = {
    "predicted_semester_grade": "D+",
    "predicted_semester_score": 52.0,
    "placement_probability_pct": 23.0,
    "dropout_risk": "High",
    "dropout_risk_score": 72.0,
    "learning_velocity": "Declining",
    "at_risk_topics": ["Recursion", "Trees", "Dynamic Programming", "Graphs"],
    "strong_topics": ["Arrays", "Sorting"],
    "intervention_urgency": "Immediate",
    "prediction_confidence": 0.88,
    "key_risk_factors": [
        "Attendance at 61% — below the 65% warning threshold",
        "Recursion quiz scores declining across 3 attempts (45→38→41)",
        "Zero coding platform engagement on Recursion after repeated failure",
        "4 unresolved support chat requests indicate growing frustration"
    ],
    "positive_signals": [
        "Performed adequately on Arrays and Sorting (avg 73%)",
        "Submitted all non-Recursion assignments on time",
        "Still engaged with support chat system — not fully disengaged"
    ],
    "predicted_outcome_if_no_action": "High probability of failing Recursion and blocking Trees/DP progress, leading to a D grade and low placement prospects by semester end.",
    "predicted_outcome_with_intervention": "With the 5-day recovery plan and faculty engagement, projected semester score improves to 68-72% and placement probability rises to 55-65% within 3 months."
}


def get_mock_response(agent: str) -> dict:
    return {
        "diagnosis": MOCK_DIAGNOSIS,
        "critic": MOCK_CRITIC,
        "tutor": MOCK_TUTOR,
        "faculty": MOCK_FACULTY,
        "curriculum": MOCK_CURRICULUM,
        "placement": MOCK_PLACEMENT,
        "prediction": MOCK_PREDICTION,
    }.get(agent, {})
