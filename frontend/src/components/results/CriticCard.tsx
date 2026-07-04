"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

const VERDICT_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  CONFIRMED:    { color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: "✅" },
  CHALLENGED:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: "⚠️" },
  INCONCLUSIVE: { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: "❓" },
};

export default function CriticCard({ data }: Props) {
  const verdict = String(data.verdict || "CONFIRMED");
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.CONFIRMED;
  const supporting = (data.supporting_evidence as string[]) || [];
  const contradicting = (data.contradicting_evidence as string[]) || [];
  const pct = Math.round(Number(data.confidence) * 100);
  const origPct = Math.round(Number(data.original_confidence) * 100);

  return (
    <div className="space-y-4">
      {/* Verdict Banner */}
      <div className="glass p-5 flex items-center gap-4"
        style={{ borderColor: `${cfg.color}35`, background: cfg.bg }}>
        <span className="text-3xl">{cfg.icon}</span>
        <div className="flex-1">
          <p className="text-xs text-white/40 mb-0.5">Critic Verdict</p>
          <p className="text-2xl font-bold" style={{ color: cfg.color }}>{verdict}</p>
          <p className="text-sm text-white/55 mt-1 leading-relaxed">{String(data.reason)}</p>
        </div>
      </div>

      {/* Confidence Comparison */}
      <div className="glass p-4">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Confidence Update</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50">Diagnosis Agent claimed</span>
              <span className="text-white/60">{origPct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${origPct}%`, background: "#3b82f6" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium" style={{ color: cfg.color }}>After cross-verification</span>
              <span className="font-bold" style={{ color: cfg.color }}>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill transition-all duration-700"
                style={{ width: `${pct}%`, background: cfg.color }} />
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Evidence */}
      {supporting.length > 0 && (
        <div className="glass p-4">
          <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wider mb-3">✓ Supporting Evidence (Cross-Source)</p>
          <ul className="space-y-2">
            {supporting.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/65">
                <span className="text-green-400 mt-0.5 flex-shrink-0">→</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contradicting Evidence */}
      {contradicting.length > 0 && (
        <div className="glass p-4" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
          <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-3">⚡ Contradicting Evidence</p>
          <ul className="space-y-2">
            {contradicting.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/65">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">↯</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      <div className="glass p-4" style={{ background: `${cfg.color}08`, borderColor: `${cfg.color}25` }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Recommendation</p>
        <p className="text-sm font-medium" style={{ color: cfg.color }}>{String(data.recommendation)}</p>
      </div>
    </div>
  );
}
