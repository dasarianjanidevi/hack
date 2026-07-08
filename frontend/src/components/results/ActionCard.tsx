"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14,
    }}>{children}</p>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 14px", borderRadius: 10,
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
    }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600, textAlign: "right", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

export default function ActionCard({ data }: Props) {
  const rc = (data.revision_class as Record<string, any>) || {};
  const quiz = (data.quiz as Record<string, any>) || {};
  const notifications = (data.notifications_sent as any[]) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Status Banner ──────────────────────────────────────────── */}
      <div className="glass-premium badge-glow-green" style={{
        padding: "20px 24px", display: "flex", alignItems: "center", gap: 18,
        borderLeft: "3px solid #10b981",
        background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(10,15,26,0.88))",
      }}>
        <span style={{ fontSize: 36, lineHeight: 1 }}>✅</span>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#34d399", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Automated Actions Generated
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.68)", lineHeight: 1.7 }}>
            {String(data.action_summary)}
          </p>
        </div>
      </div>

      {/* ── Revision Class + Quiz ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Revision Class */}
        <div className="glass-premium" style={{ padding: "24px 22px", borderTop: "2.5px solid #3b82f6" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 18, paddingBottom: 14,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🏫</span>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Revision Class
              </p>
            </div>
            <span className="badge badge-blue" style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px" }}>
              {String(rc.status)}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <InfoRow label="Topic" value={String(rc.title)} />
            <InfoRow label="Scheduled" value={String(rc.scheduled_date)} />
            <InfoRow label="Duration" value={String(rc.duration)} />
            <InfoRow label="Mode" value={String(rc.mode)} />
            <InfoRow label="Location" value={String(rc.location)} />
          </div>
          {rc.instructor_note && (
            <div style={{
              marginTop: 14, padding: "12px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                Instructor Note
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, fontStyle: "italic" }}>
                {String(rc.instructor_note)}
              </p>
            </div>
          )}
        </div>

        {/* Quiz */}
        <div className="glass-premium" style={{ padding: "24px 22px", borderTop: "2.5px solid #f59e0b" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 18, paddingBottom: 14,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📝</span>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Diagnostic Quiz
              </p>
            </div>
            <span className="badge badge-amber" style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px" }}>
              {String(quiz.status)}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <InfoRow label="Quiz Title" value={String(quiz.title)} />
            <InfoRow label="Questions" value={`${String(quiz.num_questions)} items`} />
            <InfoRow label="Due Date" value={String(quiz.due_date)} />
            <InfoRow label="Passing Score" value={`${String(quiz.passing_score)}%`} />
            <InfoRow label="Auto-graded" value={quiz.auto_graded ? "Yes ✓" : "No"} />
            <InfoRow label="Retakes" value={quiz.retake_allowed ? "Allowed" : "Not Allowed"} />
          </div>
        </div>
      </div>

      {/* ── Notifications Log ──────────────────────────────────────── */}
      <div className="glass-premium" style={{ padding: "24px 24px" }}>
        <SectionLabel>🔔 LMS Notifications Log</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map((n, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>{n}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 16, padding: "10px 14px", borderRadius: 10, textAlign: "center",
          background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)",
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(251,191,36,0.8)" }}>
            🔔 {String(data.lms_status)}
          </p>
        </div>
      </div>
    </div>
  );
}
