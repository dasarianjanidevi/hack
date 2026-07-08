"use client";

interface Props { data: Record<string, unknown>; studentName: string; }
interface TopicRec { topic: string; students_struggling: number; total_students: number; failure_rate_pct: number; root_causes: string[]; recommendations: { type: string; description: string; priority: string }[]; }

const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14,
    }}>{children}</p>
  );
}

export default function CurriculumCard({ data }: Props) {
  const topics = (data.critical_topics as TopicRec[]) || [];
  const actions = (data.action_summary as string[]) || [];
  const health = Number(data.overall_health_score);
  const healthColor = health >= 75 ? "#10b981" : health >= 55 ? "#f59e0b" : "#ef4444";
  const healthGlow = health >= 75 ? "badge-glow-green" : health >= 55 ? "badge-glow-amber" : "badge-glow-red";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <div className="glass-premium" style={{ padding: "20px 18px", textAlign: "center" }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>{String(data.total_students_analyzed)}</p>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>Cohort Size</p>
        </div>
        <div className={`glass-premium ${healthGlow}`} style={{ padding: "20px 18px", textAlign: "center", borderBottom: `2.5px solid ${healthColor}` }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: healthColor, letterSpacing: "-0.02em" }}>{health.toFixed(0)}</p>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>Health Index</p>
        </div>
        <div className="glass-premium badge-glow-pink" style={{ padding: "20px 18px", textAlign: "center", borderBottom: "2.5px solid #ec4899" }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "#ec4899", letterSpacing: "-0.02em" }}>{topics.length}</p>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>Critical Topics</p>
        </div>
      </div>

      {/* Top insight */}
      <div className="glass-premium" style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14, borderLeft: "3px solid #ec4899", background: "linear-gradient(135deg, rgba(236,72,153,0.04), rgba(10,15,26,0.9))" }}>
        <span style={{ fontSize: 20, marginTop: 2 }}>📊</span>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#ec4899", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Key Cohort Insight</p>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>{String(data.top_insight)}</p>
        </div>
      </div>

      {/* Critical Topics */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SectionLabel>Detailed Critical Topic Risk Assessment</SectionLabel>
        {topics.map((t, i) => (
          <div key={i} className="glass-premium" style={{ padding: "24px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{t.topic}</p>
              <span className="badge badge-red badge-glow-red" style={{ fontSize: 11, fontWeight: 700 }}>
                {t.failure_rate_pct}% Fail Rate
              </span>
            </div>
            
            <div style={{ marginBottom: 18 }}>
              <div className="progress-bar" style={{ borderRadius: 99, height: 7 }}>
                <div className="progress-fill" style={{ width: `${t.failure_rate_pct}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #ef4444, #ec4899)" }} />
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>⚠️ {t.students_struggling} of {t.total_students} students have dropped below passing threshold</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Identified Root Causes</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {t.root_causes.map((c, ci) => (
                    <li key={ci} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                      <span style={{ color: "#ef4444", fontWeight: 800, flexShrink: 0, marginTop: 2 }}>•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Recommended Interventions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {t.recommendations.map((r, ri) => (
                    <div key={ri} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                        background: `${PRIORITY_COLOR[r.priority]}15`, color: PRIORITY_COLOR[r.priority],
                        border: `1px solid ${PRIORITY_COLOR[r.priority]}30`, flexShrink: 0, marginTop: 2,
                      }}>
                        {r.priority}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>[{r.type}]</span> {r.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="glass-premium" style={{ padding: "24px 24px" }}>
          <SectionLabel>Institutional Action Items</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {actions.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "#ec4899", fontWeight: 800, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", fontWeight: 500, lineHeight: 1.6 }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
