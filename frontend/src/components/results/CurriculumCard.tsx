"use client";

interface Props { data: Record<string, unknown>; studentName: string; }
interface TopicRec { topic: string; students_struggling: number; total_students: number; failure_rate_pct: number; root_causes: string[]; recommendations: { type: string; description: string; priority: string }[]; }

const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function CurriculumCard({ data }: Props) {
  const topics = (data.critical_topics as TopicRec[]) || [];
  const actions = (data.action_summary as string[]) || [];
  const health = Number(data.overall_health_score);
  const healthColor = health >= 75 ? "#10b981" : health >= 55 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-4">
      {/* Header metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass p-4 text-center">
          <p className="text-3xl font-bold text-white/90">{String(data.total_students_analyzed)}</p>
          <p className="text-xs text-white/35 mt-1">Students Analyzed</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: healthColor }}>{health.toFixed(0)}</p>
          <p className="text-xs text-white/35 mt-1">Cohort Health Score</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{topics.length}</p>
          <p className="text-xs text-white/35 mt-1">Critical Topics</p>
        </div>
      </div>

      {/* Top insight */}
      <div className="glass p-4" style={{ borderColor: "rgba(236,72,153,0.25)", background: "rgba(236,72,153,0.05)" }}>
        <p className="text-xs font-semibold text-pink-400/70 uppercase tracking-wider mb-1">📊 Top Insight</p>
        <p className="text-sm text-white/75">{String(data.top_insight)}</p>
      </div>

      {/* Critical Topics */}
      {topics.map((t, i) => (
        <div key={i} className="glass p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-white/85">{t.topic}</p>
            <span className="text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
              {t.failure_rate_pct}% failure rate
            </span>
          </div>
          <div className="progress-bar mb-3">
            <div className="progress-fill" style={{ width: `${t.failure_rate_pct}%`, background: "#ef4444" }} />
          </div>
          <p className="text-xs text-white/35 mb-2">{t.students_struggling}/{t.total_students} students struggling</p>

          <div className="mb-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Root Causes</p>
            <ul className="space-y-1">
              {t.root_causes.map((c, ci) => (
                <li key={ci} className="text-xs text-white/55 flex items-start gap-1.5">
                  <span className="text-red-400/60 mt-0.5">•</span>{c}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Recommendations</p>
            <div className="space-y-1.5">
              {t.recommendations.map((r, ri) => (
                <div key={ri} className="flex items-start gap-2 text-xs">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                    style={{ background: `${PRIORITY_COLOR[r.priority]}18`, color: PRIORITY_COLOR[r.priority] }}>
                    {r.priority}
                  </span>
                  <span className="text-white/55"><span className="text-white/35">[{r.type}]</span> {r.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="glass p-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Institutional Action Items</p>
          <ul className="space-y-2">
            {actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <span className="text-pink-400 mt-0.5 flex-shrink-0">→</span>{a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
