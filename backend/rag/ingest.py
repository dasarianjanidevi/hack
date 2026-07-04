"""
RAG Ingestion — reads all CSV data and the curriculum PDF,
chunks them, and upserts into a local ChromaDB collection.

Run once:  python rag/ingest.py
"""
import os
import sys
import csv
import json
import re

# Allow running from backend/ or backend/rag/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

import chromadb

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CHROMA_DB_PATH = os.environ.get("CHROMA_DB_PATH", "./chroma_db")

# Resolve relative CHROMA_DB_PATH relative to backend/
if not os.path.isabs(CHROMA_DB_PATH):
    CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), CHROMA_DB_PATH.lstrip("./"))

COLLECTION_NAME = "eduos"


def get_client():
    return chromadb.PersistentClient(path=CHROMA_DB_PATH)


def chunk_students(filepath: str) -> list[dict]:
    docs = []
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = (
                f"Student ID: {row['student_id']}. "
                f"Name: {row['name']}. "
                f"Batch: {row['batch']}. "
                f"Attendance: {row['attendance_pct']}%."
            )
            docs.append({
                "id": f"student_{row['student_id']}",
                "text": text,
                "metadata": {
                    "source": "students",
                    "student_id": row["student_id"],
                    "name": row["name"],
                    "batch": row["batch"],
                }
            })
    return docs


def chunk_quiz_results(filepath: str) -> list[dict]:
    docs = []
    # Group by student + topic
    groups = {}
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = f"{row['student_id']}_{row['topic']}"
            if key not in groups:
                groups[key] = {"student_id": row["student_id"], "topic": row["topic"], "attempts": []}
            groups[key]["attempts"].append({
                "attempt": row["attempt"],
                "score": row["score"],
                "max_score": row["max_score"],
                "date": row["date"],
            })

    for key, g in groups.items():
        attempts_str = "; ".join(
            [f"Attempt {a['attempt']}: {a['score']}/{a['max_score']} on {a['date']}" for a in g["attempts"]]
        )
        avg_score = sum(int(a["score"]) for a in g["attempts"]) / len(g["attempts"])
        text = (
            f"Student {g['student_id']} quiz results for topic '{g['topic']}': "
            f"{attempts_str}. Average score: {avg_score:.1f}/100."
        )
        docs.append({
            "id": f"quiz_{key}",
            "text": text,
            "metadata": {
                "source": "quiz_results",
                "student_id": g["student_id"],
                "topic": g["topic"],
                "avg_score": str(round(avg_score, 1)),
                "attempts": str(len(g["attempts"])),
            }
        })
    return docs


def chunk_video_engagement(filepath: str) -> list[dict]:
    docs = []
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            text = (
                f"Student {row['student_id']} video engagement: "
                f"Lesson '{row['lesson']}' (topic: {row['topic']}): "
                f"{row['pct_watched']}% watched, status: {row['completion_status']}, date: {row['date']}."
            )
            docs.append({
                "id": f"video_{row['student_id']}_{i}",
                "text": text,
                "metadata": {
                    "source": "video_engagement",
                    "student_id": row["student_id"],
                    "topic": row["topic"],
                    "pct_watched": row["pct_watched"],
                }
            })
    return docs


def chunk_assignments(filepath: str) -> list[dict]:
    docs = []
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            score_str = f"Score: {row['score']}/100." if row.get("score") else "Score: not available."
            text = (
                f"Student {row['student_id']} assignment: "
                f"'{row['assignment']}' (topic: {row['topic']}): "
                f"Status: {row['status']}. {score_str} "
                f"Due: {row.get('due_date', 'N/A')}."
            )
            docs.append({
                "id": f"assign_{row['student_id']}_{i}",
                "text": text,
                "metadata": {
                    "source": "assignments",
                    "student_id": row["student_id"],
                    "topic": row["topic"],
                    "status": row["status"],
                }
            })
    return docs


def chunk_curriculum_pdf(filepath: str) -> list[dict]:
    """Extract text from curriculum PDF and chunk by topic."""
    try:
        import pypdf
        reader = pypdf.PdfReader(filepath)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
    except ImportError:
        # Fallback: use pdfminer if pypdf not available
        try:
            from pdfminer.high_level import extract_text
            full_text = extract_text(filepath)
        except ImportError:
            print("⚠ No PDF reader found. Install pypdf: pip install pypdf")
            return []

    # Split by topic headings
    chunks = []
    # Split on "Topic N:" pattern
    parts = re.split(r"(Topic \d+:.*?)(?=Topic \d+:|$)", full_text, flags=re.DOTALL)
    
    chunk_id = 0
    for part in parts:
        part = part.strip()
        if not part:
            continue
        # Sub-chunk long sections every ~500 chars
        for i in range(0, len(part), 800):
            sub = part[i:i+800].strip()
            if sub:
                chunks.append({
                    "id": f"curriculum_{chunk_id}",
                    "text": sub,
                    "metadata": {"source": "curriculum"}
                })
                chunk_id += 1
    return chunks


def ingest_all():
    client = get_client()
    
    # Delete existing collection to re-ingest cleanly
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"  Deleted existing '{COLLECTION_NAME}' collection.")
    except Exception:
        pass
    
    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    print(f"[OK] Created collection '{COLLECTION_NAME}'")

    all_docs = []
    
    print("  Ingesting students.csv...")
    all_docs += chunk_students(os.path.join(DATA_DIR, "students.csv"))
    
    print("  Ingesting quiz_results.csv...")
    all_docs += chunk_quiz_results(os.path.join(DATA_DIR, "quiz_results.csv"))
    
    print("  Ingesting video_engagement.csv...")
    all_docs += chunk_video_engagement(os.path.join(DATA_DIR, "video_engagement.csv"))
    
    print("  Ingesting assignments.csv...")
    all_docs += chunk_assignments(os.path.join(DATA_DIR, "assignments.csv"))
    
    curriculum_pdf = os.path.join(DATA_DIR, "curriculum.pdf")
    if os.path.exists(curriculum_pdf):
        print("  Ingesting curriculum.pdf...")
        all_docs += chunk_curriculum_pdf(curriculum_pdf)
    else:
        print("  [!] curriculum.pdf not found — run data/generate_pdf.py first")

    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(all_docs), batch_size):
        batch = all_docs[i:i+batch_size]
        collection.upsert(
            ids=[d["id"] for d in batch],
            documents=[d["text"] for d in batch],
            metadatas=[d["metadata"] for d in batch],
        )
    
    print(f"\n[OK] Ingested {len(all_docs)} documents into ChromaDB at: {CHROMA_DB_PATH}")
    print(f"   Collection '{COLLECTION_NAME}' now has {collection.count()} records.")


if __name__ == "__main__":
    ingest_all()
