"use client";

interface Props { data: Record<string, unknown>; studentName: string; }
interface UpskillItem { skill: string; priority: string; estimated_weeks: number; approach: string; }

const SEVERITY_COLOR: Record<string, string> = { Critical: "#ef4444", Moderate: "#f59e0b", Minor: "#10b981" };
const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function PlacementCard({ data }: Props) {
  const score = Number(data.placement_readiness_score);
  const ready = Boolean(data.ready_for_placement);
  const matched = (data.matched_skills as string[]) || [];
  const missing = (data.missing_critical_skills as string[]) || [];
  const niceToHave = (data.missing_nice_to_have as string[]) || [];
  const upskilling = (data.upskilling_plan as UpskillItem[]) || [];
  const severity = String(data.skill_gap_severity);
  const scoreColor = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreGlow = score >= 70 ? "badge-glow-green" : score >= 50 ? "badge-glow-amber" : "badge-glow-red";

  return (
    <div className="space-y-6">
      {/* Score + Role */}
      <div className={`glass-premium p-6 flex flex-col sm:flex-row items-center gap-6 transition-all ${scoreGlow}`} style={{ borderLeft: `4px solid ${scoreColor}` }}>
        <div className="relative w-28 h-28 flex-shrink-0 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor} strokeWidth="3.5"
              strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold" style={{ color: scoreColor }}>{score}</span>
            <span className="text-[10px] text-white/30 font-bold"> readiness</span>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Placement Target</p>
          <p className="text-2xl font-extrabold tracking-tight text-white/90">{String(data.target_role)}</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
            <span className={`badge ${ready ? "badge-green badge-glow-green" : "badge-red badge-glow-red"} font-bold text-xs px-3 py-1`}>
              {ready ? "✓ Ready for Placement" : "✗ Not Yet Ready"}
            </span>
            <span className="badge bg-white/[0.03] border border-white/[0.08] text-white/70 font-semibold text-xs px-3 py-1">
              {severity} Gap Severity
            </span>
          </div>
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-premium p-5">
          <p className="text-[10px] font-bold text-green-400/80 uppercase tracking-widest mb-3">✓ Matched Industry Skills</p>
          <div className="flex flex-wrap gap-2">
            {matched.map((s, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-xl bg-green-500/10 text-green-300 border border-green-500/20 font-medium">
                {s}
              </span>
            ))}
            {matched.length === 0 && <p className="text-xs text-white/30 italic">No verified matching skills.</p>}
          </div>
        </div>
        <div className="glass-premium p-5">
          <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-3">✗ Missing Critical Skills</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((s, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 font-medium">
                {s}
              </span>
            ))}
            {niceToHave.map((s, i) => (
              <span key={`nth-${i}`} className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/5 text-amber-300/80 border border-amber-500/15 font-medium">
                {s}
              </span>
            ))}
            {missing.length === 0 && niceToHave.length === 0 && <p className="text-xs text-white/30 italic">No critical missing skills.</p>}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass-premium p-4 flex items-start gap-3 border-l-4" style={{ borderColor: "#14b8a6", background: "rgba(20,184,166,0.04)" }}>
        <span className="text-xl text-teal-400 mt-0.5">💡</span>
        <p className="text-xs text-white/70 leading-relaxed font-medium">{String(data.key_insight)}</p>
      </div>

      {/* Upskilling Plan */}
      {upskilling.length > 0 && (
        <div className="glass-premium p-6">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Upskilling Roadmap & Action Plan</p>
          <div className="space-y-3.5">
            {upskilling.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] transition-all">
                <span className="text-xs px-2.5 py-1 rounded font-bold uppercase flex-shrink-0 shadow"
                  style={{ background: `${PRIORITY_COLOR[item.priority]}15`, color: PRIORITY_COLOR[item.priority], border: `1px solid ${PRIORITY_COLOR[item.priority]}30` }}>
                  {item.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-bold text-white/85">{item.skill}</p>
                    <span className="text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-lg">
                      ⏳ {item.estimated_weeks} Weeks
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{item.approach}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-between">
            <p className="text-xs text-white/60 font-semibold">
              🎯 Estimated Placement Window: <span className="text-teal-400 font-extrabold">{String(data.placement_timeline)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
