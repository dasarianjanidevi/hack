"""
Generate curriculum.pdf — a structured document describing 10 programming topics.
Run once: python generate_pdf.py
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import os

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "curriculum.pdf")

TOPICS = [
    {
        "id": 1,
        "name": "Arrays",
        "week": "Week 1",
        "prerequisites": "None",
        "description": "Introduction to arrays, indexing, traversal, insertion, deletion, and common patterns like two-pointer and sliding window.",
        "learning_outcomes": [
            "Declare and initialize arrays in multiple languages",
            "Traverse arrays using loops and iterators",
            "Implement two-pointer technique for pair problems",
            "Apply sliding window for subarray problems",
        ],
        "difficulty": "Beginner",
        "estimated_hours": 8,
    },
    {
        "id": 2,
        "name": "Linked Lists",
        "week": "Week 2",
        "prerequisites": "Arrays",
        "description": "Singly and doubly linked lists, node structure, pointer manipulation, reversal, cycle detection (Floyd's algorithm), and merge operations.",
        "learning_outcomes": [
            "Implement a singly linked list from scratch",
            "Reverse a linked list iteratively and recursively",
            "Detect cycles using Floyd's tortoise-and-hare",
            "Merge two sorted linked lists",
        ],
        "difficulty": "Beginner-Intermediate",
        "estimated_hours": 10,
    },
    {
        "id": 3,
        "name": "Recursion",
        "week": "Week 3",
        "prerequisites": "Arrays, Functions",
        "description": (
            "Fundamental recursive thinking: base cases, recursive cases, call stack visualization. "
            "Topics include factorial, Fibonacci, power functions, tree recursion, memoization basics, "
            "and tail recursion. Students must internalize the call stack before proceeding to Trees or Dynamic Programming. "
            "Common failure point: students memorize patterns without understanding how the stack unwinds. "
            "Requires deliberate practice with call-stack diagrams and tracing exercises."
        ),
        "learning_outcomes": [
            "Identify and write correct base cases",
            "Trace a recursive call stack on paper",
            "Implement Fibonacci with and without memoization",
            "Convert simple iterative solutions to recursive ones",
            "Recognize when recursion leads to exponential time and apply memoization",
        ],
        "difficulty": "Intermediate (High Drop Risk)",
        "estimated_hours": 14,
        "instructor_note": (
            "This is the #1 topic where students disengage. Attendance drops, video completion falls, "
            "and quiz scores cluster around 40-55%. Immediate intervention recommended if a student scores "
            "below 60 on the first attempt. Do not allow students to proceed to Trees without passing Recursion."
        ),
    },
    {
        "id": 4,
        "name": "Stacks and Queues",
        "week": "Week 4",
        "prerequisites": "Arrays, Linked Lists",
        "description": "Stack (LIFO) and Queue (FIFO) data structures. Applications: balanced parentheses, next greater element, BFS traversal.",
        "learning_outcomes": [
            "Implement stack and queue using arrays and linked lists",
            "Solve balanced parentheses problems",
            "Use stacks for expression evaluation",
            "Implement queue using two stacks",
        ],
        "difficulty": "Intermediate",
        "estimated_hours": 10,
    },
    {
        "id": 5,
        "name": "Trees",
        "week": "Week 5",
        "prerequisites": "Recursion, Linked Lists",
        "description": "Binary trees, BST, tree traversals (in/pre/post/level-order), height, diameter, LCA. Requires strong recursion foundation.",
        "learning_outcomes": [
            "Implement a binary search tree with insert and search",
            "Perform all four tree traversals",
            "Calculate tree height and diameter recursively",
            "Find LCA in a binary tree",
        ],
        "difficulty": "Intermediate-Advanced",
        "estimated_hours": 14,
    },
    {
        "id": 6,
        "name": "Graphs",
        "week": "Week 6",
        "prerequisites": "Trees, Stacks and Queues",
        "description": "Graph representation (adjacency list/matrix), BFS, DFS, topological sort, connected components, shortest path (Dijkstra).",
        "learning_outcomes": [
            "Represent a graph using adjacency list",
            "Implement BFS and DFS from scratch",
            "Detect cycles in directed and undirected graphs",
            "Apply Dijkstra's algorithm for shortest path",
        ],
        "difficulty": "Advanced",
        "estimated_hours": 16,
    },
    {
        "id": 7,
        "name": "Sorting Algorithms",
        "week": "Week 7",
        "prerequisites": "Arrays, Recursion",
        "description": "Bubble, selection, insertion, merge, quick sort. Time/space complexity analysis. Stable vs unstable sorts.",
        "learning_outcomes": [
            "Implement merge sort and quick sort",
            "Analyze time and space complexity of each algorithm",
            "Choose appropriate sort for a given problem",
            "Understand why merge sort is O(n log n) via recursion tree",
        ],
        "difficulty": "Intermediate",
        "estimated_hours": 12,
    },
    {
        "id": 8,
        "name": "Hashing",
        "week": "Week 8",
        "prerequisites": "Arrays",
        "description": "Hash maps, hash sets, collision resolution, common interview patterns: frequency count, anagram detection, two-sum.",
        "learning_outcomes": [
            "Explain how a hash function works",
            "Use hash maps for O(1) lookups",
            "Solve two-sum in O(n) using hashing",
            "Detect duplicates and find frequencies",
        ],
        "difficulty": "Intermediate",
        "estimated_hours": 10,
    },
    {
        "id": 9,
        "name": "Dynamic Programming",
        "week": "Week 9-10",
        "prerequisites": "Recursion, Arrays",
        "description": "Memoization vs tabulation, 0/1 knapsack, longest common subsequence, coin change, DP on strings and grids.",
        "learning_outcomes": [
            "Convert recursive solution to memoized DP",
            "Build bottom-up DP tables",
            "Solve 0/1 knapsack and coin change",
            "Identify overlapping subproblems and optimal substructure",
        ],
        "difficulty": "Advanced",
        "estimated_hours": 20,
    },
    {
        "id": 10,
        "name": "System Design Basics",
        "week": "Week 11-12",
        "prerequisites": "All above topics",
        "description": "Scalability concepts, load balancing, caching, database design (SQL vs NoSQL), API design, CAP theorem introduction.",
        "learning_outcomes": [
            "Design a URL shortener from scratch",
            "Explain horizontal vs vertical scaling",
            "Describe when to use SQL vs NoSQL",
            "Design a basic REST API with proper endpoints",
        ],
        "difficulty": "Advanced",
        "estimated_hours": 20,
    },
]


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontSize=20,
        textColor=colors.HexColor("#1a1a2e"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#555555"),
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "TopicHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#16213e"),
        spaceBefore=14,
        spaceAfter=4,
        borderPad=4,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#333333"),
        spaceAfter=6,
    )
    note_style = ParagraphStyle(
        "Note",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#8B0000"),
        backColor=colors.HexColor("#fff0f0"),
        borderPad=6,
        spaceAfter=8,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        leftIndent=16,
        bulletIndent=6,
        textColor=colors.HexColor("#333333"),
    )

    story = []

    # Title
    story.append(Paragraph("EduOS AI — Course Curriculum", title_style))
    story.append(
        Paragraph(
            "Full-Stack Programming Bootcamp · Academic Year 2024 · 12 Weeks · Batch A & B",
            subtitle_style,
        )
    )

    for topic in TOPICS:
        story.append(
            Paragraph(
                f"Topic {topic['id']}: {topic['name']} ({topic['week']})", heading_style
            )
        )

        # Meta table
        meta_data = [
            ["Prerequisites", topic["prerequisites"]],
            ["Difficulty", topic["difficulty"]],
            ["Estimated Hours", str(topic["estimated_hours"])],
        ]
        meta_table = Table(meta_data, colWidths=[1.5 * inch, 5 * inch])
        meta_table.setStyle(
            TableStyle(
                [
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#555555")),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                    ("TOPPADDING", (0, 0), (-1, -1), 2),
                ]
            )
        )
        story.append(meta_table)
        story.append(Spacer(1, 6))

        story.append(Paragraph(topic["description"], body_style))

        story.append(Paragraph("<b>Learning Outcomes:</b>", body_style))
        for outcome in topic["learning_outcomes"]:
            story.append(Paragraph(f"• {outcome}", bullet_style))

        if "instructor_note" in topic:
            story.append(Spacer(1, 4))
            story.append(
                Paragraph(
                    f"[!] Instructor Note: {topic['instructor_note']}", note_style
                )
            )

        story.append(Spacer(1, 8))

    doc.build(story)
    print("[OK] curriculum.pdf generated at: " + OUTPUT_PATH)


if __name__ == "__main__":
    build_pdf()
