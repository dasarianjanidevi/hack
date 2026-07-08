"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

const VERDICT_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  CONFIRMED:    { color: "#10b981", bg: "rgba(16,185,129,0.08)",  icon: "✅" },
  CHALLENGED:   { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", icon: "⚠️" },
  INCONCLUSIVE: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", icon: "❓" },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14,
    }}>{children}</p>
  );
}

export default function CriticCard({ data }: Props) {
  const verdict = String(data.verdict || "CONFIRMED");
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.CONFIRMED;
  const supporting = (data.supporting_evidence as string[]) || [];
  const contradicting = (data.contradicting_evidence as string[]) || [];
  const pct = Math.round(Number(data.confidence) * 100);
  const origPct = Math.round(Number(data.original_confidence) * 100);
  const verdictGlow = verdict === "CONFIRMED" ? "badge-glow-green" : verdict === "CHALLENGED" ? "badge-glow-amber" : "badge-glow-purple";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Verdict Banner ─────────────────────────────────────────── */}
      <div
        className={`glass-premium ${verdictGlow}`}
        style={{
          padding: "24px 26px",
          display: "flex", alignItems: "flex-start", gap: 20,
          borderColor: `${cfg.color}30`,
          background: `linear-gradient(135deg, ${cfg.bg}, rgba(10,15,26,0.9))`,
        }}
      >
        <span style={{ fontSize: 38, lineHeight: 1 }}>{cfg.icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            Critic Verdict
          </p>
          <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: cfg.color, marginBottom: 10 }}>
            {verdict}
          </p>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
            {String(data.reason)}
          </p>
        </div>
      </div>

      {/* ── Confidence Comparison ──────────────────────────────────── */}
      <div className="glass-premium" style={{ padding: "24px 24px" }}>
        <SectionLabel>📊 Confidence Variance Check</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 10 }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Diagnosis Agent Claimed</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{origPct}%</span>
            </div>
            <div className="progress-bar" style={{ borderRadius: 99, height: 6 }}>
              <div className="progress-fill" style={{ width: `${origPct}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
            </div>
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${cfg.color}25` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 10 }}>
              <span style={{ color: cfg.color, fontWeight: 600 }}>After Cross-Verification</span>
              <span style={{ color: cfg.color, fontWeight: 800 }}>{pct}%</span>
            </div>
            <div className="progress-bar" style={{ borderRadius: 99, height: 6 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${cfg.color},#ffffff60)`, transition: "width 0.7s ease" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Evidence Grid ──────────────────────────────────────────── */}
      {(supporting.length > 0 || contradicting.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {supporting.length > 0 && (
            <div className="glass-premium" style={{ padding: "22px 20px", borderLeft: "3px solid #10b981" }}>
              <SectionLabel>✓ Supporting Evidence</SectionLabel>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {supporting.map((e, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                    <span style={{ color: "#10b981", fontWeight: 800, flexShrink: 0, marginTop: 2 }}>✓</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {contradicting.length > 0 && (
            <div className="glass-premium" style={{ padding: "22px 20px", borderLeft: "3px solid #f59e0b" }}>
              <SectionLabel>⚡ Contradicting Evidence</SectionLabel>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {contradicting.map((e, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                    <span style={{ color: "#f59e0b", fontWeight: 800, flexShrink: 0, marginTop: 2 }}>⚡</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Recommendation ────────────────────────────────────────── */}
      <div className="glass-premium" style={{
        padding: "20px 22px",
        background: `linear-gradient(135deg, ${cfg.color}08, rgba(10,15,26,0.6))`,
        borderColor: `${cfg.color}28`,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Recommendation Directive
        </p>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: cfg.color, lineHeight: 1.7 }}>
          {String(data.recommendation)}
        </p>
      </div>
    </div>
  );
}
