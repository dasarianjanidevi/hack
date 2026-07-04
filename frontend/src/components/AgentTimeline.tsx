"use client";

import type { StepState, StepStatus } from "@/app/dashboard/page";

interface Step {
  key: string;
  label: string;
  icon: string;
  color: string;
  desc: string;
}

interface Props {
  steps: Step[];
  stepStates: Record<string, StepState>;
  activeTab: string;
  onSelect: (key: string) => void;
}

const StatusIcon = ({ status, color }: { status: StepStatus; color: string }) => {
  if (status === "running") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-transparent flex-shrink-0 animate-spin-ring"
        style={{ borderTopColor: color, borderRightColor: `${color}44` }} />
    );
  }
  if (status === "done") {
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22`, border: `1.5px solid ${color}` }}>
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center flex-shrink-0">
        <span className="text-red-400 text-xs font-bold">!</span>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-white/6 border border-white/12 flex-shrink-0" />
  );
};

export default function AgentTimeline({ steps, stepStates, activeTab, onSelect }: Props) {
  return (
    <div className="space-y-1">
      <div className="px-2 mb-3">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Agent Pipeline</p>
      </div>
      {steps.map((step, i) => {
        const state = stepStates[step.key];
        const isActive = activeTab === step.key;
        const isDone = state.status === "done";
        const isRunning = state.status === "running";

        return (
          <div key={step.key} className="relative">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className="absolute left-[22px] top-[38px] w-px h-[calc(100%-4px)]"
                style={{ background: isDone ? `${step.color}40` : "rgba(255,255,255,0.06)" }}
              />
            )}

            <button
              onClick={() => isDone || isRunning ? onSelect(step.key) : null}
              disabled={state.status === "pending"}
              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 disabled:cursor-default group"
              style={{
                background: isActive
                  ? `${step.color}14`
                  : isRunning
                  ? `${step.color}08`
                  : "transparent",
                border: isActive
                  ? `1px solid ${step.color}35`
                  : "1px solid transparent",
              }}
            >
              <div className="mt-0.5">
                <StatusIcon status={state.status} color={step.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{step.icon}</span>
                  <span
                    className="text-sm font-medium truncate"
                    style={{
                      color: isActive
                        ? step.color
                        : isDone
                        ? "rgba(255,255,255,0.8)"
                        : isRunning
                        ? step.color
                        : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {step.label}
                  </span>
                  {isRunning && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: `${step.color}20`, color: step.color }}>
                      Live
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/25 mt-0.5 leading-tight truncate">{step.desc}</p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
