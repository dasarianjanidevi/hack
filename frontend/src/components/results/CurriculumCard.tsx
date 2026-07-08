"use client";

interface Props { data: Record<string, unknown>; studentName: string; }
interface TopicRec { topic: string; students_struggling: number; total_students: number; failure_rate_pct: number; root_causes: string[]; recommendations: { type: string; description: string; priority: string }[]; }

const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function CurriculumCard({ data }: Props) {
  const topics = (data.critical_topics as TopicRec[]) || [];
  const actions = (data.action_summary as string[]) || [];
  const health = Number(data.overall_health_score);
  const healthColor = health >= 75 ? "#10b981" : health >= 55 ? "#f59e0b" : "#ef4444";
  const healthGlow = health >= 75 ? "badge-glow-green" : health >= 55 ? "badge-glow-amber" : "badge-glow-red";

  return (
    <div className="space-y-6">
      {/* Header metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-premium p-5 text-center">
          <p className="text-3xl font-extrabold text-white/90 tracking-tight">{String(data.total_students_analyzed)}</p>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Cohort Size</p>
        </div>
        <div className={`glass-premium p-5 text-center transition-all ${healthGlow}`} style={{ borderBottom: `2.5px solid ${healthColor}` }}>
          <p className="text-3xl font-extrabold tracking-tight" style={{ color: healthColor }}>{health.toFixed(0)}</p>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Health Index</p>
        </div>
        <div className="glass-premium p-5 text-center badge-glow-pink" style={{ borderBottom: "2.5px solid #ec4899" }}>
          <p className="text-3xl font-extrabold text-pink-400 tracking-tight">{topics.length}</p>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Critical Topics</p>
        </div>
      </div>

      {/* Top insight */}
      <div className="glass-premium p-5 flex items-start gap-3 border-l-4" style={{ borderColor: "#ec4899", background: "linear-gradient(135deg, rgba(236,72,153,0.04), rgba(10,15,26,0.9))" }}>
        <span className="text-xl filter drop-shadow-[0_0_5px_rgba(236,72,153,0.3)]">📊</span>
        <div>
          <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-1">Key Cohort Insight</p>
          <p className="text-sm text-white/80 leading-relaxed font-medium">{String(data.top_insight)}</p>
        </div>
      </div>

      {/* Critical Topics */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Detailed Critical Topic Risk Assessment</p>
        {topics.map((t, i) => (
          <div key={i} className="glass-premium p-6 hover:scale-[1.005] transition-all">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.04]">
              <p className="font-bold text-white/90 text-sm">{t.topic}</p>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 badge-glow-red">
                {t.failure_rate_pct}% Fail Rate
              </span>
            </div>
            
            <div className="mb-4">
              <div className="progress-bar rounded-full h-2">
                <div className="progress-fill h-full rounded-full" style={{ width: `${t.failure_rate_pct}%`, background: "linear-gradient(90deg, #ef4444, #ec4899)" }} />
              </div>
              <p className="text-[10px] text-white/40 mt-2 font-medium">⚠️ {t.students_struggling} of {t.total_students} students have dropped below passing threshold</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-2">Identified Root Causes</p>
                <ul className="space-y-2">
                  {t.root_causes.map((c, ci) => (
                    <li key={ci} className="text-xs text-white/75 flex items-start gap-2">
                      <span className="text-red-400 font-bold flex-shrink-0 mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-2">Recommended Interventions</p>
                <div className="space-y-2.5">
                  {t.recommendations.map((r, ri) => (
                    <div key={ri} className="flex items-start gap-2 text-xs">
                      <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase flex-shrink-0 mt-0.5"
                        style={{ background: `${PRIORITY_COLOR[r.priority]}15`, color: PRIORITY_COLOR[r.priority], border: `1px solid ${PRIORITY_COLOR[r.priority]}30` }}>
                        {r.priority}
                      </span>
                      <span className="text-white/70 leading-normal"><span className="text-white/40">[{r.type}]</span> {r.description}</span>
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
        <div className="glass-premium p-6">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Institutional Action Items</p>
          <div className="space-y-3">
            {actions.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] transition-all">
                <span className="text-pink-400 font-bold flex-shrink-0">→</span>
                <span className="text-xs text-white/80 font-medium leading-relaxed">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
