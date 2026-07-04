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
  { key: "diagnosis", label: "Diagnosis Agent", icon: "🔍", color: "#3b82f6" },
  { key: "critic", label: "Critic Agent", icon: "⚖️", color: "#8b5cf6" },
  { key: "tutor", label: "Tutor Agent", icon: "📚", color: "#06b6d4" },
  { key: "faculty", label: "Faculty Agent", icon: "👨‍🏫", color: "#10b981" },
  { key: "action", label: "Action Agent", icon: "⚡", color: "#f59e0b" },
  { key: "curriculum", label: "Curriculum Agent", icon: "📋", color: "#ec4899" },
  { key: "placement", label: "Placement Agent", icon: "🎯", color: "#14b8a6" },
  { key: "prediction", label: "Prediction Agent", icon: "🔮", color: "#a855f7" },
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
        // Pre-select Aryan Sharma for demo
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

  return (
    <div className="mesh-bg min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
            E
          </div>
          <span className="font-semibold text-white/90 tracking-tight">EduOS AI</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
            v1.0 · Hackathon
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/40">
          <span>8 Agents</span>
          <span>·</span>
          <span>RAG Powered</span>
          <span>·</span>
          <span>Real-time</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-300 text-sm animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Autonomous Multi-Agent System · Live Demo
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4 animate-fade-slide-up">
          <span className="text-white">EduOS </span>
          <span className="gradient-text">AI</span>
        </h1>
        <p className="text-xl text-white/50 max-w-2xl mb-3 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
          Autonomous AI Operating System for Education
        </p>
        <p className="text-sm text-white/30 max-w-xl mb-12 animate-fade-slide-up" style={{ animationDelay: "0.15s" }}>
          8 collaborating agents analyze student data, verify each other's conclusions,
          generate personalized interventions, and predict outcomes — in real time.
        </p>

        {/* Agent pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {AGENTS.map((a) => (
            <div
              key={a.key}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border"
              style={{
                background: `${a.color}14`,
                borderColor: `${a.color}30`,
                color: a.color,
              }}
            >
              <span>{a.icon}</span>
              <span>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Student Selector Card */}
        <div
          className="glass w-full max-w-lg p-6 animate-fade-slide-up"
          style={{ animationDelay: "0.25s" }}
        >
          <h2 className="text-lg font-semibold text-white/90 mb-1">Select a Student</h2>
          <p className="text-sm text-white/40 mb-4">
            Choose a student and run the full 8-agent diagnostic pipeline
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              ⚠ {error}
            </div>
          )}

          {fetching ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <select
                id="student-select"
                value={selected?.student_id || ""}
                onChange={(e) => {
                  const s = students.find((st) => st.student_id === e.target.value);
                  setSelected(s || null);
                }}
                className="w-full mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all cursor-pointer"
              >
                <option value="" className="bg-gray-900">
                  — Select a student —
                </option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id} className="bg-gray-900">
                    {s.name} · {s.batch} · {s.attendance_pct}% attendance
                  </option>
                ))}
              </select>

              {selected && (
                <div className="mb-4 grid grid-cols-3 gap-2 animate-fade-in">
                  <div className="px-3 py-2 rounded-lg bg-white/4 border border-white/6 text-center">
                    <div className="text-xs text-white/40 mb-0.5">ID</div>
                    <div className="text-sm font-mono text-white/70">{selected.student_id}</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-white/4 border border-white/6 text-center">
                    <div className="text-xs text-white/40 mb-0.5">Batch</div>
                    <div className="text-sm text-white/70">{selected.batch}</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-white/4 border border-white/6 text-center">
                    <div className="text-xs text-white/40 mb-0.5">Attendance</div>
                    <div
                      className="text-sm font-semibold"
                      style={{
                        color:
                          parseInt(selected.attendance_pct) < 65
                            ? "#ef4444"
                            : parseInt(selected.attendance_pct) < 75
                            ? "#f59e0b"
                            : "#10b981",
                      }}
                    >
                      {selected.attendance_pct}%
                    </div>
                  </div>
                </div>
              )}

              <button
                id="run-pipeline-btn"
                onClick={handleRun}
                disabled={!selected || loading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                    : "rgba(255,255,255,0.08)",
                  color: "white",
                  boxShadow: selected ? "0 0 24px rgba(59,130,246,0.35)" : "none",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                    </svg>
                    Launching Pipeline...
                  </span>
                ) : (
                  "🚀 Run Full Agent Pipeline"
                )}
              </button>
            </>
          )}
        </div>

        {/* Architecture hint */}
        <p className="mt-8 text-xs text-white/25 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          Diagnosis → Critic (self-verification) → Tutor → Faculty → Action → Curriculum → Placement → Prediction
        </p>
      </main>
    </div>
  );
}
