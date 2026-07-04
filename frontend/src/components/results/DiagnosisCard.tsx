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

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass p-4 glow-blue">
          <p className="text-xs text-white/40 mb-1">Weak Topic</p>
          <p className="text-lg font-bold text-blue-400">{String(data.weak_topic)}</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-white/40 mb-1">Risk Level</p>
          <p className="text-lg font-bold capitalize" style={{ color: riskColor }}>
            {String(data.risk_level)}
          </p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-white/40 mb-2">Confidence</p>
          <ConfidenceMeter value={Number(data.confidence)} />
        </div>
      </div>

      {/* Reasoning */}
      <div className="glass p-4">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Reasoning</p>
        <p className="text-sm text-white/70 leading-relaxed">{String(data.reasoning)}</p>
      </div>

      {/* Evidence */}
      <div className="glass p-4">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Evidence</p>
        <ul className="space-y-2">
          {evidence.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/65">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400 font-bold flex-shrink-0">{i+1}</span>
              {e}
            </li>
          ))}
        </ul>
      </div>

      {/* Quiz Scores */}
      {Object.keys(quizScores).length > 0 && (
        <div className="glass p-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Quiz Scores by Topic</p>
          <div className="space-y-2.5">
            {Object.entries(quizScores).map(([topic, score]) => {
              const isWeak = topic === String(data.weak_topic);
              return (
                <div key={topic}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isWeak ? "text-red-400 font-medium" : "text-white/60"}>{topic}</span>
                    <span className={isWeak ? "text-red-400 font-bold" : "text-white/50"}>{score}/100</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill transition-all duration-700"
                      style={{ width: `${score}%`, background: isWeak ? "#ef4444" : "#3b82f6" }} />
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
