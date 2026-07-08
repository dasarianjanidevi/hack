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
  const riskGlow = risk === "High" ? "badge-glow-red" : risk === "Medium" ? "badge-glow-amber" : "badge-glow-green";

  return (
    <div className="space-y-6">
      {/* 4 Key Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Predicted Grade */}
        <div className="glass-premium p-5 text-center border-t-2 border-t-blue-500">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Predicted Final Grade</p>
          <p className="text-5xl font-extrabold tracking-tight" style={{ color: semScore >= 70 ? "#10b981" : semScore >= 55 ? "#f59e0b" : "#ef4444" }}>
            {String(data.predicted_semester_grade)}
          </p>
          <p className="text-xs text-white/40 mt-3 font-semibold bg-white/[0.02] border border-white/[0.04] py-1 px-3 rounded-full inline-block">
            📈 Score Target: {semScore}/100
          </p>
        </div>

        {/* Placement Probability */}
        <div className="glass-premium p-5 text-center border-t-2 border-t-teal-500">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Placement Probability</p>
          <p className="text-5xl font-extrabold tracking-tight" style={{ color: placementProb >= 70 ? "#10b981" : placementProb >= 50 ? "#f59e0b" : "#ef4444" }}>
            {placementProb}%
          </p>
          <p className="text-xs text-white/40 mt-3 font-semibold bg-white/[0.02] border border-white/[0.04] py-1 px-3 rounded-full inline-block">
            🎯 Job Readiness index
          </p>
        </div>

        {/* Dropout Risk */}
        <div className={`glass-premium p-5 transition-all ${riskGlow}`} style={{ background: `linear-gradient(135deg, ${riskCfg.bg}, rgba(10,15,26,0.85))`, borderColor: `${riskCfg.color}30` }}>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Dropout Attrition Risk</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{risk === "High" ? "🚨" : risk === "Medium" ? "⚠️" : "✅"}</span>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: riskCfg.color }}>{risk} Risk</p>
          </div>
          <div className="progress-bar rounded-full h-2.5">
            <div className="progress-fill h-full rounded-full transition-all duration-700"
              style={{ width: `${dropoutScore}%`, background: riskCfg.color }} />
          </div>
          <p className="text-xs mt-3 font-semibold" style={{ color: riskCfg.color }}>{dropoutScore}/100 attrition score</p>
        </div>

        {/* Learning Velocity */}
        <div className="glass-premium p-5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Learning Velocity</p>
          <p className="text-xl font-extrabold text-white/90 flex items-center gap-2 mb-3">
            <span className="filter drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]">{velocityCfg.icon}</span>
            <span style={{ color: velocityCfg.color }}>{velocity}</span>
          </p>
          <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-xs text-white/40 font-medium">Intervention Level</span>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: data.intervention_urgency === "Immediate" ? "#ef444420" : "#f59e0b20", color: data.intervention_urgency === "Immediate" ? "#ef4444" : "#f59e0b", border: `1px solid ${data.intervention_urgency === "Immediate" ? "#ef444430" : "#f59e0b30"}` }}>
              {String(data.intervention_urgency)}
            </span>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-premium p-5">
          <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-3">⚠️ At-Risk Topics</p>
          <div className="flex flex-wrap gap-2">
            {atRisk.map((t, i) => (
              <span key={i} className="text-xs px-2.5 py-1.5 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 font-semibold">{t}</span>
            ))}
            {atRisk.length === 0 && <p className="text-xs text-white/30 italic">No critical topics at risk.</p>}
          </div>
        </div>
        <div className="glass-premium p-5">
          <p className="text-[10px] font-bold text-green-400/80 uppercase tracking-widest mb-3">✓ Strong Topics</p>
          <div className="flex flex-wrap gap-2">
            {strong.map((t, i) => (
              <span key={i} className="text-xs px-2.5 py-1.5 rounded-xl bg-green-500/10 text-green-300 border border-green-500/20 font-semibold">{t}</span>
            ))}
            {strong.length === 0 && <p className="text-xs text-white/30 italic">No topics marked as strong.</p>}
          </div>
        </div>
      </div>

      {/* Outcomes Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-premium p-5 border-l-4 border-l-red-500" style={{ background: "rgba(239,68,68,0.02)" }}>
          <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-2">Outcome without Intervention</p>
          <p className="text-xs text-white/70 leading-relaxed font-medium">{String(data.predicted_outcome_if_no_action)}</p>
        </div>
        <div className="glass-premium p-5 border-l-4 border-l-green-500" style={{ background: "rgba(16,185,129,0.02)" }}>
          <p className="text-[10px] font-bold text-green-400/80 uppercase tracking-widest mb-2">Outcome with Intervention</p>
          <p className="text-xs text-white/70 leading-relaxed font-medium">{String(data.predicted_outcome_with_intervention)}</p>
        </div>
      </div>

      {/* Risk Factors + Positive Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-premium p-5">
          <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-3">Key Risk Factors</p>
          <ul className="space-y-2">
            {riskFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-white/70 leading-relaxed">
                <span className="text-red-400/80 font-bold flex-shrink-0 mt-0.5">▸</span>
                {f}
              </li>
            ))}
            {riskFactors.length === 0 && <li className="text-xs text-white/30 italic">No risk factors identified.</li>}
          </ul>
        </div>
        <div className="glass-premium p-5">
          <p className="text-[10px] font-bold text-green-400/80 uppercase tracking-widest mb-3">Positive Signals</p>
          <ul className="space-y-2">
            {positiveSignals.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-white/70 leading-relaxed">
                <span className="text-green-400/85 font-bold flex-shrink-0 mt-0.5">✓</span>
                {s}
              </li>
            ))}
            {positiveSignals.length === 0 && <li className="text-xs text-white/30 italic">No positive signals observed.</li>}
          </ul>
        </div>
      </div>

      {/* Confidence */}
      <div className="glass-premium p-5 badge-glow-purple">
        <div className="flex items-center gap-3">
          <span className="text-2xl filter drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]">🔮</span>
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-white/40 font-semibold uppercase tracking-widest text-[9px]">Model Prediction Confidence</span>
              <span className="text-purple-400 font-extrabold text-sm">{confidence}%</span>
            </div>
            <div className="progress-bar rounded-full h-2">
              <div className="progress-fill h-full rounded-full transition-all duration-700" style={{ width: `${confidence}%`, background: "linear-gradient(90deg, #8b5cf6, #ec4899)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
