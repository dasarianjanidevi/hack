# EduOS AI — Setup & Run Guide

## Quick Start (2 terminals)

### Terminal 1 — Backend

```powershell
cd C:\Users\Nxtwave\Desktop\hack\backend

# 1. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt
pip install pypdf  # For PDF reading

# 3. Copy and fill in your API key
copy .env.example .env
# Edit .env: set OPENAI_API_KEY=sk-... (or ANTHROPIC_API_KEY)
# Set LLM_PROVIDER=openai  (or anthropic)

# 4. Generate the curriculum PDF
python data/generate_pdf.py

# 5. Ingest all data into ChromaDB (run once)
python rag/ingest.py

# 6. Start the FastAPI server
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Frontend

```powershell
cd C:\Users\Nxtwave\Desktop\hack\frontend
npm run dev
```

Then open: **http://localhost:3000**

---

## Architecture

```
Student Selected
      │
      ▼
┌─────────────────────────────────────────────────────┐
│                   8-Agent Pipeline                   │
│                                                     │
│  1. Diagnosis   ──── finds weak topic + evidence    │
│         │                                           │
│  2. Critic      ──── cross-verifies (LIVE CHAT)     │
│         │                                           │
│  3. Tutor       ──── 5-day personalized plan        │
│         │                                           │
│  4. Faculty     ──── instructor intervention note   │
│         │                                           │
│  5. Action      ──── revision class + quiz          │
│         │                                           │
│  6. Curriculum  ──── cohort-level analysis          │
│         │                                           │
│  7. Placement   ──── skill gap + readiness score    │
│         │                                           │
│  8. Prediction  ──── grade + dropout + placement %  │
└─────────────────────────────────────────────────────┘
      │
      ▼
  Dashboard (live SSE stream)
```

## Data Sources

| File | Contents |
|------|----------|
| `students.csv` | 60 students, attendance |
| `quiz_results.csv` | Scores per topic per attempt |
| `video_engagement.csv` | Lesson watch % |
| `assignments.csv` | Submission status + scores |
| `coding_platform.csv` | Problems solved, success rate |
| `support_chats.csv` | Student questions/complaints |
| `placement_data.csv` | Resume skills, mock scores |
| `curriculum.pdf` | 10 topics, outcomes, prereqs |

**Planted story:** `Aryan Sharma (S042, Batch-B)` — fails Recursion across all 5 data sources.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/students` | List all students |
| POST | `/api/run/stream` | Start pipeline + SSE stream |
| GET | `/api/result/{run_id}` | Full JSON result |
| GET | `/health` | Health check |

## Tech Stack

- **Backend**: FastAPI + Uvicorn
- **LLM**: OpenAI GPT-4o or Anthropic Claude
- **RAG**: ChromaDB (local, persistent)
- **Frontend**: Next.js 14 + Tailwind CSS
- **Streaming**: Server-Sent Events (SSE)
- **Data**: CSV + PDF (fabricated)
