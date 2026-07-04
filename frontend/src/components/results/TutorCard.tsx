"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

interface Day { day: number; focus: string; concepts: string[]; resources: string[]; exercise: string; estimated_time: string; }

const DAY_COLORS = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b"];

export default function TutorCard({ data }: Props) {
  const days = (data.days as Day[]) || [];

  return (
    <div className="space-y-4">
      {/* Goal + Metric */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4">
          <p className="text-xs text-white/40 mb-1">📌 Overall Goal</p>
          <p className="text-sm text-white/80 leading-relaxed">{String(data.overall_goal)}</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-white/40 mb-1">✅ Success Metric</p>
          <p className="text-sm text-white/80 leading-relaxed">{String(data.success_metric)}</p>
        </div>
      </div>

      {/* Prereq check */}
      <div className="glass p-3 flex items-start gap-2" style={{ borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.06)" }}>
        <span className="text-amber-400 mt-0.5">⚠</span>
        <div>
          <p className="text-xs font-semibold text-amber-400/80 mb-0.5">Before Day 1 — Prerequisite Check</p>
          <p className="text-xs text-white/55">{String(data.prerequisite_check)}</p>
        </div>
      </div>

      {/* 5-Day Plan */}
      <div className="space-y-3">
        {days.map((day, i) => (
          <div key={day.day} className="glass p-4 animate-fade-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: DAY_COLORS[i] }}>
                {day.day}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/85">{day.focus}</p>
                <p className="text-[11px] text-white/35">⏱ {day.estimated_time}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Concepts</p>
                <ul className="space-y-1">
                  {day.concepts.map((c, ci) => (
                    <li key={ci} className="text-xs text-white/60 flex items-start gap-1.5">
                      <span style={{ color: DAY_COLORS[i] }} className="mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Resources</p>
                <ul className="space-y-1">
                  {day.resources.map((r, ri) => (
                    <li key={ri} className="text-xs text-white/60 flex items-start gap-1.5">
                      <span className="text-cyan-400/60 mt-0.5">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-3 py-2 rounded-lg text-xs"
              style={{ background: `${DAY_COLORS[i]}12`, border: `1px solid ${DAY_COLORS[i]}25`, color: "rgba(255,255,255,0.7)" }}>
              <span className="font-medium" style={{ color: DAY_COLORS[i] }}>Exercise: </span>
              {day.exercise}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
