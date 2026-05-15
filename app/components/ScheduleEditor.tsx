"use client";

import { useState } from "react";
import { ArrowLeft, Check, Calendar, ChevronRight } from "lucide-react";
import type { ScheduleDay, WeekDay } from "../types";
import { saveSchedule } from "../lib/storage";

const DAYS: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_LABELS: Record<WeekDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

type Props = {
  schedule: ScheduleDay[];
  onSave: (updated: ScheduleDay[]) => void;
  onBack: () => void;
};

export default function ScheduleEditor({ schedule, onSave, onBack }: Props) {
  const [draft, setDraft] = useState<ScheduleDay[]>(
    schedule.map((d) => ({ ...d }))
  );
  const [editingDay, setEditingDay] = useState<WeekDay | null>(null);
  const [saved, setSaved] = useState(false);

  const setActive = (day: WeekDay) => {
    setDraft((prev) =>
      prev.map((d) => ({ ...d, active: d.day === day }))
    );
    setSaved(false);
  };

  const setWorkout = (day: WeekDay, value: string) => {
    setDraft((prev) =>
      prev.map((d) => (d.day === day ? { ...d, workout: value } : d))
    );
    setSaved(false);
  };

  const handleSave = () => {
    saveSchedule(draft);
    onSave(draft);
    setSaved(true);
    setTimeout(() => onBack(), 700);
  };

  const activeDay = draft.find((d) => d.active)?.day ?? null;

  return (
    <div className="w-full max-w-md min-h-screen pb-10">

      {/* Header */}
      <header className="px-5 pt-10 pb-5 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
            Weekly Schedule
          </p>
          <h1 className="text-lg font-black tracking-tight">Edit Schedule</h1>
        </div>
      </header>

      {/* Info banner */}
      <div className="mx-5 mb-5 flex items-center gap-2 bg-[#ff6a00]/5 border border-[#ff6a00]/20 rounded-xl px-3 py-2.5">
        <Calendar className="w-3.5 h-3.5 text-[#ff6a00] flex-shrink-0" />
        <p className="text-[11px] text-[#ff6a00] font-semibold">
          Tap a day to set it as today. Tap the name to edit the workout.
        </p>
      </div>

      {/* Day list */}
      <div className="px-5 flex flex-col gap-2 mb-5">
        {draft.map((item) => {
          const isActive = item.active;
          const isEditing = editingDay === item.day;

          return (
            <div
              key={item.day}
              className={`rounded-2xl border overflow-hidden relative transition-all ${
                isActive
                  ? "bg-[#ff6a00]/5 border-[#ff6a00]/30"
                  : "bg-[#111111] border-white/10"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6a00] to-transparent" />
              )}

              <div className="flex items-center gap-3 px-4 py-3">
                {/* Day chip — tap to set active */}
                <button
                  onClick={() => setActive(item.day)}
                  className={`w-12 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-all active:scale-95 ${
                    isActive
                      ? "bg-[#ff6a00] text-white shadow-lg shadow-[#ff6a00]/20"
                      : "bg-white/5 text-neutral-500 hover:bg-white/10"
                  }`}
                >
                  {item.day}
                </button>

                {/* Workout name — tap to edit */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={item.workout}
                      onChange={(e) => setWorkout(item.day, e.target.value)}
                      onBlur={() => setEditingDay(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingDay(null);
                      }}
                      className="w-full bg-white/5 border border-[#ff6a00]/40 rounded-lg px-2 py-1.5 text-sm font-bold text-white outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingDay(item.day)}
                      className="w-full text-left group flex items-center justify-between"
                    >
                      <span
                        className={`text-sm font-bold truncate ${
                          isActive ? "text-white" : "text-neutral-300"
                        }`}
                      >
                        {item.workout || "Tap to add workout"}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 flex-shrink-0 ml-2 transition-colors" />
                    </button>
                  )}
                  <p className="text-[10px] text-neutral-600 font-medium mt-0.5">
                    {DAY_LABELS[item.day]}
                  </p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <span className="text-[9px] font-black text-[#ff6a00] bg-[#ff6a00]/10 px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">
                    Today
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="px-5 flex flex-col gap-3">
        <button
          onClick={handleSave}
          className={`w-full rounded-xl py-4 font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
            saved
              ? "bg-emerald-600 shadow-emerald-900/30"
              : "bg-[#ff6a00] hover:bg-[#ff7a1a] shadow-[#ff6a00]/20"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" strokeWidth={3} />
              Schedule Saved!
            </>
          ) : (
            "Save Schedule"
          )}
        </button>
        <button
          onClick={onBack}
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 text-neutral-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}