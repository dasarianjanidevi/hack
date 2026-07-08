"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

const RISK_CONFIG: Record<string, { color: string; bg: string }> = {
  High:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  Low:    { color: "#10b981", bg: "rgba(16,185,129,0.08)" },
};

const VELOCITY_CONFIG: Record<string, { icon: string; color: string }> = {
  Accelerating: { icon: "📈", color: "#10b981" },
  Stable:       { icon: "➡️", color: "#94a3b8" },
  Declining:    { icon: "📉", color: "#ef4444" },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14,
    }}>{children}</p>
  );
}

export default function PredictionCard({ data }: Props) {
  const risk = String(data.dropout_risk);
  const riskCfg = RISK_CONFIG[risk] || RISK_CONFIG.Medium;
  const velocity = String(data.learning_velocity);
  const velocityCfg = VELOCITY_CONFIG[velocity] || VELOCITY_CONFIG.Stable;
  const riskFactors = (data.key_risk_factors as string[]) || [];
  const positiveSignals = (data.positive_signals as string[]) || [];
  const atRisk = (data.at_risk_topics as string[]) || [];
  const strong = (data.strong_topics as string[]) || [];
  const confidence = Math.round(Number(data.prediction_confidence) * 100);
  const placementProb = Number(data.placement_probability_pct);
  const dropoutScore = Number(data.dropout_risk_score);
  const semScore = Number(data.predicted_semester_score);
  const riskGlow = risk === "High" ? "badge-glow-red" : risk === "Medium" ? "badge-glow-amber" : "badge-glow-green";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 4 Key Predictions Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Predicted Grade */}
        <div className="glass-premium" style={{ padding: "24px 22px", textAlign: "center", borderTop: "2.5px solid #3b82f6" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Predicted Final Grade</p>
          <p style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", color: semScore >= 70 ? "#10b981" : semScore >= 55 ? "#f59e0b" : "#ef4444" }}>
            {String(data.predicted_semester_grade)}
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "4px 14px", borderRadius: 99, display: "inline-block", marginTop: 14 }}>
            📈 Score Target: {semScore}/100
          </p>
        </div>

        {/* Placement Probability */}
        <div className="glass-premium" style={{ padding: "24px 22px", textAlign: "center", borderTop: "2.5px solid #14b8a6" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Placement Probability</p>
          <p style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", color: placementProb >= 70 ? "#10b981" : placementProb >= 50 ? "#f59e0b" : "#ef4444" }}>
            {placementProb}%
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "4px 14px", borderRadius: 99, display: "inline-block", marginTop: 14 }}>
            🎯 Job Readiness Index
          </p>
        </div>

        {/* Dropout Risk */}
        <div className={`glass-premium ${riskGlow}`} style={{ padding: "24px 22px", background: `linear-gradient(135deg, ${riskCfg.bg}, rgba(10,15,26,0.85))`, borderColor: `${riskCfg.color}30` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Dropout Attrition Risk</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{risk === "High" ? "🚨" : risk === "Medium" ? "⚠️" : "✅"}</span>
            <p style={{ fontSize: 20, fontWeight: 800, color: riskCfg.color }}>{risk} Risk</p>
          </div>
          <div className="progress-bar" style={{ borderRadius: 99, height: 7 }}>
            <div className="progress-fill" style={{ width: `${dropoutScore}%`, height: "100%", borderRadius: 99, background: riskCfg.color }} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: riskCfg.color, marginTop: 12 }}>{dropoutScore}/100 attrition score</p>
        </div>

        {/* Learning Velocity */}
        <div className="glass-premium" style={{ padding: "24px 22px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Learning Velocity</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span>{velocityCfg.icon}</span>
            <span style={{ color: velocityCfg.color }}>{velocity}</span>
          </p>
          <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Intervention Level</span>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              padding: "3px 8px", borderRadius: 4,
              background: data.intervention_urgency === "Immediate" ? "#ef444415" : "#f59e0b15",
              color: data.intervention_urgency === "Immediate" ? "#ef4444" : "#f59e0b",
              border: `1px solid ${data.intervention_urgency === "Immediate" ? "#ef444430" : "#f59e0b30"}`,
            }}>
              {String(data.intervention_urgency)}
            </span>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="glass-premium" style={{ padding: "22px 20px" }}>
          <SectionLabel>⚠️ At-Risk Topics</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {atRisk.map((t, i) => (
              <span key={i} className="badge badge-red font-bold text-xs" style={{ padding: "5px 12px" }}>{t}</span>
            ))}
            {atRisk.length === 0 && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No critical topics at risk.</p>}
          </div>
        </div>
        <div className="glass-premium" style={{ padding: "22px 20px" }}>
          <SectionLabel>✓ Strong Topics</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {strong.map((t, i) => (
              <span key={i} className="badge badge-green font-bold text-xs" style={{ padding: "5px 12px" }}>{t}</span>
            ))}
            {strong.length === 0 && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No topics marked as strong.</p>}
          </div>
        </div>
      </div>

      {/* Outcomes Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="glass-premium" style={{ padding: "20px 22px", borderLeft: "3.5px solid #ef4444", background: "rgba(239,68,68,0.015)" }}>
          <SectionLabel>Outcome without Intervention</SectionLabel>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, fontWeight: 500 }}>{String(data.predicted_outcome_if_no_action)}</p>
        </div>
        <div className="glass-premium" style={{ padding: "20px 22px", borderLeft: "3.5px solid #10b981", background: "rgba(16,185,129,0.015)" }}>
          <SectionLabel>Outcome with Intervention</SectionLabel>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, fontWeight: 500 }}>{String(data.predicted_outcome_with_intervention)}</p>
        </div>
      </div>

      {/* Risk Factors + Positive Signals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="glass-premium" style={{ padding: "22px 20px" }}>
          <SectionLabel>Key Risk Factors</SectionLabel>
          <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {riskFactors.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                <span style={{ color: "#ef4444", fontWeight: 800, flexShrink: 0 }}>🚨</span>
                {f}
              </li>
            ))}
            {riskFactors.length === 0 && <li style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No risk factors identified.</li>}
          </ul>
        </div>
        <div className="glass-premium" style={{ padding: "22px 20px" }}>
          <SectionLabel>Positive Signals</SectionLabel>
          <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {positiveSignals.map((s, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                <span style={{ color: "#10b981", fontWeight: 800, flexShrink: 0 }}>✓</span>
                {s}
              </li>
            ))}
            {positiveSignals.length === 0 && <li style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No positive signals observed.</li>}
          </ul>
        </div>
      </div>

      {/* Confidence */}
      <div className="glass-premium badge-glow-purple" style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 24 }}>🔮</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Model Prediction Confidence</span>
              <span style={{ color: "#a855f7", fontWeight: 800 }}>{confidence}%</span>
            </div>
            <div className="progress-bar" style={{ borderRadius: 99, height: 7 }}>
              <div className="progress-fill" style={{ width: `${confidence}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #8b5cf6, #ec4899)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
