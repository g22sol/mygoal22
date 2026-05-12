"use client";

import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Dumbbell,
  Play,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type { SavedSession } from "../types";
import { formatDate } from "../lib/utils";

type Props = {
  history: SavedSession[];
  onDelete: (id: string) => void;
  onBack: () => void;
  onStartSession: () => void;
};

export default function WorkoutHistory({
  history,
  onDelete,
  onBack,
  onStartSession,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const sorted = [...history].reverse();

  return (
    <div className="w-full max-w-md min-h-screen pb-24">

      <header className="px-5 pt-10 pb-5 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
            MyGoal22
          </p>
          <h1 className="text-lg font-black tracking-tight">Workout History</h1>
        </div>
        {history.length > 0 && (
          <div className="bg-[#ff6a00]/10 px-2.5 py-1 rounded-full">
            <span className="text-xs font-black text-[#ff6a00]">{history.length}</span>
          </div>
        )}
      </header>

      {sorted.length === 0 ? (
        <div className="mx-5 mt-10 rounded-2xl bg-[#111111] border border-white/10 p-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-neutral-600" />
          </div>
          <p className="text-base font-black text-neutral-400">No sessions yet</p>
          <p className="text-xs text-neutral-600 mt-1 font-semibold">
            Complete a workout to see it here.
          </p>
          <button
            onClick={onStartSession}
            className="mt-6 bg-[#ff6a00] hover:bg-[#ff7a1a] active:scale-[0.98] transition-all rounded-xl px-6 py-3 font-black text-sm flex items-center gap-2 shadow-lg shadow-[#ff6a00]/20"
          >
            <Play className="w-4 h-4 fill-white" />
            Start First Session
          </button>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-3">
          {sorted.map((session, index) => {
            const isExpanded = expanded === session.id;
            const totalWeight = session.exercises
              .filter((e) => e.weight)
              .reduce((sum, e) => sum + parseFloat(e.weight || "0") * e.sets, 0);

            return (
              <div
                key={session.id}
                className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6a00] via-[#ee0979] to-transparent" />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {index === 0 && (
                          <span className="text-[9px] font-black text-[#ff6a00] bg-[#ff6a00]/10 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                            Latest
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-semibold">
                          <Calendar className="w-3 h-3" />
                          {formatDate(session.date)}
                        </div>
                      </div>
                      <h3 className="text-sm font-black text-white truncate">
                        {session.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => onDelete(session.id)}
                      className="ml-3 w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5">
                      <Dumbbell className="w-3 h-3 text-neutral-500" />
                      <span className="text-[10px] font-bold text-neutral-400">
                        {session.exercises.length} exercises
                      </span>
                    </div>
                    {totalWeight > 0 && (
                      <div className="flex items-center gap-1.5 bg-[#ff6a00]/10 rounded-lg px-2.5 py-1.5">
                        <TrendingUp className="w-3 h-3 text-[#ff6a00]" />
                        <span className="text-[10px] font-bold text-[#ff6a00]">
                          {totalWeight.toFixed(0)} kg vol.
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setExpanded(isExpanded ? null : session.id)}
                    className="w-full flex items-center justify-between bg-white/5 active:scale-[0.99] transition-all rounded-xl px-3 py-2.5"
                  >
                    <span className="text-[11px] font-bold text-neutral-400">
                      {isExpanded ? "Hide exercises" : "Show exercises"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-1.5">
                    <div className="w-full h-px bg-white/5 mb-1" />
                    {session.exercises.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-black text-[#ff6a00] w-4 flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold text-neutral-300 truncate">
                            {ex.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
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
                )}
              </div>
            );
          })}

          <button
            onClick={onBack}
            className="w-full mt-1 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 text-neutral-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}