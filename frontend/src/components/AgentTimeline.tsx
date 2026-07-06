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

const StatusDot = ({ status, color }: { status: StepStatus; color: string }) => {
  if (status === "running") {
    return (
      <div
        style={{
          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
          border: `2px solid ${color}33`,
          borderTopColor: color,
          animation: "spin-ring 0.9s linear infinite",
        }}
      />
    );
  }
  if (status === "done") {
    return (
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        background: `${color}18`, border: `1.5px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        background: "rgba(239,68,68,0.15)", border: "1.5px solid #ef4444",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 700, color: "#ef4444",
      }}>!</div>
    );
  }
  return (
    <div style={{
      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
      background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
    }} />
  );
};

export default function AgentTimeline({ steps, stepStates, activeTab, onSelect }: Props) {
  return (
    <div>
      {/* Header */}
      <div style={{ padding: "0 8px 14px", marginBottom: 4 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
          Agent Pipeline
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {steps.map((step, i) => {
          const state = stepStates[step.key];
          const isActive = activeTab === step.key;
          const isDone = state.status === "done";
          const isRunning = state.status === "running";
          const isClickable = isDone || isRunning || state.status === "error";

          return (
            <div key={step.key} style={{ position: "relative" }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute",
                  left: 17, top: 34, width: 1,
                  height: "calc(100% + 2px)",
                  background: isDone ? `${step.color}35` : "rgba(255,255,255,0.05)",
                  transition: "background 0.3s ease",
                }} />
              )}

              <button
                onClick={() => isClickable ? onSelect(step.key) : null}
                disabled={!isClickable}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 10,
                  textAlign: "left",
                  cursor: isClickable ? "pointer" : "default",
                  border: "1px solid",
                  borderColor: isActive ? `${step.color}35` : "transparent",
                  background: isActive
                    ? `${step.color}12`
                    : isRunning
                    ? `${step.color}07`
                    : "transparent",
                  transition: "all 0.18s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  if (isClickable && !isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isRunning ? `${step.color}07` : "transparent";
                  }
                }}
              >
                {/* Status indicator */}
                <StatusDot status={state.status} color={step.color} />

                {/* Labels */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                    <span style={{ fontSize: 13 }}>{step.icon}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: isActive
                        ? step.color
                        : isDone
                        ? "rgba(255,255,255,0.78)"
                        : isRunning
                        ? step.color
                        : "rgba(255,255,255,0.28)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      transition: "color 0.2s ease",
                    }}>{step.label}</span>
                    {isRunning && (
                      <span style={{
                        fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 99,
                        background: `${step.color}20`, color: step.color,
                        letterSpacing: "0.05em", textTransform: "uppercase",
                      }}>Live</span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 11, color: "rgba(255,255,255,0.22)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    lineHeight: 1.4,
                  }}>{step.desc}</p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
