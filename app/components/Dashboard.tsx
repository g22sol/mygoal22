"use client";

import {
  Flame,
  Activity,
  Play,
  Settings2,
  Target,
  CheckCircle2,
  Calendar,
  Check,
  Wind,
  Timer,
  Gauge,
  RotateCcw,
  LogOut,                          // ← add
} from "lucide-react";
import type { ExerciseTemplate, SavedSession, SprintEntry, ViewName } from "../types";
import { WEEK_SCHEDULE } from "../constants";
import { formatDate } from "../lib/utils";

type Props = {
  template: ExerciseTemplate[];
  lastSession: SavedSession | null;
  latestSprint: SprintEntry | null;
  touchesComplete: boolean;
  onStartSession: () => void;
  onOpenTemplate: () => void;
  onTouchesComplete: () => void;
  onNavigate: (v: ViewName) => void;
  onLogout: () => void;            // ← add
};

const SPRINT_METRIC_DEFS = [
  { label: "Top Speed", unit: "km/h", icon: Wind, key: "topSpeed" },
  { label: "10m Time", unit: "s", icon: Timer, key: "time10m" },
  { label: "60m Time", unit: "s", icon: Gauge, key: "time60m" },
  { label: "Curved Run", unit: "s", icon: RotateCcw, key: "curvedRun" },
] as const;

export default function Dashboard({
  template,
  lastSession,
  latestSprint,
  touchesComplete,
  onStartSession,
  onOpenTemplate,
  onTouchesComplete,
  onNavigate,
  onLogout,                        // ← add
}: Props) {
  return (
    <div className="w-full max-w-md min-h-screen pb-24">

      {/* ── Header ── */}
      <header className="px-5 pt-10 pb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff6a00] flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              MyGoal<span className="text-[#ff6a00]">22</span>
            </h1>
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1 ml-10">
            Elite Performance System
          </p>
        </div>

        {/* Avatar + logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#ff6a00] flex items-center justify-center font-bold text-sm">
            KH
          </div>
        </div>
      </header>

      {/* ── Greeting ── */}
      <section className="px-5 mb-5">
        <div className="flex items-center gap-2 text-[#ff6a00] text-xs font-bold uppercase tracking-widest">
          <Activity className="w-4 h-4" />
          Starting May 20
        </div>
        <h2 className="text-2xl font-black mt-2">
          Ready to <span className="text-[#ff6a00]">dominate</span>, Karik?
        </h2>
      </section>

      {/* ── Today's Training ── */}
      <section className="mx-5 mb-4 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6a00] via-[#ee0979] to-transparent" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
              Today's Training
            </p>
            <span className="text-[10px] font-semibold text-[#ff6a00] bg-[#ff6a00]/10 px-2 py-0.5 rounded-full">
              SCHEDULED
            </span>
          </div>
          <h3 className="text-xl font-black mt-2">Acceleration + Lowers</h3>
          <div className="flex flex-wrap gap-2 mt-3 mb-3">
            <span className="text-xs bg-white/5 text-neutral-400 px-3 py-1 rounded-full">
              {template.length} Exercise{template.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs bg-white/5 text-neutral-400 px-3 py-1 rounded-full">
              High Intensity
            </span>
          </div>
          <div className="flex flex-col gap-1 mb-4">
            {template.map((ex, i) => (
              <div key={ex.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#ff6a00] w-4">{i + 1}</span>
                  <span className="text-xs font-semibold text-neutral-300">{ex.name}</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-semibold">
                  {ex.sets}×{ex.reps}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onStartSession}
              className="flex-1 bg-[#ff6a00] hover:bg-[#ff7a1a] active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff6a00]/20"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Session
            </button>
            <button
              onClick={onOpenTemplate}
              className="w-12 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all rounded-xl flex items-center justify-center"
            >
              <Settings2 className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Last Session ── */}
      {lastSession && (
        <section className="mx-5 mb-4 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-transparent" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
                Last Session
              </p>
              <button
                onClick={() => onNavigate("history")}
                className="text-[10px] font-bold text-[#ff6a00] bg-[#ff6a00]/10 px-2 py-0.5 rounded-full hover:bg-[#ff6a00]/20 transition-colors"
              >
                View all →
              </button>
            </div>
            <h4 className="text-base font-black">{lastSession.title}</h4>
            <div className="flex items-center gap-1 mt-1 mb-3 text-neutral-500 text-xs font-semibold">
              <Calendar className="w-3 h-3" />
              {formatDate(lastSession.date)}
            </div>
            <div className="flex flex-col gap-1.5">
              {lastSession.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5"
                >
                  <span className="text-xs font-bold text-neutral-300">{ex.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500 font-semibold">
                      {ex.sets}×{ex.reps}
                    </span>
                    {ex.weight ? (
                      <span className="text-[10px] font-black text-[#ff6a00] bg-[#ff6a00]/10 px-1.5 py-0.5 rounded-md">
                        {ex.weight} kg
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-600 font-semibold">
                        no weight
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 10K Touches ── */}
      <section className="mx-5 mb-4 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ee0979] via-[#ff6a00] to-transparent" />
        <div className="p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
            10K Touches
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-black">{touchesComplete ? "10,000" : "0"}</h3>
            <span className="text-neutral-500 text-sm font-semibold">/ 10,000</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 mb-1 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#ff6a00] to-[#ee0979]"
              style={{ width: touchesComplete ? "100%" : "0%" }}
            />
          </div>
          <p className="text-neutral-500 text-xs mt-2 mb-4">
            {touchesComplete
              ? "Daily touches complete. Great work!"
              : "Press complete when you finish your daily touches."}
          </p>
          <button
            onClick={onTouchesComplete}
            disabled={touchesComplete}
            className={`w-full rounded-xl py-4 font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
              touchesComplete
                ? "bg-emerald-600 shadow-emerald-900/30 cursor-default"
                : "bg-gradient-to-r from-[#ff6a00] to-[#ee0979] hover:opacity-90 shadow-[#ff6a00]/20"
            }`}
          >
            {touchesComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                10K Touches Completed
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Complete 10K Touches
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── Sprint Metrics ── */}
      <section className="mx-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-widest">Sprint Metrics</h3>
          <button
            onClick={() => onNavigate("sprint")}
            className="text-[10px] font-bold text-[#ff6a00] bg-[#ff6a00]/10 px-2 py-0.5 rounded-full hover:bg-[#ff6a00]/20 transition-colors"
          >
            {latestSprint ? "Log new →" : "Log sprint →"}
          </button>
        </div>
        {latestSprint && (
          <div className="mb-2 flex items-center gap-1 text-neutral-600 text-[10px] font-semibold px-1">
            <Calendar className="w-3 h-3" />
            Last recorded: {formatDate(latestSprint.date)}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {SPRINT_METRIC_DEFS.map(({ label, unit, icon: Icon, key }) => {
            const value = latestSprint?.[key] || "—";
            return (
              <div
                key={label}
                className="bg-[#111111] border border-white/10 rounded-2xl p-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-10 h-10 bg-[#ff6a00]/5 rounded-bl-2xl" />
                <div className="w-8 h-8 rounded-lg bg-[#ff6a00]/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-[#ff6a00]" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">{value}</span>
                  {value !== "—" && (
                    <span className="text-xs text-neutral-500">{unit}</span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Weekly Schedule ── */}
      <section className="mx-5 mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest mb-3">
          Weekly Schedule
        </h3>
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
          {WEEK_SCHEDULE.map((item) => (
            <div
              key={item.day}
              className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 ${
                item.active ? "bg-[#ff6a00]/5" : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  item.active
                    ? "bg-[#ff6a00] text-white"
                    : "bg-white/5 text-neutral-500"
                }`}
              >
                {item.day}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold text-sm truncate ${
                    item.active ? "text-white" : "text-neutral-400"
                  }`}
                >
                  {item.workout}
                </p>
              </div>
              {item.active && (
                <span className="text-[10px] text-[#ff6a00] bg-[#ff6a00]/10 px-2 py-1 rounded-full font-bold flex-shrink-0">
                  Today
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}