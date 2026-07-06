"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Student {
  student_id: string;
  name: string;
  batch: string;
  attendance_pct: string;
}

const AGENTS = [
  { key: "diagnosis",  label: "Diagnosis",  icon: "🔍", color: "#3b82f6" },
  { key: "critic",     label: "Critic",     icon: "⚖️", color: "#8b5cf6" },
  { key: "tutor",      label: "Tutor",      icon: "📚", color: "#06b6d4" },
  { key: "faculty",    label: "Faculty",    icon: "👨‍🏫", color: "#10b981" },
  { key: "action",     label: "Action",     icon: "⚡", color: "#f59e0b" },
  { key: "curriculum", label: "Curriculum", icon: "📋", color: "#ec4899" },
  { key: "placement",  label: "Placement",  icon: "🎯", color: "#14b8a6" },
  { key: "prediction", label: "Prediction", icon: "🔮", color: "#a855f7" },
];

const STATS = [
  { value: "8", label: "AI Agents" },
  { value: "RAG", label: "Powered" },
  { value: "Live", label: "Streaming" },
  { value: "100%", label: "Autonomous" },
];

export default function HomePage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((r) => r.json())
      .then((d) => {
        setStudents(d.students || []);
        const aryan = d.students?.find((s: Student) => s.name === "Aryan Sharma");
        if (aryan) setSelected(aryan);
      })
      .catch(() => setError("Cannot connect to backend. Is FastAPI running on port 8000?"))
      .finally(() => setFetching(false));
  }, []);

  const handleRun = () => {
    if (!selected) return;
    setLoading(true);
    router.push(`/dashboard?student=${encodeURIComponent(selected.name)}`);
  };

  const attendanceColor = (pct: string) => {
    const n = parseInt(pct);
    if (n < 65) return "#ef4444";
    if (n < 75) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="mesh-bg min-h-screen flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(5,8,15,0.85)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: "white",
            boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
          }}>E</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em" }}>
            EduOS<span style={{ color: "#3b82f6" }}> AI</span>
          </span>
          <span className="badge badge-blue" style={{ fontSize: 11 }}>v1.0 · Hackathon</span>
        </div>

        {/* Nav stats */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 24px 80px", textAlign: "center" }}>

        {/* Live badge */}
        <div className="badge badge-blue animate-fade-in" style={{ marginBottom: 28, gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "pulse-dot 1.8s ease-in-out infinite", display: "inline-block" }} />
          Autonomous Multi-Agent System · Live Demo
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-slide-up"
          style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}
        >
          <span style={{ color: "rgba(255,255,255,0.95)" }}>EduOS </span>
          <span className="gradient-text">AI</span>
        </h1>

        <p
          className="animate-fade-slide-up"
          style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", maxWidth: 480, lineHeight: 1.7, marginBottom: 12, animationDelay: "0.08s" }}
        >
          Autonomous AI Operating System for Education
        </p>

        <p
          className="animate-fade-slide-up"
          style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", maxWidth: 560, lineHeight: 1.8, marginBottom: 52, animationDelay: "0.14s" }}
        >
          8 collaborating agents analyze student data, verify each other's conclusions,
          generate personalized interventions, and predict outcomes — in real time.
        </p>

        {/* Agent pills */}
        <div className="animate-fade-in" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 56, animationDelay: "0.2s" }}>
          {AGENTS.map((a) => (
            <div
              key={a.key}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 99,
                background: `${a.color}12`, border: `1px solid ${a.color}28`,
                fontSize: 12, fontWeight: 500, color: a.color,
                transition: "transform 0.15s ease",
              }}
            >
              <span style={{ fontSize: 14 }}>{a.icon}</span>
              {a.label}
            </div>
          ))}
        </div>

        {/* ── Selector Card ────────────────────────────────────────────── */}
        <div
          className="glass animate-fade-slide-up"
          style={{ width: "100%", maxWidth: 460, padding: "32px", animationDelay: "0.24s" }}
        >
          {/* Card header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: 6, letterSpacing: "-0.02em" }}>
              Select a Student
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              Choose a student to run the full 8-agent diagnostic pipeline
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="badge badge-red" style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          {/* Loading skeletons */}
          {fetching ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 44 }} />
              ))}
            </div>
          ) : (
            <>
              {/* Select */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <select
                  id="student-select"
                  value={selected?.student_id || ""}
                  onChange={(e) => {
                    const s = students.find((st) => st.student_id === e.target.value);
                    setSelected(s || null);
                  }}
                  style={{
                    width: "100%", padding: "12px 16px",
                    borderRadius: 10, appearance: "none",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.85)", fontSize: 14,
                    outline: "none", cursor: "pointer",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <option value="" style={{ background: "#0a0f1a" }}>— Select a student —</option>
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id} style={{ background: "#0a0f1a" }}>
                      {s.name} · {s.batch} · {s.attendance_pct}% attendance
                    </option>
                  ))}
                </select>
                {/* Chevron */}
                <svg style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Student info pills */}
              {selected && (
                <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                  <div className="stat-block">
                    <div className="stat-label">ID</div>
                    <div className="stat-value" style={{ fontFamily: "monospace", fontSize: 13 }}>{selected.student_id}</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-label">Batch</div>
                    <div className="stat-value">{selected.batch}</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-label">Attendance</div>
                    <div className="stat-value" style={{ color: attendanceColor(selected.attendance_pct) }}>
                      {selected.attendance_pct}%
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                id="run-pipeline-btn"
                onClick={handleRun}
                disabled={!selected || loading}
                className="btn-primary"
                style={{ width: "100%", fontSize: 14, padding: "13px 24px" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin-ring" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                    </svg>
                    Launching Pipeline...
                  </>
                ) : (
                  <>🚀 Run Full Agent Pipeline</>
                )}
              </button>
            </>
          )}
        </div>

        {/* Pipeline flow */}
        <p className="animate-fade-in" style={{ marginTop: 36, fontSize: 11, color: "rgba(255,255,255,0.18)", letterSpacing: "0.04em", animationDelay: "0.4s" }}>
          Diagnosis → Critic → Tutor → Faculty → Action → Curriculum → Placement → Prediction
        </p>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
          EduOS AI · Built for Hackathon · Powered by RAG + Multi-Agent LLM Pipeline
        </p>
      </footer>
    </div>
  );
}
