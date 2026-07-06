"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AgentTimeline from "@/components/AgentTimeline";
import ConversationPanel from "@/components/ConversationPanel";
import ResultsPanel from "@/components/ResultsPanel";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type StepStatus = "pending" | "running" | "done" | "error";

export interface StepState {
  status: StepStatus;
  data: Record<string, unknown> | null;
  error: string | null;
}

export interface ConversationMessage {
  speaker: string;
  message: string;
  message_type: string;
  timestamp: number;
}

const STEPS = [
  { key: "diagnosis",  label: "Diagnosis",  icon: "🔍", color: "#3b82f6", desc: "Identifies weak topic + evidence" },
  { key: "critic",     label: "Critic",     icon: "⚖️", color: "#8b5cf6", desc: "Cross-verifies diagnosis" },
  { key: "tutor",      label: "Tutor",      icon: "📚", color: "#06b6d4", desc: "5-day personalized study plan" },
  { key: "faculty",    label: "Faculty",    icon: "👨‍🏫", color: "#10b981", desc: "Instructor intervention note" },
  { key: "action",     label: "Action",     icon: "⚡", color: "#f59e0b", desc: "Creates revision class + quiz" },
  { key: "curriculum", label: "Curriculum", icon: "📋", color: "#ec4899", desc: "Cohort-level analysis" },
  { key: "placement",  label: "Placement",  icon: "🎯", color: "#14b8a6", desc: "Skill gap + readiness score" },
  { key: "prediction", label: "Prediction", icon: "🔮", color: "#a855f7", desc: "Grade, dropout & placement prediction" },
];

function DashboardContent() {
  const params = useSearchParams();
  const studentName = params.get("student") || "Aryan Sharma";
  const [steps, setSteps] = useState<Record<string, StepState>>(
    Object.fromEntries(STEPS.map((s) => [s.key, { status: "pending", data: null, error: null }]))
  );
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [activeTab, setActiveTab] = useState<string>("diagnosis");
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (started) return;
    setStarted(true);

    fetch(`${API_BASE}/api/run/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_name: studentName }),
    }).then(async (res) => {
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          try {
            const payload = JSON.parse(line.slice(5).trim());
            handleEvent(payload);
          } catch {}
        }
      }
    }).catch(console.error);

    return () => { esRef.current?.close(); };
  }, [studentName]);

  const handleEvent = (payload: {
    step: string;
    status: string;
    data: Record<string, unknown> | null;
    error: string | null;
  }) => {
    const { step, status, data, error } = payload;

    if (step === "critic_conversation" && status === "conversation") {
      setConversation((prev) => [
        ...prev,
        {
          speaker: (data as { speaker: string; message: string; message_type: string }).speaker,
          message: (data as { speaker: string; message: string; message_type: string }).message,
          message_type: (data as { speaker: string; message: string; message_type: string }).message_type,
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    if (step === "complete") { setCompleted(true); return; }

    setSteps((prev) => ({
      ...prev,
      [step]: { status: status as StepStatus, data: data ?? null, error: error ?? null },
    }));

    if (status === "done") setActiveTab(step);
  };

  const completedCount = Object.values(steps).filter((s) => s.status === "done").length;
  const progress = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="mesh-bg min-h-screen flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 28px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "sticky", top: 0, zIndex: 30,
        backdropFilter: "blur(20px)",
        background: "rgba(5,8,15,0.88)",
        flexShrink: 0,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a href="/" style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500,
            textDecoration: "none", transition: "color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </a>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "white",
            }}>E</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.02em" }}>EduOS AI</span>
          </div>
        </div>

        {/* Center — student name */}
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Analyzing:{" "}
          <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{studentName}</span>
        </div>

        {/* Right — status */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Step counter */}
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>
            {completedCount}/{STEPS.length} agents
          </span>

          {completed ? (
            <span className="badge badge-green">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
              Pipeline Complete
            </span>
          ) : (
            <span className="badge badge-blue">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", animation: "pulse-dot 1.6s ease-in-out infinite" }} />
              Running · {progress}%
            </span>
          )}
        </div>
      </header>

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      <div className="progress-bar" style={{ borderRadius: 0 }}>
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            background: completed
              ? "linear-gradient(90deg,#10b981,#34d399)"
              : "linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)",
          }}
        />
      </div>

      {/* ── Three-column Layout ──────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 65px)" }}>

        {/* Left — Timeline sidebar */}
        <aside style={{
          width: 240, flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.05)",
          overflowY: "auto", padding: "20px 12px",
          background: "rgba(10,15,26,0.4)",
        }}>
          <AgentTimeline
            steps={STEPS}
            stepStates={steps}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
        </aside>

        {/* Center — Results */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <ResultsPanel
            steps={STEPS}
            stepStates={steps}
            activeTab={activeTab}
            studentName={studentName}
            conversation={conversation}
          />
        </main>

        {/* Right — Conversation */}
        <aside style={{
          width: 288, flexShrink: 0,
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          overflowY: "auto",
          background: "rgba(10,15,26,0.4)",
        }}>
          <ConversationPanel messages={conversation} />
        </aside>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="mesh-bg min-h-screen flex items-center justify-center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "2px solid rgba(59,130,246,0.2)",
            borderTop: "2px solid #3b82f6",
            animation: "spin-ring 0.9s linear infinite",
          }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Loading pipeline...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
