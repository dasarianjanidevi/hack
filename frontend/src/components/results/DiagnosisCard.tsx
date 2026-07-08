"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
      marginBottom: 14,
    }}>{children}</p>
  );
}

function ConfidenceMeter({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(value * 100);
  const cls = pct >= 80 ? "confidence-fill-high" : pct >= 60 ? "confidence-fill-medium" : "confidence-fill-low";
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div>
      {label && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{label}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="confidence-track" style={{ flex: 1 }}>
          <div className={`confidence-fill ${cls}`} style={{ width: `${pct}%`, height: "100%", transition: "width 0.7s ease" }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, minWidth: 42, textAlign: "right", color }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function DiagnosisCard({ data }: Props) {
  const quizScores = (data.quiz_scores as Record<string, number>) || {};
  const evidence = (data.evidence as string[]) || [];
  const riskColor = data.risk_level === "high" ? "#ef4444" : data.risk_level === "medium" ? "#f59e0b" : "#10b981";
  const riskBadge = data.risk_level === "high" ? "badge-red" : data.risk_level === "medium" ? "badge-amber" : "badge-green";
  const riskGlow = data.risk_level === "high" ? "badge-glow-red" : data.risk_level === "medium" ? "badge-glow-amber" : "badge-glow-green";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Summary metrics row ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <div className="glass-premium glow-blue" style={{ padding: "20px 18px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Weak Topic
          </p>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#60a5fa", letterSpacing: "-0.02em" }}>
            {String(data.weak_topic)}
          </p>
        </div>
        <div className="glass-premium" style={{ padding: "20px 18px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Risk Level
          </p>
          <span className={`badge ${riskBadge} ${riskGlow}`} style={{ fontWeight: 700, fontSize: 13, padding: "4px 14px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: riskColor }} />
            {String(data.risk_level)}
          </span>
        </div>
        <div className="glass-premium" style={{ padding: "20px 18px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Confidence
          </p>
          <ConfidenceMeter value={Number(data.confidence)} />
        </div>
      </div>

      {/* ── Reasoning ─────────────────────────────────────────────── */}
      <div className="glass-premium" style={{ padding: "24px 24px" }}>
        <SectionLabel>🧠 Reasoning Analysis</SectionLabel>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.8 }}>
          {String(data.reasoning)}
        </p>
      </div>

      {/* ── Evidence ──────────────────────────────────────────────── */}
      <div className="glass-premium" style={{ padding: "24px 24px" }}>
        <SectionLabel>📋 Evidence Gathered</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {evidence.map((e, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "13px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)",
              transition: "background 0.15s",
            }}>
              <span style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: 8,
                background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#60a5fa",
                marginTop: 1,
              }}>{i + 1}</span>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>{e}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quiz Performance ───────────────────────────────────────── */}
      {Object.keys(quizScores).length > 0 && (
        <div className="glass-premium" style={{ padding: "24px 24px" }}>
          <SectionLabel>📊 Quiz Performance per Topic</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(quizScores).map(([topic, score]) => {
              const isWeak = topic === String(data.weak_topic);
              return (
                <div key={topic} style={{
                  padding: "14px 16px", borderRadius: 12, transition: "all 0.15s",
                  background: isWeak ? "rgba(239,68,68,0.04)" : "transparent",
                  border: isWeak ? "1px solid rgba(239,68,68,0.18)" : "1px solid transparent",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: isWeak ? 700 : 500, color: isWeak ? "#f87171" : "rgba(255,255,255,0.7)" }}>
                      {topic}
                      {isWeak && (
                        <span style={{
                          marginLeft: 10, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                          textTransform: "uppercase", background: "rgba(239,68,68,0.2)",
                          color: "#fca5a5", padding: "2px 8px", borderRadius: 99,
                        }}>Weak</span>
                      )}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isWeak ? "#f87171" : "rgba(255,255,255,0.6)" }}>
                      {score}/100
                    </span>
                  </div>
                  <div className="progress-bar" style={{ borderRadius: 99, height: 7 }}>
                    <div className="progress-fill" style={{
                      width: `${score}%`, height: "100%", borderRadius: 99,
                      transition: "width 0.7s ease",
                      background: isWeak ? "linear-gradient(90deg,#ef4444,#f87171)" : "linear-gradient(90deg,#3b82f6,#60a5fa)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
