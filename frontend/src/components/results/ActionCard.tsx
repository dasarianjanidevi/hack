"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

export default function ActionCard({ data }: Props) {
  const rc = (data.revision_class as Record<string, unknown>) || {};
  const quiz = (data.quiz as Record<string, unknown>) || {};
  const notifications = (data.notifications_sent as string[]) || [];

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className="glass p-4 flex items-center gap-4 glow-green"
        style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.06)" }}>
        <span className="text-3xl">✅</span>
        <div>
          <p className="font-bold text-green-400 text-lg">Actions Created Successfully</p>
          <p className="text-sm text-white/50 mt-0.5">{String(data.action_summary)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Revision Class */}
        <div className="glass p-4" style={{ borderColor: "rgba(59,130,246,0.25)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏫</span>
            <div>
              <p className="text-sm font-semibold text-blue-400">Revision Class</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                {String(rc.status)}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div><span className="text-white/35">Title: </span><span className="text-white/70">{String(rc.title)}</span></div>
            <div><span className="text-white/35">When: </span><span className="text-white/70">{String(rc.scheduled_date)}</span></div>
            <div><span className="text-white/35">Duration: </span><span className="text-white/70">{String(rc.duration)}</span></div>
            <div><span className="text-white/35">Format: </span><span className="text-white/70">{String(rc.mode)}</span></div>
            <div><span className="text-white/35">Location: </span><span className="text-white/70">{String(rc.location)}</span></div>
            <div className="pt-2 border-t border-white/6">
              <span className="text-white/35">Note: </span>
              <span className="text-white/55">{String(rc.instructor_note)}</span>
            </div>
          </div>
        </div>

        {/* Quiz */}
        <div className="glass p-4" style={{ borderColor: "rgba(245,158,11,0.25)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📝</span>
            <div>
              <p className="text-sm font-semibold text-amber-400">Diagnostic Quiz</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                {String(quiz.status)}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div><span className="text-white/35">Title: </span><span className="text-white/70">{String(quiz.title)}</span></div>
            <div><span className="text-white/35">Questions: </span><span className="text-white/70">{String(quiz.num_questions)}</span></div>
            <div><span className="text-white/35">Due: </span><span className="text-white/70">{String(quiz.due_date)}</span></div>
            <div><span className="text-white/35">Pass Score: </span><span className="text-white/70">{String(quiz.passing_score)}%</span></div>
            <div><span className="text-white/35">Auto-graded: </span><span className="text-green-400">{quiz.auto_graded ? "Yes" : "No"}</span></div>
            <div><span className="text-white/35">Retake: </span><span className="text-white/70">{quiz.retake_allowed ? "Allowed" : "Not allowed"}</span></div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass p-4">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Notifications Sent</p>
        <ul className="space-y-2">
          {notifications.map((n, i) => (
            <li key={i} className="text-sm text-white/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              {n}
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-white/6">
          <p className="text-xs text-amber-400/60">{String(data.lms_status)}</p>
        </div>
      </div>
    </div>
  );
}
