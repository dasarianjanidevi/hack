"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

function ConfidenceMeter({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(value * 100);
  const cls = pct >= 80 ? "confidence-fill-high" : pct >= 60 ? "confidence-fill-medium" : "confidence-fill-low";
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div>
      {label && <p className="text-xs text-white/40 mb-1">{label}</p>}
      <div className="flex items-center gap-3">
        <div className="confidence-track flex-1">
          <div className={`confidence-fill ${cls} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-bold min-w-[42px] text-right" style={{ color }}>{pct}%</span>
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
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-premium p-5 glow-blue">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Weak Topic</p>
          <p className="text-xl font-extrabold text-blue-400 tracking-tight">{String(data.weak_topic)}</p>
        </div>
        <div className="glass-premium p-5">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Risk Level</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${riskBadge} ${riskGlow} capitalize font-bold text-sm px-3 py-1`}>
              <span className="w-2 h-2 rounded-full" style={{ background: riskColor }} />
              {String(data.risk_level)}
            </span>
          </div>
        </div>
        <div className="glass-premium p-5">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Confidence</p>
          <div className="mt-1">
            <ConfidenceMeter value={Number(data.confidence)} />
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="glass-premium p-6">
        <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest mb-3">Reasoning Analysis</p>
        <p className="text-sm text-white/80 leading-relaxed font-normal">{String(data.reasoning)}</p>
      </div>

      {/* Evidence */}
      <div className="glass-premium p-6">
        <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest mb-4">Evidence Gathered</p>
        <div className="space-y-3">
          {evidence.map((e, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
              <span className="mt-0.5 w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-white/75 leading-relaxed">{e}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Scores */}
      {Object.keys(quizScores).length > 0 && (
        <div className="glass-premium p-6">
          <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest mb-4">Quiz Performance per Topic</p>
          <div className="space-y-4">
            {Object.entries(quizScores).map(([topic, score]) => {
              const isWeak = topic === String(data.weak_topic);
              return (
                <div key={topic} className={`p-3.5 rounded-xl transition-all ${isWeak ? 'bg-red-500/[0.04] border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.03)]' : 'bg-transparent border border-transparent'}`}>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className={`text-sm ${isWeak ? "text-red-400 font-bold" : "text-white/70"}`}>
                      {topic} {isWeak && <span className="text-[10px] font-semibold tracking-wider uppercase bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded ml-2">Weak Topic</span>}
                    </span>
                    <span className={`text-sm ${isWeak ? "text-red-400 font-bold" : "text-white/60"}`}>{score}/100</span>
                  </div>
                  <div className="progress-bar rounded-full h-2">
                    <div className="progress-fill transition-all duration-700 h-full rounded-full"
                      style={{ width: `${score}%`, background: isWeak ? "linear-gradient(90deg, #ef4444, #f87171)" : "linear-gradient(90deg, #3b82f6, #60a5fa)" }} />
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

