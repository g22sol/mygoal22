"use client";

import {
  ArrowLeft,
  Check,
  ChevronUp,
  ChevronDown,
  Plus,
  Save,
  Settings2,
  Trash2,
  Layers,
} from "lucide-react";
import type { ExerciseTemplate } from "../types";

const SUPERSET_OPTIONS = ["None", "A", "B", "C", "D"] as const;
type SupersetOption = (typeof SUPERSET_OPTIONS)[number];

type Props = {
  draft: ExerciseTemplate[];
  saved: boolean;
  onDraftChange: (
    id: number,
    field: keyof ExerciseTemplate,
    value: string | number | null
  ) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onSave: () => void;
  onBack: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

// ── Stepper ────────────────────────────────────────────────────────────────────

function Stepper({
  label,
  value,
  onChange,
  min = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1.5 px-1">
        {label}
      </p>
      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all text-lg font-black flex-shrink-0 active:scale-90"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) onChange(Math.max(min, v));
          }}
          className="flex-1 bg-transparent text-center text-sm font-black text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none py-2"
        />
        <button
          onClick={() => onChange(value + 1)}
          className="w-9 h-10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all text-lg font-black flex-shrink-0 active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TemplateEditor({
  draft,
  saved,
  onDraftChange,
  onAdd,
  onRemove,
  onSave,
  onBack,
  onReorder,
}: Props) {
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
            Workout Template
          </p>
          <h1 className="text-lg font-black tracking-tight">Manage Exercises</h1>
        </div>
      </header>

      {/* Info banner */}
      <div className="mx-5 mb-5 flex items-center gap-2 bg-[#ff6a00]/5 border border-[#ff6a00]/20 rounded-xl px-3 py-2.5">
        <Settings2 className="w-3.5 h-3.5 text-[#ff6a00] flex-shrink-0" />
        <p className="text-[11px] text-[#ff6a00] font-semibold">
          Changes apply to your next workout session.
        </p>
      </div>

      {/* Exercise list */}
      <div className="px-5 flex flex-col gap-3">
        {draft.length === 0 && (
          <div className="text-center py-10 text-neutral-600 text-sm font-semibold">
            No exercises. Add one below.
          </div>
        )}

        {draft.map((ex, index) => {
          const currentGroup =
            ex.supersetGroup == null
              ? "None"
              : (ex.supersetGroup as SupersetOption);

          const isFirst = index === 0;
          const isLast = index === draft.length - 1;

          return (
            <div
              key={ex.id}
              className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden relative"
            >
              {/* Superset colour strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] ${
                  ex.supersetGroup === "A"
                    ? "bg-purple-500"
                    : ex.supersetGroup === "B"
                    ? "bg-sky-500"
                    : ex.supersetGroup === "C"
                    ? "bg-emerald-500"
                    : ex.supersetGroup === "D"
                    ? "bg-pink-500"
                    : "bg-gradient-to-r from-[#ff6a00] to-transparent"
                }`}
              />

              <div className="p-4">
                {/* Row: reorder + index + name + delete */}
                <div className="flex items-center gap-2 mb-3">

                  {/* Move up / down buttons */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => onReorder(index, index - 1)}
                      disabled={isFirst}
                      className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white text-neutral-500"
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onReorder(index, index + 1)}
                      disabled={isLast}
                      className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white text-neutral-500"
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Index badge */}
                  <div className="w-7 h-7 rounded-lg bg-[#ff6a00]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-black text-[#ff6a00]">
                      {index + 1}
                    </span>
                  </div>

                  {/* Name input */}
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) =>
                      onDraftChange(ex.id, "name", e.target.value)
                    }
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-[#ff6a00]/50 transition-colors placeholder-neutral-600"
                    placeholder="Exercise name"
                  />

                  {/* Delete */}
                  <button
                    onClick={() => onRemove(ex.id)}
                    className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>

                {/* Sets + Reps steppers */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Stepper
                    label="Sets"
                    value={ex.sets}
                    onChange={(v) => onDraftChange(ex.id, "sets", v)}
                  />
                  <Stepper
                    label="Reps"
                    value={ex.reps}
                    onChange={(v) => onDraftChange(ex.id, "reps", v)}
                  />
                </div>

                {/* Superset group selector */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Layers className="w-3 h-3 text-neutral-600" />
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                      Superset Group
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {SUPERSET_OPTIONS.map((opt) => {
                      const active = currentGroup === opt;
                      const colorMap: Record<SupersetOption, string> = {
                        None: active
                          ? "bg-white/10 text-white border-white/20"
                          : "bg-white/5 text-neutral-600 border-transparent hover:text-neutral-400",
                        A: active
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                          : "bg-white/5 text-neutral-600 border-transparent hover:text-purple-400",
                        B: active
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                          : "bg-white/5 text-neutral-600 border-transparent hover:text-sky-400",
                        C: active
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-white/5 text-neutral-600 border-transparent hover:text-emerald-400",
                        D: active
                          ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                          : "bg-white/5 text-neutral-600 border-transparent hover:text-pink-400",
                      };
                      return (
                        <button
                          key={opt}
                          onClick={() =>
                            onDraftChange(
                              ex.id,
                              "supersetGroup",
                              opt === "None" ? null : opt
                            )
                          }
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 border ${colorMap[opt]}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add exercise */}
      <div className="px-5 mt-3">
        <button
          onClick={onAdd}
          className="w-full bg-white/5 border border-dashed border-white/20 hover:border-[#ff6a00]/40 hover:bg-[#ff6a00]/5 active:scale-[0.98] transition-all rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-2 text-neutral-400 hover:text-[#ff6a00]"
        >
          <Plus className="w-4 h-4" />
          Add Exercise
        </button>
      </div>

      {/* Save */}
      <div className="px-5 mt-4 flex flex-col gap-3">
        <button
          onClick={onSave}
          className={`w-full rounded-xl py-4 font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
            saved
              ? "bg-emerald-600 shadow-emerald-900/30"
              : "bg-[#ff6a00] hover:bg-[#ff7a1a] shadow-[#ff6a00]/20"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" strokeWidth={3} />
              Template Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Template
            </>
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