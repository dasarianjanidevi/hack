"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

const RISK_CONFIG: Record<string, { color: string; bg: string }> = {
  High:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Low:    { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

const VELOCITY_CONFIG: Record<string, { icon: string; color: string }> = {
  Accelerating: { icon: "📈", color: "#10b981" },
  Stable:       { icon: "➡️", color: "#94a3b8" },
  Declining:    { icon: "📉", color: "#ef4444" },
};

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

  return (
    <div className="space-y-4">
      {/* 4 Key Predictions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 text-center">
          <p className="text-xs text-white/35 mb-2">Predicted Grade</p>
          <p className="text-4xl font-bold" style={{ color: semScore >= 70 ? "#10b981" : semScore >= 55 ? "#f59e0b" : "#ef4444" }}>
            {String(data.predicted_semester_grade)}
          </p>
          <p className="text-xs text-white/35 mt-1">{semScore}/100 predicted</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-xs text-white/35 mb-2">Placement Probability</p>
          <p className="text-4xl font-bold" style={{ color: placementProb >= 70 ? "#10b981" : placementProb >= 50 ? "#f59e0b" : "#ef4444" }}>
            {placementProb}%
          </p>
          <p className="text-xs text-white/35 mt-1">chance of placement</p>
        </div>
        <div className="glass p-4" style={{ background: riskCfg.bg, borderColor: `${riskCfg.color}30` }}>
          <p className="text-xs text-white/35 mb-2">Dropout Risk</p>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-2xl font-bold" style={{ color: riskCfg.color }}>{risk}</p>
            <span className="text-lg">{risk === "High" ? "🚨" : risk === "Medium" ? "⚠️" : "✅"}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill transition-all duration-700"
              style={{ width: `${dropoutScore}%`, background: riskCfg.color }} />
          </div>
          <p className="text-xs mt-1" style={{ color: riskCfg.color }}>{dropoutScore}/100 risk score</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-white/35 mb-2">Learning Velocity</p>
          <p className="text-2xl font-bold" style={{ color: velocityCfg.color }}>
            {velocityCfg.icon} {velocity}
          </p>
          <p className="text-xs text-white/35 mt-2">Intervention urgency:</p>
          <p className="text-sm font-semibold" style={{ color: data.intervention_urgency === "Immediate" ? "#ef4444" : "#f59e0b" }}>
            {String(data.intervention_urgency)}
          </p>
        </div>
      </div>

      {/* Topics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4">
          <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-2">⚠ At-Risk Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {atRisk.map((t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-500/12 text-red-400 border border-red-500/25">{t}</span>
            ))}
          </div>
        </div>
        <div className="glass p-4">
          <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wider mb-2">✓ Strong Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {strong.map((t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-green-500/12 text-green-400 border border-green-500/25">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4" style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
          <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-2">Without Intervention</p>
          <p className="text-sm text-white/60 leading-relaxed">{String(data.predicted_outcome_if_no_action)}</p>
        </div>
        <div className="glass p-4" style={{ borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.04)" }}>
          <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wider mb-2">With Intervention</p>
          <p className="text-sm text-white/60 leading-relaxed">{String(data.predicted_outcome_with_intervention)}</p>
        </div>
      </div>

      {/* Risk Factors + Positive Signals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4">
          <p className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-2">Key Risk Factors</p>
          <ul className="space-y-1.5">
            {riskFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-white/55">
                <span className="text-red-400/60 mt-0.5 flex-shrink-0">▸</span>{f}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass p-4">
          <p className="text-xs font-semibold text-green-400/60 uppercase tracking-wider mb-2">Positive Signals</p>
          <ul className="space-y-1.5">
            {positiveSignals.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-white/55">
                <span className="text-green-400/60 mt-0.5 flex-shrink-0">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Confidence */}
      <div className="glass p-3 flex items-center gap-3">
        <span className="text-purple-400 text-lg">🔮</span>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/40">Prediction confidence</span>
            <span className="text-purple-400 font-semibold">{confidence}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${confidence}%`, background: "linear-gradient(90deg,#8b5cf6,#a855f7)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
