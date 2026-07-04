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

  return (
    <div className="space-y-4">
      {/* Score + Role */}
      <div className="glass p-5 flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor} strokeWidth="3"
              strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold" style={{ color: scoreColor }}>{score}</span>
            <span className="text-[9px] text-white/30">/ 100</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-white/40 mb-1">Placement Readiness</p>
          <p className="text-2xl font-bold" style={{ color: scoreColor }}>{score}/100</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-white/60">Target: </span>
            <span className="text-sm font-medium text-teal-400">{String(data.target_role)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ready ? "bg-green-500/15 text-green-400 border border-green-500/25" : "bg-red-500/15 text-red-400 border border-red-500/25"}`}>
              {ready ? "✓ Ready for Placement" : "✗ Not Yet Ready"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${SEVERITY_COLOR[severity]}15`, color: SEVERITY_COLOR[severity], border: `1px solid ${SEVERITY_COLOR[severity]}30` }}>
              {severity} Gap
            </span>
          </div>
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4">
          <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wider mb-2">✓ Matched Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-green-500/12 text-green-400 border border-green-500/25">{s}</span>
            ))}
          </div>
        </div>
        <div className="glass p-4">
          <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-2">✗ Missing Critical Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-500/12 text-red-400 border border-red-500/25">{s}</span>
            ))}
            {niceToHave.map((s, i) => (
              <span key={`nth-${i}`} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/70 border border-amber-500/20">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass p-3 flex items-start gap-2" style={{ borderColor: "rgba(20,184,166,0.25)", background: "rgba(20,184,166,0.05)" }}>
        <span className="text-teal-400 mt-0.5 flex-shrink-0">💡</span>
        <p className="text-sm text-white/65">{String(data.key_insight)}</p>
      </div>

      {/* Upskilling Plan */}
      {upskilling.length > 0 && (
        <div className="glass p-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Upskilling Roadmap</p>
          <div className="space-y-2.5">
            {upskilling.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/3 border border-white/6">
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 mt-0.5"
                  style={{ background: `${PRIORITY_COLOR[item.priority]}15`, color: PRIORITY_COLOR[item.priority] }}>
                  {item.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-white/75">{item.skill}</p>
                    <p className="text-xs text-white/30">{item.estimated_weeks}w</p>
                  </div>
                  <p className="text-xs text-white/45">{item.approach}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/6">
            <p className="text-sm text-white/60">
              <span className="text-teal-400 font-medium">Timeline: </span>
              {String(data.placement_timeline)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
