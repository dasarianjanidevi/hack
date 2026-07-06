"use client";

import { useEffect, useRef } from "react";
import type { ConversationMessage } from "@/app/dashboard/page";

interface Props {
  messages: ConversationMessage[];
}

const SPEAKER_CONFIG: Record<string, { color: string; bg: string; side: "left" | "right" }> = {
  "Diagnosis Agent": { color: "#3b82f6", bg: "rgba(59,130,246,0.08)", side: "left" },
  "Critic Agent":    { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", side: "right" },
};

const TYPE_LABELS: Record<string, string> = {
  diagnosis_claim:  "Claim",
  critic_challenge: "Challenge",
  diagnosis_update: "Updated",
  critic_approve:   "Verdict",
  statement:        "Note",
};

function parseBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{part}</strong>
      : part
  );
}

export default function ConversationPanel({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <div style={{
        padding: "16px 18px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", animation: "pulse-dot 1.8s ease-in-out infinite" }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
            Agent Dialogue
          </p>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
          Diagnosis ↔ Critic live debate
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "32px 16px" }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, marginBottom: 12,
            }}>💬</div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
              Agent dialogue will<br />appear here in real time
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const cfg = SPEAKER_CONFIG[msg.speaker] || { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", side: "left" as const };
            const isRight = cfg.side === "right";

            return (
              <div
                key={i}
                className="animate-fade-slide-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Speaker row */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  flexDirection: isRight ? "row-reverse" : "row",
                  marginBottom: 5,
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: cfg.color, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700,
                  }}>
                    {msg.speaker === "Diagnosis Agent" ? "D" : "C"}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color }}>
                    {msg.speaker.replace(" Agent", "")}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 500, padding: "2px 6px", borderRadius: 99,
                    background: `${cfg.color}15`, color: cfg.color, letterSpacing: "0.04em",
                  }}>
                    {TYPE_LABELS[msg.message_type] || "Note"}
                  </span>
                </div>

                {/* Bubble */}
                <div style={{ [isRight ? "paddingLeft" : "paddingRight"]: 28 }}>
                  <div style={{
                    padding: "10px 13px",
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}25`,
                    borderRadius: isRight ? "10px 3px 10px 10px" : "3px 10px 10px 10px",
                    fontSize: 12, lineHeight: 1.65,
                    color: "rgba(255,255,255,0.68)",
                  }}>
                    {parseBold(msg.message)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      {messages.length > 0 && (
        <div style={{
          padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0, textAlign: "center",
        }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
            {messages.length} messages exchanged
          </p>
        </div>
      )}
    </div>
  );
}
