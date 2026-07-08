"use client";

interface Props { data: Record<string, unknown>; studentName: string; }
interface UpskillItem { skill: string; priority: string; estimated_weeks: number; approach: string; }

const SEVERITY_COLOR: Record<string, string> = { Critical: "#ef4444", Moderate: "#f59e0b", Minor: "#10b981" };
const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14,
    }}>{children}</p>
  );
}

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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Score + Role */}
      <div className={`glass-premium ${scoreGlow}`} style={{ padding: "24px 26px", display: "flex", flexDirection: "row", alignItems: "center", gap: 24, borderLeft: `4px solid ${scoreColor}` }}>
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
          <svg style={{ width: 100, height: 100, transform: "rotate(-90deg)" }} viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor} strokeWidth="3.5"
              strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor }}>{score}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>readiness</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Placement Target</p>
          <p style={{ fontSize: 20, fontWeight: 850, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>{String(data.target_role)}</p>
          
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 12 }}>
            <span className={`badge ${ready ? "badge-green badge-glow-green" : "badge-red badge-glow-red"}`} style={{ fontWeight: 700, fontSize: 12 }}>
              {ready ? "✓ Ready for Placement" : "✗ Not Yet Ready"}
            </span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 12 }}>
              {severity} Gap Severity
            </span>
          </div>
        </div>
      </div>

      {/* Skills grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="glass-premium" style={{ padding: "22px 20px" }}>
          <SectionLabel>✓ Matched Industry Skills</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {matched.map((s, i) => (
              <span key={i} className="badge badge-green" style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px" }}>
                {s}
              </span>
            ))}
            {matched.length === 0 && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No verified matching skills.</p>}
          </div>
        </div>
        <div className="glass-premium" style={{ padding: "22px 20px" }}>
          <SectionLabel>✗ Missing Critical Skills</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {missing.map((s, i) => (
              <span key={i} className="badge badge-red" style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px" }}>
                {s}
              </span>
            ))}
            {niceToHave.map((s, i) => (
              <span key={`nth-${i}`} className="badge badge-amber" style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px" }}>
                {s}
              </span>
            ))}
            {missing.length === 0 && niceToHave.length === 0 && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>No critical missing skills.</p>}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass-premium" style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14, borderLeft: "3px solid #14b8a6", background: "rgba(20,184,166,0.04)" }}>
        <span style={{ fontSize: 20, marginTop: 2 }}>💡</span>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>{String(data.key_insight)}</p>
      </div>

      {/* Upskilling Plan */}
      {upskilling.length > 0 && (
        <div className="glass-premium" style={{ padding: "24px 24px" }}>
          <SectionLabel>Upskilling Roadmap & Action Plan</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upskilling.map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 14, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                  background: `${PRIORITY_COLOR[item.priority]}15`, color: PRIORITY_COLOR[item.priority],
                  border: `1px solid ${PRIORITY_COLOR[item.priority]}30`, flexShrink: 0, marginTop: 2,
                }}>
                  {item.priority}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{item.skill}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#14b8a6", background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)", padding: "2px 8px", borderRadius: 6 }}>
                      ⏳ {item.estimated_weeks} Weeks
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{item.approach}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>
              🎯 Estimated Placement Window: <strong style={{ color: "#2dd4bf" }}>{String(data.placement_timeline)}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
