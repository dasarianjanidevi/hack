"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

export default function ActionCard({ data }: Props) {
  const rc = (data.revision_class as Record<string, unknown>) || {};
  const quiz = (data.quiz as Record<string, unknown>) || {};
  const notifications = (data.notifications_sent as string[]) || [];

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="glass-premium p-5 flex items-start gap-4 border-l-4 border-l-green-500 badge-glow-green"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.04), rgba(10,15,26,0.85))" }}>
        <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(16,185,129,0.2)]">✅</span>
        <div>
          <p className="font-extrabold text-green-400 text-lg tracking-tight">Automated Actions Generated</p>
          <p className="text-sm text-white/70 mt-1 leading-relaxed">{String(data.action_summary)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Revision Class */}
        <div className="glass-premium p-6 border-t-2 border-t-blue-500">
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.05] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏫</span>
              <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Revision Class</p>
            </div>
            <span className="badge badge-blue font-bold text-[10px] px-2.5 py-0.5 uppercase">
              {String(rc.status)}
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Topic Title</span><span className="text-white/80 font-semibold text-right max-w-[70%] truncate">{String(rc.title)}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Scheduled</span><span className="text-white/80 font-semibold">{String(rc.scheduled_date)}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Duration</span><span className="text-white/80 font-semibold">{String(rc.duration)}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Mode / Format</span><span className="text-white/80 font-semibold">{String(rc.mode)}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Location</span><span className="text-white/80 font-semibold">{String(rc.location)}</span></div>
            <div className="pt-3 border-t border-white/[0.05] mt-1">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Instructor Directive</p>
              <p className="text-white/70 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-lg leading-relaxed italic">
                {String(rc.instructor_note)}
              </p>
            </div>
          </div>
        </div>

        {/* Quiz */}
        <div className="glass-premium p-6 border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.05] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📝</span>
              <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">Diagnostic Quiz</p>
            </div>
            <span className="badge badge-amber font-bold text-[10px] px-2.5 py-0.5 uppercase">
              {String(quiz.status)}
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Quiz Title</span><span className="text-white/80 font-semibold text-right max-w-[70%] truncate">{String(quiz.title)}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Questions</span><span className="text-white/80 font-semibold">{String(quiz.num_questions)} items</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Due Date</span><span className="text-white/80 font-semibold">{String(quiz.due_date)}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Passing Score</span><span className="text-white/80 font-semibold">{String(quiz.passing_score)}%</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Auto-graded</span><span className="text-green-400 font-bold">{quiz.auto_graded ? "Yes" : "No"}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.03]"><span className="text-white/40">Retakes Allowed</span><span className="text-white/80 font-semibold">{quiz.retake_allowed ? "Yes" : "No"}</span></div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-premium p-6">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">LMS Notifications Log</p>
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div key={i} className="text-xs text-white/70 flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.03]">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 badge-glow-green flex-shrink-0 animate-pulse" />
              <span className="font-medium">{n}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
          <p className="text-[11px] font-semibold text-amber-400/80 bg-amber-400/5 border border-amber-400/10 px-3 py-1.5 rounded-lg w-full text-center">
            🔔 {String(data.lms_status)}
          </p>
        </div>
      </div>
    </div>
  );
}

