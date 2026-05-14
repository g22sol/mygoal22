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
  Check,
  Trophy,
  Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { SavedSession } from "../types";
import { formatDate, getBestWeight } from "../lib/utils";
import { buildPRData, isExercisePR } from "../lib/prDetection";

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
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  const sorted = [...history].reverse();

  // Build PR data once from the full history
  const { sessionPRs } = useMemo(() => buildPRData(history), [history]);

  const toggleEx = (key: string) =>
    setExpandedEx((prev) => (prev === key ? null : key));

  return (
    <div className="w-full max-w-md min-h-screen pb-24">

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

            // PR names for this session
            const prNames = Array.from(sessionPRs[session.id] ?? []);
            const hasPRs = prNames.length > 0;

            // Volume
            const totalVolume = session.exercises.reduce((sum, ex) => {
              if (ex.setLogs) {
                return (
                  sum +
                  ex.setLogs
                    .filter((s) => s.completed && s.weight !== "")
                    .reduce(
                      (s, set) =>
                        s +
                        (parseFloat(set.weight) || 0) *
                          (parseInt(set.reps) || 0),
                      0
                    )
                );
              }
              const w = parseFloat(ex.weight ?? "");
              return sum + (isNaN(w) ? 0 : w * ex.sets * ex.reps);
            }, 0);

            return (
              <div
                key={session.id}
                className={`rounded-2xl border overflow-hidden relative transition-all ${
                  hasPRs
                    ? "bg-[#111111] border-amber-500/30"
                    : "bg-[#111111] border-white/10"
                }`}
              >
                {/* Top accent — gold for PR sessions, normal otherwise */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] ${
                    hasPRs
                      ? "bg-gradient-to-r from-amber-400 via-[#ff6a00] to-transparent"
                      : "bg-gradient-to-r from-[#ff6a00] via-[#ee0979] to-transparent"
                  }`}
                />

                <div className="p-4">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {index === 0 && (
                          <span className="text-[9px] font-black text-[#ff6a00] bg-[#ff6a00]/10 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                            Latest
                          </span>
                        )}
                        {hasPRs && (
                          <span className="flex items-center gap-0.5 text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                            <Trophy className="w-2.5 h-2.5" />
                            {prNames.length} PR{prNames.length > 1 ? "s" : ""}
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

                      {/* PR exercise names */}
                      {hasPRs && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {prNames.map((name) => (
                            <span
                              key={name}
                              className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-400/8 border border-amber-400/20 px-1.5 py-0.5 rounded-md"
                            >
                              <Zap className="w-2 h-2" />
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onDelete(session.id)}
                      className="ml-3 w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>

                  {/* Stats strip */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5">
                      <Dumbbell className="w-3 h-3 text-neutral-500" />
                      <span className="text-[10px] font-bold text-neutral-400">
                        {session.exercises.length} exercises
                      </span>
                    </div>
                    {totalVolume > 0 && (
                      <div className="flex items-center gap-1.5 bg-[#ff6a00]/10 rounded-lg px-2.5 py-1.5">
                        <TrendingUp className="w-3 h-3 text-[#ff6a00]" />
                        <span className="text-[10px] font-bold text-[#ff6a00]">
                          {totalVolume.toFixed(0)} kg vol.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expand toggle */}
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

                {/* Expanded exercises */}
                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-2">
                    <div className="w-full h-px bg-white/5 mb-1" />
                    {session.exercises.map((ex, i) => {
                      const best = getBestWeight(ex);
                      const exKey = `${session.id}-${i}`;
                      const isExExpanded = expandedEx === exKey;
                      const hasSetLogs = !!ex.setLogs?.length;
                      const isPR = isExercisePR(
                        session.id,
                        ex.name,
                        sessionPRs
                      );

                      return (
                        <div
                          key={i}
                          className={`rounded-xl overflow-hidden border transition-all ${
                            isPR
                              ? "border-amber-400/30 bg-amber-400/5"
                              : "border-transparent bg-white/5"
                          }`}
                        >
                          {/* Exercise header */}
                          <button
                            onClick={() => hasSetLogs && toggleEx(exKey)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 ${
                              hasSetLogs ? "cursor-pointer" : "cursor-default"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] font-black text-[#ff6a00] w-4 flex-shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-xs font-bold text-neutral-300 truncate">
                                {ex.name}
                              </span>
                              {isPR && (
                                <span className="flex items-center gap-0.5 text-[8px] font-black text-amber-400 bg-amber-400/15 border border-amber-400/30 px-1 py-0.5 rounded flex-shrink-0">
                                  <Trophy className="w-2 h-2" />
                                  PR
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="text-[10px] text-neutral-500 font-semibold">
                                {ex.sets}×{ex.reps}
                              </span>
                              {best !== null ? (
                                <span
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                    isPR
                                      ? "text-amber-400 bg-amber-400/15"
                                      : "text-[#ff6a00] bg-[#ff6a00]/10"
                                  }`}
                                >
                                  {best} kg
                                </span>
                              ) : (
                                <span className="text-[10px] text-neutral-600 font-semibold">
                                  no weight
                                </span>
                              )}
                              {hasSetLogs && (
                                <span className="text-neutral-600">
                                  {isExExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Per-set detail */}
                          {hasSetLogs && isExExpanded && (
                            <div className="px-3 pb-3 flex flex-col gap-1">
                              <div className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 mb-1">
                                <div />
                                <p className="text-[9px] text-neutral-600 uppercase tracking-wider font-bold text-center">
                                  kg
                                </p>
                                <p className="text-[9px] text-neutral-600 uppercase tracking-wider font-bold text-center">
                                  reps
                                </p>
                                <div />
                              </div>
                              {ex.setLogs!.map((set) => {
                                const setW = parseFloat(set.weight);
                                const isSetPR =
                                  isPR &&
                                  !isNaN(setW) &&
                                  setW === best;
                                return (
                                  <div
                                    key={set.setNumber}
                                    className={`grid grid-cols-[28px_1fr_1fr_28px] gap-2 items-center ${
                                      !set.completed ? "opacity-40" : ""
                                    }`}
                                  >
                                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-black text-neutral-500">
                                      {set.setNumber}
                                    </div>
                                    <div
                                      className={`rounded-lg px-2 py-1.5 text-center ${
                                        isSetPR && set.completed
                                          ? "bg-amber-400/15 border border-amber-400/30"
                                          : "bg-black/20"
                                      }`}
                                    >
                                      <span
                                        className={`text-xs font-black ${
                                          isSetPR && set.completed
                                            ? "text-amber-400"
                                            : "text-white"
                                        }`}
                                      >
                                        {set.weight || "—"}
                                      </span>
                                    </div>
                                    <div className="bg-black/20 rounded-lg px-2 py-1.5 text-center">
                                      <span className="text-xs font-black text-white">
                                        {set.reps || "—"}
                                      </span>
                                    </div>
                                    <div
                                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                        set.completed
                                          ? "bg-emerald-500/20"
                                          : "bg-white/5"
                                      }`}
                                    >
                                      {set.completed && (
                                        <Check
                                          className="w-3 h-3 text-emerald-400"
                                          strokeWidth={3}
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
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