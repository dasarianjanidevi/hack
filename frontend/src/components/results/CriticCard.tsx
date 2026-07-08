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
  const verdictGlow = verdict === "CONFIRMED" ? "badge-glow-green" : verdict === "CHALLENGED" ? "badge-glow-amber" : "badge-glow-purple";

  return (
    <div className="space-y-6">
      {/* Verdict Banner */}
      <div className={`glass-premium p-6 flex items-start gap-5 transition-all ${verdictGlow}`}
        style={{ borderColor: `${cfg.color}35`, background: `linear-gradient(135deg, ${cfg.bg}, rgba(10,15,26,0.9))` }}>
        <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{cfg.icon}</span>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Critic Verdict</p>
          <p className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: cfg.color }}>{verdict}</p>
          <p className="text-sm text-white/75 leading-relaxed">{String(data.reason)}</p>
        </div>
      </div>

      {/* Confidence Comparison */}
      <div className="glass-premium p-6">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Confidence Variance Check</p>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-white/50">Diagnosis Agent Claimed</span>
              <span className="text-white/75 font-semibold">{origPct}%</span>
            </div>
            <div className="progress-bar rounded-full h-2">
              <div className="progress-fill h-full rounded-full" style={{ width: `${origPct}%`, background: "linear-gradient(90deg, #3b82f6, #60a5fa)" }} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold" style={{ color: cfg.color }}>After Cross-Verification</span>
              <span className="font-extrabold" style={{ color: cfg.color }}>{pct}%</span>
            </div>
            <div className="progress-bar rounded-full h-2">
              <div className="progress-fill transition-all duration-700 h-full rounded-full"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.color}, #ffffff)` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Panels Grid */}
      {(supporting.length > 0 || contradicting.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supporting Evidence */}
          {supporting.length > 0 && (
            <div className="glass-premium p-5 border-l-4" style={{ borderLeftColor: "#10b981" }}>
              <p className="text-[10px] font-bold text-green-400/80 uppercase tracking-widest mb-3">✓ Supporting Evidence</p>
              <ul className="space-y-2.5">
                {supporting.map((e, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-white/75 leading-relaxed">
                    <span className="text-green-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contradicting Evidence */}
          {contradicting.length > 0 && (
            <div className="glass-premium p-5 border-l-4" style={{ borderLeftColor: "#f59e0b" }}>
              <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest mb-3">⚡ Contradicting Evidence</p>
              <ul className="space-y-2.5">
                {contradicting.map((e, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-white/75 leading-relaxed">
                    <span className="text-amber-400 font-bold flex-shrink-0 mt-0.5">⚡</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      <div className="glass-premium p-5" style={{ background: `linear-gradient(135deg, ${cfg.color}08, rgba(10,15,26,0.6))`, borderColor: `${cfg.color}30` }}>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Recommendation Directive</p>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: cfg.color }}>{String(data.recommendation)}</p>
      </div>
    </div>
  );
}

