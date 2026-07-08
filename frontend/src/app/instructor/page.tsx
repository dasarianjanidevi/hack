"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOPICS = [
  "Arrays",
  "Linked Lists",
  "Recursion",
  "Trees",
  "Sorting",
  "Dynamic Programming",
  "Graphs",
];

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

interface Student { student_id: string; name: string; batch: string; attendance_pct: string; }
interface TopicRow {
  topic: string;
  quiz_score: string;
  videos_completed: boolean;
  coding_part1: boolean;
  coding_part2: boolean;
  notes: string;
}
interface Report {
  student_name: string;
  batch: string;
  overall_completion_pct: number;
  average_quiz_score: number;
  risk_level: string;
  risk_color: string;
  weak_topics: string[];
  pending_tasks: string[];
  videos_completed: string;
  coding_part1_done: string;
  coding_part2_done: string;
  improvement_vs_last_month: number | null;
  improved_topics: string[];
  declined_topics: string[];
  recommendations: string[];
  generated_at: string;
}

function emptyRows(): TopicRow[] {
  return TOPICS.map((t) => ({
    topic: t, quiz_score: "", videos_completed: false, coding_part1: false, coding_part2: false, notes: "",
  }));
}

const now = new Date();

export default function InstructorPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState<TopicRow[]>(emptyRows());
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [generatingData, setGeneratingData] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [performanceLevel, setPerformanceLevel] = useState("auto");
  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);
  const [hasData, setHasData] = useState(false);

  // Load students on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/instructor/students`)
      .then((r) => r.json())
      .then((d) => {
        setStudents(d.students || []);
        if (d.students?.length > 0) setSelectedStudent(d.students[0]);
      })
      .catch(() => setStatus({ type: "error", msg: "Cannot reach backend. Is FastAPI running?" }));
  }, []);

  // Load progress when student/month/year changes
  const loadProgress = useCallback(async () => {
    if (!selectedStudent) return;
    setLoadingProgress(true);
    setReport(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/instructor/progress/${selectedStudent.student_id}/${month}/${year}`
      );
      const d = await res.json();
      if (res.ok) {
        const loadedRows = TOPICS.map((topic) => {
          const saved = (d.progress || []).find((p: any) => p.topic === topic);
          return {
            topic,
            quiz_score: saved?.quiz_score != null ? String(saved.quiz_score) : "",
            videos_completed: Boolean(saved?.videos_completed),
            coding_part1: Boolean(saved?.coding_part1),
            coding_part2: Boolean(saved?.coding_part2),
            notes: saved?.notes || "",
          };
        });
        setRows(loadedRows);
        setHasData(d.has_data || false);
      }
    } catch {
      setRows(emptyRows());
    } finally {
      setLoadingProgress(false);
    }
  }, [selectedStudent, month, year]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  // Auto-generate data
  const handleGenerate = async () => {
    if (!selectedStudent) return;
    setGeneratingData(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/instructor/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          month,
          year,
          performance_level: performanceLevel,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        // Populate rows from generated data
        const newRows = TOPICS.map((topic) => {
          const gen = (d.topics || []).find((t: any) => t.topic === topic);
          return {
            topic,
            quiz_score: gen ? String(gen.quiz_score) : "",
            videos_completed: Boolean(gen?.videos_completed),
            coding_part1: Boolean(gen?.coding_part1),
            coding_part2: Boolean(gen?.coding_part2),
            notes: "",
          };
        });
        setRows(newRows);
        setHasData(true);
        setStatus({ type: "success", msg: `✅ Generated realistic data for ${d.rows_generated} topics (${performanceLevel} profile). Review below or save directly.` });
      } else {
        setStatus({ type: "error", msg: d.detail || "Generation failed." });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error during data generation." });
    } finally {
      setGeneratingData(false);
    }
  };

  // Save progress
  const handleSave = async () => {
    if (!selectedStudent) return;
    setSavingProgress(true);
    setStatus(null);
    const payload = {
      student_id: selectedStudent.student_id,
      month,
      year,
      topics: rows.map((r) => ({
        topic: r.topic,
        quiz_score: r.quiz_score !== "" ? parseFloat(r.quiz_score) : null,
        videos_completed: r.videos_completed,
        coding_part1: r.coding_part1,
        coding_part2: r.coding_part2,
        notes: r.notes,
      })),
    };
    try {
      const res = await fetch(`${API_BASE}/api/instructor/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (res.ok) {
        setHasData(true);
        setStatus({ type: "success", msg: `✅ Progress saved for ${selectedStudent.name} — ${MONTHS[month - 1].label} ${year}` });
      } else {
        setStatus({ type: "error", msg: d.detail || "Save failed." });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error during save." });
    } finally {
      setSavingProgress(false);
    }
  };

  // Generate report
  const handleReport = async () => {
    if (!selectedStudent) return;
    if (!hasData) {
      setStatus({ type: "error", msg: "⚠️ No progress data saved yet. Auto-generate or manually fill data first, then Save." });
      return;
    }
    setGeneratingReport(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/instructor/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: selectedStudent.student_id, month, year }),
      });
      const d = await res.json();
      if (res.ok) {
        setReport(d);
        setStatus({ type: "success", msg: "📊 Report generated successfully!" });
      } else {
        setStatus({ type: "error", msg: d.detail || "Report generation failed." });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error during report generation." });
    } finally {
      setGeneratingReport(false);
    }
  };

  const updateRow = (idx: number, field: keyof TopicRow, value: any) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const attendanceColor = (pct: string) => {
    const n = parseInt(pct);
    if (n < 65) return "#ef4444";
    if (n < 75) return "#f59e0b";
    return "#10b981";
  };

  const riskBg = (level: string) => {
    if (level === "High") return { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "#ef444430" };
    if (level === "Medium") return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "#f59e0b30" };
    return { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "#10b98130" };
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", fontFamily: "Inter, sans-serif" }}>
      {/* ── Header ── */}
      <header style={{
        padding: "0 32px", height: 64, display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(5,8,15,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            ← Home
          </Link>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #10b981, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              👨‍🏫
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Instructor Portal</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>EduOS AI — Student Progress Manager</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/students" style={{
            fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none",
            padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
          }}>
            ➕ Add Student
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Section 1: Student + Month Selector ── */}
        <div className="glass-premium" style={{ padding: "28px 28px", marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            Step 1 — Select Student & Time Period
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 16 }}>
            {/* Student */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8 }}>Student</label>
              <select
                value={selectedStudent?.student_id || ""}
                onChange={(e) => {
                  const s = students.find((st) => st.student_id === e.target.value) || null;
                  setSelectedStudent(s);
                  setReport(null);
                }}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)", outline: "none", cursor: "pointer",
                }}
              >
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id} style={{ background: "#0a0f1a" }}>
                    {s.student_id} — {s.name} ({s.batch})
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                  Attendance:&nbsp;
                  <span style={{ fontWeight: 700, color: attendanceColor(selectedStudent.attendance_pct) }}>
                    {selectedStudent.attendance_pct}%
                  </span>
                </p>
              )}
            </div>
            {/* Month */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8 }}>Month</label>
              <select
                value={month}
                onChange={(e) => { setMonth(Number(e.target.value)); setReport(null); }}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)", outline: "none", cursor: "pointer",
                }}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value} style={{ background: "#0a0f1a" }}>{m.label}</option>
                ))}
              </select>
            </div>
            {/* Year */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8 }}>Year</label>
              <select
                value={year}
                onChange={(e) => { setYear(Number(e.target.value)); setReport(null); }}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)", outline: "none", cursor: "pointer",
                }}
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y} style={{ background: "#0a0f1a" }}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Section 2: Auto-Generate Controls ── */}
        <div className="glass-premium" style={{ padding: "22px 28px", marginBottom: 24, borderLeft: "3px solid #10b981", background: "rgba(16,185,129,0.03)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
            Step 2 — Auto-Generate Learning Data (or Fill Manually Below)
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8 }}>
                Performance Profile
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { v: "auto", label: "Auto (from Attendance)", icon: "🤖" },
                  { v: "strong", label: "Strong", icon: "💪" },
                  { v: "average", label: "Average", icon: "📊" },
                  { v: "weak", label: "Weak", icon: "⚠️" },
                ].map(({ v, label, icon }) => (
                  <button
                    key={v}
                    onClick={() => setPerformanceLevel(v)}
                    style={{
                      padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      border: performanceLevel === v ? "1.5px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                      background: performanceLevel === v ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                      color: performanceLevel === v ? "#10b981" : "rgba(255,255,255,0.55)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generatingData || !selectedStudent}
              style={{
                padding: "12px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: generatingData ? "wait" : "pointer",
                background: generatingData ? "rgba(16,185,129,0.1)" : "linear-gradient(135deg, #10b981, #14b8a6)",
                color: generatingData ? "#10b981" : "#fff",
                border: generatingData ? "1px solid #10b98140" : "none",
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s ease",
                boxShadow: generatingData ? "none" : "0 4px 20px rgba(16,185,129,0.3)",
                flexShrink: 0,
              }}
            >
              {generatingData ? (
                <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Generating…</>
              ) : (
                <>🎲 Auto-Generate Data</>
              )}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
            Generates realistic videos watched, coding completions, and quiz scores for all 7 topics based on the selected profile. Data is saved automatically.
          </p>
        </div>

        {/* Status message */}
        {status && (
          <div style={{
            padding: "14px 18px", borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 500,
            background: status.type === "success" ? "rgba(16,185,129,0.1)" : status.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
            border: `1px solid ${status.type === "success" ? "#10b98130" : status.type === "error" ? "#ef444430" : "#3b82f630"}`,
            color: status.type === "success" ? "#10b981" : status.type === "error" ? "#ef4444" : "#3b82f6",
          }}>
            {status.msg}
          </div>
        )}

        {/* ── Section 3: Topic Progress Table ── */}
        <div className="glass-premium" style={{ padding: "28px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Step 3 — Topic-by-Topic Progress
              {loadingProgress && <span style={{ marginLeft: 8, color: "#3b82f6" }}>Loading…</span>}
            </p>
            {hasData && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid #10b98120", padding: "3px 10px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                ✓ Saved Data Loaded
              </span>
            )}
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.6fr 80px 80px 80px 110px 1fr",
            gap: 0, padding: "8px 16px", marginBottom: 4,
            borderRadius: 8, background: "rgba(255,255,255,0.025)",
          }}>
            {["Topic", "Video", "Code 1", "Code 2", "Quiz Score", "Notes"].map((h) => (
              <p key={h} style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map((row, idx) => (
              <div
                key={row.topic}
                style={{
                  display: "grid", gridTemplateColumns: "1.6fr 80px 80px 80px 110px 1fr",
                  gap: 0, padding: "12px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                  alignItems: "center",
                }}
              >
                {/* Topic name */}
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{row.topic}</p>

                {/* Video checkbox */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => updateRow(idx, "videos_completed", !row.videos_completed)}
                    style={{
                      width: 28, height: 28, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      background: row.videos_completed ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)",
                      border: row.videos_completed ? "1.5px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13, transition: "all 0.15s ease",
                    }}
                  >
                    {row.videos_completed ? "✓" : ""}
                  </button>
                </div>

                {/* Coding 1 checkbox */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => updateRow(idx, "coding_part1", !row.coding_part1)}
                    style={{
                      width: 28, height: 28, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      background: row.coding_part1 ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                      border: row.coding_part1 ? "1.5px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13, transition: "all 0.15s ease",
                    }}
                  >
                    {row.coding_part1 ? "✓" : ""}
                  </button>
                </div>

                {/* Coding 2 checkbox */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => updateRow(idx, "coding_part2", !row.coding_part2)}
                    style={{
                      width: 28, height: 28, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      background: row.coding_part2 ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                      border: row.coding_part2 ? "1.5px solid #8b5cf6" : "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13, transition: "all 0.15s ease",
                    }}
                  >
                    {row.coding_part2 ? "✓" : ""}
                  </button>
                </div>

                {/* Quiz score */}
                <div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="—"
                    value={row.quiz_score}
                    onChange={(e) => updateRow(idx, "quiz_score", e.target.value)}
                    style={{
                      width: 90, padding: "6px 10px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                      color: row.quiz_score
                        ? (Number(row.quiz_score) >= 60 ? "#10b981" : "#ef4444")
                        : "rgba(255,255,255,0.4)",
                      outline: "none", textAlign: "center",
                    }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <input
                    type="text"
                    placeholder="Optional notes…"
                    value={row.notes}
                    onChange={(e) => updateRow(idx, "notes", e.target.value)}
                    style={{
                      width: "100%", padding: "6px 10px", borderRadius: 8, fontSize: 12,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.7)", outline: "none",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { color: "#10b981", label: "Video Completed" },
              { color: "#3b82f6", label: "Coding Part 1" },
              { color: "#8b5cf6", label: "Coding Part 2" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>≥60</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>passing quiz</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>&lt;60</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>needs intervention</span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          <button
            onClick={handleSave}
            disabled={savingProgress || !selectedStudent}
            style={{
              padding: "13px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: savingProgress ? "rgba(255,255,255,0.04)" : "rgba(59,130,246,0.15)",
              border: "1.5px solid #3b82f640", color: "#3b82f6",
              cursor: savingProgress ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
            }}
          >
            {savingProgress ? "💾 Saving…" : "💾 Save Progress"}
          </button>

          <button
            onClick={handleReport}
            disabled={generatingReport || !selectedStudent}
            style={{
              padding: "13px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: generatingReport
                ? "rgba(255,255,255,0.04)"
                : "linear-gradient(135deg, #8b5cf6, #ec4899)",
              border: generatingReport ? "1.5px solid rgba(255,255,255,0.1)" : "none",
              color: generatingReport ? "rgba(255,255,255,0.5)" : "#fff",
              cursor: generatingReport ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
              boxShadow: generatingReport ? "none" : "0 4px 20px rgba(139,92,246,0.3)",
            }}
          >
            {generatingReport ? (
              <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Generating Report…</>
            ) : (
              <>📊 Generate AI Report</>
            )}
          </button>

          <div style={{ flex: 1 }} />
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", alignSelf: "center" }}>
            Tip: Auto-Generate → Save Progress → Generate AI Report
          </p>
        </div>

        {/* ── Report Display ── */}
        {report && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.07)" }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                📊 AI-Generated Report — {report.student_name}
              </p>
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {[
                { label: "Completion", value: `${report.overall_completion_pct}%`, color: report.overall_completion_pct >= 70 ? "#10b981" : "#f59e0b" },
                { label: "Avg Quiz Score", value: report.average_quiz_score.toFixed(1), color: report.average_quiz_score >= 60 ? "#10b981" : "#ef4444" },
                { label: "Videos Done", value: report.videos_completed, color: "#3b82f6" },
                { label: "Coding 1 Done", value: report.coding_part1_done, color: "#8b5cf6" },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-premium" style={{ padding: "20px 18px", textAlign: "center" }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 6 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Risk + Improvement */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="glass-premium" style={{
                padding: "20px 22px",
                borderLeft: `3px solid ${riskBg(report.risk_level).color}`,
                background: riskBg(report.risk_level).bg,
              }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Risk Level</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: riskBg(report.risk_level).color }}>
                  {report.risk_level === "High" ? "🚨" : report.risk_level === "Medium" ? "⚠️" : "✅"} {report.risk_level}
                </p>
              </div>
              <div className="glass-premium" style={{ padding: "20px 22px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Month-over-Month</p>
                {report.improvement_vs_last_month !== null ? (
                  <p style={{ fontSize: 26, fontWeight: 800, color: report.improvement_vs_last_month >= 0 ? "#10b981" : "#ef4444" }}>
                    {report.improvement_vs_last_month >= 0 ? "▲" : "▼"} {Math.abs(report.improvement_vs_last_month)} pts
                  </p>
                ) : (
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>No previous month data</p>
                )}
              </div>
            </div>

            {/* Weak topics & Pending */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="glass-premium" style={{ padding: "22px 22px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>⚠️ Weak Topics</p>
                {report.weak_topics.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {report.weak_topics.map((t) => (
                      <span key={t} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid #ef444430", color: "#ef4444" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "#10b981" }}>✓ No weak topics identified</p>
                )}
              </div>
              <div className="glass-premium" style={{ padding: "22px 22px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>📋 Pending Tasks</p>
                {report.pending_tasks.length > 0 ? (
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {report.pending_tasks.slice(0, 5).map((task, i) => (
                      <li key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", gap: 8 }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0 }}>→</span> {task}
                      </li>
                    ))}
                    {report.pending_tasks.length > 5 && (
                      <li style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>+{report.pending_tasks.length - 5} more…</li>
                    )}
                  </ul>
                ) : (
                  <p style={{ fontSize: 12, color: "#10b981" }}>✓ All tasks completed!</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="glass-premium" style={{ padding: "24px 24px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                  🤖 AI Instructor Recommendations
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {report.recommendations.map((rec, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 14, padding: "14px 16px", borderRadius: 10,
                      background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)",
                    }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>
                        {i === 0 ? "🎯" : i === 1 ? "📚" : i === 2 ? "⏰" : "📌"}
                      </span>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>{rec}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 14 }}>
                  Generated at {new Date(report.generated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: #0a0f1a; color: #e2e8f0; }
      `}</style>
    </main>
  );
}
