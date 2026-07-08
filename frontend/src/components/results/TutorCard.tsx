"use client";

interface Props { data: Record<string, unknown>; studentName: string; }

interface Day { day: number; focus: string; concepts: string[]; resources: string[]; exercise: string; estimated_time: string; }

const DAY_COLORS = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b"];

export default function TutorCard({ data }: Props) {
  const days = (data.days as Day[]) || [];

  return (
    <div className="space-y-6">
      {/* Goal + Metric */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-premium p-5 border-t-2 border-t-blue-500">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">🎯 Overall Goal</p>
          <p className="text-sm text-white/80 leading-relaxed font-medium">{String(data.overall_goal)}</p>
        </div>
        <div className="glass-premium p-5 border-t-2 border-t-teal-500">
          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2">🏆 Success Metric</p>
          <p className="text-sm text-white/80 leading-relaxed font-medium">{String(data.success_metric)}</p>
        </div>
      </div>

      {/* Prereq check */}
      <div className="glass-premium p-4 flex items-start gap-3 border-l-4" style={{ borderColor: "#f59e0b", background: "rgba(245,158,11,0.04)" }}>
        <span className="text-xl text-amber-500 mt-0.5">⚠️</span>
        <div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Before Day 1 — Prerequisite Verification</p>
          <p className="text-xs text-white/70 leading-relaxed">{String(data.prerequisite_check)}</p>
        </div>
      </div>

      {/* 5-Day Plan */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Personalized 5-Day Study Program</p>
        {days.map((day, i) => (
          <div key={day.day} className="glass-premium p-6 animate-fade-slide-up hover:scale-[1.005] transition-all" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${DAY_COLORS[i]}, #000000)` }}>
                  Day {day.day}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{day.focus}</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-white/[0.04] text-white/60 border border-white/[0.08] flex items-center gap-1">
                ⏱ {day.estimated_time}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-2">Core Concepts Covered</p>
                <ul className="space-y-2">
                  {day.concepts.map((c, ci) => (
                    <li key={ci} className="text-xs text-white/75 flex items-start gap-2">
                      <span style={{ color: DAY_COLORS[i] }} className="font-bold flex-shrink-0 mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-2">Learning Resources</p>
                <ul className="space-y-2">
                  {day.resources.map((r, ri) => (
                    <li key={ri} className="text-xs text-white/75 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold flex-shrink-0 mt-0.5">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl text-xs flex items-start gap-2"
              style={{ background: `${DAY_COLORS[i]}08`, border: `1px solid ${DAY_COLORS[i]}25`, color: "rgba(255,255,255,0.75)" }}>
              <span className="font-bold uppercase tracking-widest text-[10px]" style={{ color: DAY_COLORS[i] }}>Exercise:</span>
              <span className="leading-relaxed">{day.exercise}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

