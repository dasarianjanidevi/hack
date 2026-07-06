"use client";

import type { StepState, ConversationMessage } from "@/app/dashboard/page";
import DiagnosisCard from "./results/DiagnosisCard";
import CriticCard from "./results/CriticCard";
import TutorCard from "./results/TutorCard";
import FacultyCard from "./results/FacultyCard";
import ActionCard from "./results/ActionCard";
import CurriculumCard from "./results/CurriculumCard";
import PlacementCard from "./results/PlacementCard";
import PredictionCard from "./results/PredictionCard";

interface Step { key: string; label: string; icon: string; color: string; desc: string; }

interface Props {
  steps: Step[];
  stepStates: Record<string, StepState>;
  activeTab: string;
  studentName: string;
  conversation: ConversationMessage[];
}

const CARDS: Record<string, React.ComponentType<{ data: Record<string, unknown>; studentName: string }>> = {
  diagnosis:  DiagnosisCard,
  critic:     CriticCard,
  tutor:      TutorCard,
  faculty:    FacultyCard,
  action:     ActionCard,
  curriculum: CurriculumCard,
  placement:  PlacementCard,
  prediction: PredictionCard,
};

export default function ResultsPanel({ steps, stepStates, activeTab, studentName }: Props) {
  const state = stepStates[activeTab];
  const step = steps.find((s) => s.key === activeTab);

  if (!step) return null;

  /* ── Running ─────────────────────────────────────────────────────── */
  if (state.status === "running") {
    return (
      <div className="animate-fade-in" style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: 300, gap: 20, textAlign: "center",
      }}>
        <div style={{ position: "relative", width: 56, height: 56 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.05)",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `2px solid ${step.color}30`,
            borderTopColor: step.color,
            animation: "spin-ring 0.9s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>{step.icon}</div>
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.82)", marginBottom: 6 }}>
            {step.label} Agent is working...
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>{step.desc}</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%",
              background: step.color, opacity: 0.5,
              animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────── */
  if (state.status === "error") {
    return (
      <div className="animate-fade-in" style={{
        background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 14, padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ef4444", fontWeight: 700, fontSize: 16,
          }}>!</div>
          <div>
            <p style={{ fontWeight: 600, color: "#fca5a5", marginBottom: 2 }}>{step.label} Agent Error</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Pipeline step failed</p>
          </div>
        </div>
        <pre style={{
          fontSize: 12, color: "rgba(252,165,165,0.65)",
          background: "rgba(239,68,68,0.06)", borderRadius: 8,
          padding: "12px 14px", overflow: "auto", maxHeight: 200,
          fontFamily: "monospace", lineHeight: 1.6,
        }}>
          {state.error}
        </pre>
      </div>
    );
  }

  /* ── Pending ─────────────────────────────────────────────────────── */
  if (state.status === "pending") {
    return (
      <div className="animate-fade-in" style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: 260, gap: 14, textAlign: "center",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, opacity: 0.35,
        }}>{step.icon}</div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          Waiting for previous agents to complete...
        </p>
      </div>
    );
  }

  /* ── Done ────────────────────────────────────────────────────────── */
  const Card = CARDS[activeTab];
  if (!Card || !state.data) return null;

  return (
    <div className="animate-fade-slide-up">
      {/* Step header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        marginBottom: 28, paddingBottom: 20,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: `${step.color}16`, border: `1px solid ${step.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>{step.icon}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 3, letterSpacing: "-0.02em" }}>
            {step.label} Agent
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{step.desc}</p>
        </div>
        <span className="badge badge-green" style={{ flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
          Complete
        </span>
      </div>

      <Card data={state.data} studentName={studentName} />
    </div>
  );
}
