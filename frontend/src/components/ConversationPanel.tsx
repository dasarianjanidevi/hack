"use client";

import { useEffect, useRef } from "react";
import type { ConversationMessage } from "@/app/dashboard/page";

interface Props {
  messages: ConversationMessage[];
}

const SPEAKER_CONFIG: Record<string, { color: string; bg: string; side: "left" | "right" }> = {
  "Diagnosis Agent": { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", side: "left" },
  "Critic Agent": { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", side: "right" },
};

const TYPE_LABELS: Record<string, string> = {
  diagnosis_claim: "Initial Claim",
  critic_challenge: "Challenging",
  diagnosis_update: "Updated Claim",
  critic_approve: "Verdict",
  statement: "Note",
};

function parseBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-white">{part}</strong> : part
  );
}

export default function ConversationPanel({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Agent Conversation</p>
        </div>
        <p className="text-[11px] text-white/30 mt-0.5">Diagnosis ↔ Critic live debate</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-10 h-10 rounded-full bg-white/4 border border-white/8 flex items-center justify-center text-lg mb-3">
              💬
            </div>
            <p className="text-xs text-white/25 leading-relaxed">
              Agent conversation will<br />appear here in real time
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const config = SPEAKER_CONFIG[msg.speaker] || { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", side: "left" as const };
            const isRight = config.side === "right";

            return (
              <div
                key={i}
                className="animate-fade-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Speaker label */}
                <div className={`flex items-center gap-1.5 mb-1 ${isRight ? "flex-row-reverse" : ""}`}>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: config.color, color: "white" }}
                  >
                    {msg.speaker === "Diagnosis Agent" ? "D" : "C"}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: config.color }}>
                    {msg.speaker.replace(" Agent", "")}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{ background: `${config.color}18`, color: config.color }}>
                    {TYPE_LABELS[msg.message_type] || "Note"}
                  </span>
                </div>

                {/* Bubble */}
                <div className={isRight ? "ml-4" : "mr-4"}>
                  <div
                    className="p-2.5 rounded-xl text-[11px] leading-relaxed"
                    style={{
                      background: config.bg,
                      border: `1px solid ${config.color}30`,
                      borderRadius: isRight
                        ? "12px 4px 12px 12px"
                        : "4px 12px 12px 12px",
                      color: "rgba(255,255,255,0.75)",
                    }}
                  >
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
        <div className="px-4 py-2 border-t border-white/6 flex-shrink-0">
          <p className="text-[10px] text-white/20 text-center">{messages.length} messages exchanged</p>
        </div>
      )}
    </div>
  );
}
