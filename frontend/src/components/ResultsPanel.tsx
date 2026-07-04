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
  diagnosis: DiagnosisCard,
  critic: CriticCard,
  tutor: TutorCard,
  faculty: FacultyCard,
  action: ActionCard,
  curriculum: CurriculumCard,
  placement: PlacementCard,
  prediction: PredictionCard,
};

export default function ResultsPanel({ steps, stepStates, activeTab, studentName }: Props) {
  const state = stepStates[activeTab];
  const step = steps.find((s) => s.key === activeTab);

  if (!step) return null;

  // Running state
  if (state.status === "running") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-white/6" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-ring"
            style={{ borderTopColor: step.color }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {step.icon}
          </div>
        </div>
        <div className="text-center">
          <p className="text-white/80 font-medium">{step.label} Agent is working...</p>
          <p className="text-sm text-white/35 mt-1">{step.desc}</p>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse"
              style={{ animationDelay: `${i*0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <div className="glass p-6 border-red-500/25 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">!</div>
          <div>
            <p className="font-medium text-red-400">{step.label} Agent Error</p>
            <p className="text-xs text-white/40">Pipeline step failed</p>
          </div>
        </div>
        <pre className="text-xs text-red-300/70 bg-red-500/8 rounded-lg p-3 overflow-auto max-h-48 font-mono">
          {state.error}
        </pre>
      </div>
    );
  }

  // Pending state
  if (state.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-white/4 border border-white/8 flex items-center justify-center text-2xl opacity-40">
          {step.icon}
        </div>
        <p className="text-white/30 text-sm">Waiting for previous agents to complete...</p>
      </div>
    );
  }

  // Done — render the result card
  const Card = CARDS[activeTab];
  if (!Card || !state.data) return null;

  return (
    <div className="animate-fade-slide-up">
      {/* Step header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${step.color}18`, border: `1px solid ${step.color}35` }}>
          {step.icon}
        </div>
        <div>
          <h2 className="font-semibold text-white">{step.label} Agent</h2>
          <p className="text-xs text-white/40">{step.desc}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Complete
        </div>
      </div>

      <Card data={state.data} studentName={studentName} />
    </div>
  );
}
