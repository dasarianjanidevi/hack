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

    const url = `${API_BASE}/api/run/stream`;
    fetch(url, {
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
          speaker: (data as {speaker:string;message:string;message_type:string}).speaker,
          message: (data as {speaker:string;message:string;message_type:string}).message,
          message_type: (data as {speaker:string;message:string;message_type:string}).message_type,
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

    if (status === "done") {
      setActiveTab(step);
    }
  };

  const completedCount = Object.values(steps).filter((s) => s.status === "done").length;
  const progress = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="mesh-bg min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 sticky top-0 z-30 backdrop-blur-xl bg-[#070b14]/80">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-white/60 hover:text-white/90 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </a>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">E</div>
            <span className="font-semibold text-sm text-white/80">EduOS AI</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-white/50">
            Analyzing: <span className="text-white font-medium">{studentName}</span>
          </div>
          {completed ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/25 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Pipeline Complete
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-400/10 border border-blue-400/25 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Running · {completedCount}/{STEPS.length}
            </span>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="progress-bar rounded-none">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            background: completed
              ? "linear-gradient(90deg,#10b981,#34d399)"
              : "linear-gradient(90deg,#3b82f6,#8b5cf6)",
          }}
        />
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* Left — Agent Timeline */}
        <aside className="w-64 flex-shrink-0 border-r border-white/6 overflow-y-auto p-4">
          <AgentTimeline
            steps={STEPS}
            stepStates={steps}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
        </aside>

        {/* Center — Result Panel */}
        <main className="flex-1 overflow-y-auto p-6">
          <ResultsPanel
            steps={STEPS}
            stepStates={steps}
            activeTab={activeTab}
            studentName={studentName}
            conversation={conversation}
          />
        </main>

        {/* Right — Agent Conversation */}
        <aside className="w-72 flex-shrink-0 border-l border-white/6 overflow-y-auto">
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
        <div className="text-white/40 text-sm animate-pulse">Loading pipeline...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
