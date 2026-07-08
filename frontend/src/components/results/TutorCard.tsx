"use client";

interface Props { data: Record<string, unknown>; studentName: string; }
interface Day { day: number; focus: string; concepts: string[]; resources: string[]; exercise: string; estimated_time: string; }

const DAY_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14,
    }}>{children}</p>
  );
}

export default function TutorCard({ data }: Props) {
  const days = (data.days as Day[]) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Goal + Metric ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="glass-premium" style={{ padding: "22px 20px", borderTop: "2.5px solid #3b82f6" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            🎯 Overall Goal
          </p>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
            {String(data.overall_goal)}
          </p>
        </div>
        <div className="glass-premium" style={{ padding: "22px 20px", borderTop: "2.5px solid #14b8a6" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#2dd4bf", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            🏆 Success Metric
          </p>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
            {String(data.success_metric)}
          </p>
        </div>
      </div>

      {/* ── Prerequisite ──────────────────────────────────────────── */}
      <div className="glass-premium" style={{
        padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14,
        borderLeft: "3px solid #f59e0b", background: "rgba(245,158,11,0.04)",
      }}>
        <span style={{ fontSize: 20, marginTop: 2 }}>⚠️</span>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            Before Day 1 — Prerequisite Check
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
            {String(data.prerequisite_check)}
          </p>
        </div>
      </div>

      {/* ── 5-Day Plan ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SectionLabel>📅 Personalized 5-Day Study Program</SectionLabel>
        {days.map((day, i) => (
          <div key={day.day} className="glass-premium animate-fade-slide-up" style={{
            padding: "24px 22px", animationDelay: `${i * 0.08}s`,
            transition: "transform 0.15s ease",
          }}>
            {/* Day header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingBottom: 16, marginBottom: 18,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "white",
                  background: `linear-gradient(135deg, ${DAY_COLORS[i]}, #00000060)`,
                  boxShadow: `0 4px 14px ${DAY_COLORS[i]}35`,
                }}>
                  D{day.day}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{day.focus}</p>
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                padding: "5px 12px", borderRadius: 99, flexShrink: 0,
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                ⏱ {day.estimated_time}
              </span>
            </div>

            {/* Concepts + Resources */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                  Core Concepts
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {day.concepts.map((c, ci) => (
                    <li key={ci} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                      <span style={{ color: DAY_COLORS[i], fontWeight: 800, flexShrink: 0, marginTop: 2 }}>•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                  Learning Resources
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {day.resources.map((r, ri) => (
                    <li key={ri} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                      <span style={{ color: "#06b6d4", fontWeight: 800, flexShrink: 0, marginTop: 2 }}>→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Exercise */}
            <div style={{
              padding: "12px 16px", borderRadius: 12, fontSize: 12.5, lineHeight: 1.7,
              color: "rgba(255,255,255,0.75)",
              background: `${DAY_COLORS[i]}08`, border: `1px solid ${DAY_COLORS[i]}22`,
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <span style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: DAY_COLORS[i], flexShrink: 0, marginTop: 2 }}>
                Exercise:
              </span>
              {day.exercise}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
