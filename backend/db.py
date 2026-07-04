"""
SQLite Database Setup — EduOS AI
Stores monthly progress entries entered by instructors.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "eduos.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_connection()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS monthly_progress (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id      TEXT    NOT NULL,
                month           INTEGER NOT NULL,
                year            INTEGER NOT NULL,
                topic           TEXT    NOT NULL,
                quiz_score      REAL    DEFAULT NULL,
                videos_completed INTEGER DEFAULT 0,
                coding_part1    INTEGER DEFAULT 0,
                coding_part2    INTEGER DEFAULT 0,
                notes           TEXT    DEFAULT '',
                created_at      TEXT    DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, month, year, topic)
            );

            CREATE TABLE IF NOT EXISTS ai_reports (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id      TEXT    NOT NULL,
                month           INTEGER NOT NULL,
                year            INTEGER NOT NULL,
                report_json     TEXT    NOT NULL,
                created_at      TEXT    DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        print("[DB] Database initialized.")
    finally:
        conn.close()
