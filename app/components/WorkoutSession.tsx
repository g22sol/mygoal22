"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Flag,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { Exercise, SavedSession } from "../types";
import { getPreviousData } from "../lib/utils";

type Props = {
  exercises: Exercise[];
  lastSession: SavedSession | null;
  onBack: () => void;
  onWeightChange: (id: number, value: string) => void;
  onUseSuggested: (id: number, suggested: string) => void;
  onCompleteExercise: (id: number) => void;
  onFinishSession: () => void;
};

export default function WorkoutSession({
  exercises,
  lastSession,
  onBack,
  onWeightChange,
  onUseSuggested,
  onCompleteExercise,
  onFinishSession,
}: Props) {
  const completedCount = exercises.filter((e) => e.completed).length;
  const allDone = exercises.length > 0 && completedCount === exercises.length;
  const hasPreviousData = lastSession?.exercises.some((e) => e.weight) ?? false;

  return (
    <div className="w-full max-w-md min-h-screen pb-10">

      <header className="px-5 pt-10 pb-5 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
            Active Session
          </p>
          <h1 className="text-lg font-black tracking-tight">Acceleration + Lowers</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500 font-semibold">Done</p>
          <p className="text-lg font-black text-[#ff6a00]">
            {completedCount}
            <span className="text-neutral-600">/{exercises.length}</span>
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="mx-5 mb-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full transition-all duration-500"
          style={{
            width: `${exercises.length ? (completedCount / exercises.length) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Overload banner */}
      <div className="mx-5 mb-5 mt-3">
        {hasPreviousData ? (
          <div className="flex items-center gap-2 bg-[#ff6a00]/5 border border-[#ff6a00]/20 rounded-xl px-3 py-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#ff6a00] flex-shrink-0" />
            <p className="text-[11px] font-semibold text-[#ff6a00]">
              Progressive overload suggestions loaded from last session.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <TrendingUp className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
            <p className="text-[11px] font-semibold text-neutral-500">
              No previous data — enter your weights below.
            </p>
          </div>
        )}
      </div>

      {/* Exercise cards */}
      <div className="px-5 flex flex-col gap-4">
        {exercises.map((exercise) => {
          const { lastWeight, suggested } = getPreviousData(exercise.name, lastSession);
          return (
            <div
              key={exercise.id}
              className={`rounded-2xl border overflow-hidden relative transition-all duration-300 ${
                exercise.completed
                  ? "bg-emerald-950/40 border-emerald-500/30"
                  : "bg-[#111111] border-white/10"
              }`}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] ${
                  exercise.completed
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-[#ff6a00] to-transparent"
                }`}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3
                    className={`text-base font-black leading-tight ${
                      exercise.completed ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {exercise.name}
                  </h3>
                  {exercise.completed && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Overload hint */}
                <div className="flex items-center gap-3 mb-4">
                  {lastWeight ? (
                    <>
                      <span className="text-[10px] text-neutral-500 font-semibold">
                        Last:{" "}
                        <span className="text-neutral-300">{lastWeight} kg</span>
                      </span>
                      <span className="text-neutral-700 text-[10px]">→</span>
                      <span className="text-[10px] text-[#ff6a00] font-bold">
                        Suggested: {suggested} kg
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-neutral-600 font-semibold italic">
                      No previous data
                    </span>
                  )}
                </div>

                {/* Sets / Reps / Weight */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
                      Sets
                    </p>
                    <p className="text-xl font-black">{exercise.sets}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
                      Reps
                    </p>
                    <p className="text-xl font-black">{exercise.reps}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
                      Weight
                    </p>
                    <input
                      type="number"
                      min="0"
                      placeholder="—"
                      value={exercise.weight}
                      onChange={(e) => onWeightChange(exercise.id, e.target.value)}
                      disabled={exercise.completed}
                      className="w-full bg-transparent text-xl font-black text-white text-center outline-none placeholder-neutral-600 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <p className="text-[9px] text-neutral-600 font-semibold mt-0.5">kg</p>
                  </div>
                </div>

                {/* Use suggested */}
                {!exercise.completed && suggested && (
                  <button
                    onClick={() => onUseSuggested(exercise.id, suggested)}
                    className="w-full mb-3 bg-[#ff6a00]/10 border border-[#ff6a00]/30 hover:bg-[#ff6a00]/20 active:scale-[0.98] transition-all rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-1.5 text-[#ff6a00]"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Use Suggested — {suggested} kg
                  </button>
                )}

                {!exercise.completed ? (
                  <button
                    onClick={() => onCompleteExercise(exercise.id)}
                    className="w-full bg-[#ff6a00] hover:bg-[#ff7a1a] active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff6a00]/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Exercise
                  </button>
                ) : (
                  <div className="w-full bg-emerald-600/20 border border-emerald-500/30 rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 text-emerald-400">
                    <Check className="w-4 h-4" strokeWidth={3} />
                    Exercise Complete
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish */}
      {allDone && (
        <div className="px-5 mt-5">
          <div className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-lg font-black">All exercises done!</p>
              <p className="text-neutral-500 text-sm mt-1 mb-5">
                Save this session to your workout history.
              </p>
              <button
                onClick={onFinishSession}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all rounded-xl py-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
              >
                <Flag className="w-4 h-4" />
                Finish &amp; Save Session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 mt-4">
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