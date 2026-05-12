"use client";

import { ArrowLeft, Check, Plus, Save, Settings2, Trash2 } from "lucide-react";
import type { ExerciseTemplate } from "../types";
import { nextId } from "../lib/utils";

type Props = {
  draft: ExerciseTemplate[];
  saved: boolean;
  onDraftChange: (id: number, field: keyof ExerciseTemplate, value: string | number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onSave: () => void;
  onBack: () => void;
};

export default function TemplateEditor({
  draft,
  saved,
  onDraftChange,
  onAdd,
  onRemove,
  onSave,
  onBack,
}: Props) {
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
            Workout Template
          </p>
          <h1 className="text-lg font-black tracking-tight">Manage Exercises</h1>
        </div>
      </header>

      <div className="mx-5 mb-5 flex items-center gap-2 bg-[#ff6a00]/5 border border-[#ff6a00]/20 rounded-xl px-3 py-2.5">
        <Settings2 className="w-3.5 h-3.5 text-[#ff6a00] flex-shrink-0" />
        <p className="text-[11px] text-[#ff6a00] font-semibold">
          Changes apply to your next workout session.
        </p>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {draft.length === 0 && (
          <div className="text-center py-10 text-neutral-600 text-sm font-semibold">
            No exercises. Add one below.
          </div>
        )}
        {draft.map((ex, index) => (
          <div
            key={ex.id}
            className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6a00] to-transparent" />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#ff6a00]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-black text-[#ff6a00]">{index + 1}</span>
                </div>
                <input
                  type="text"
                  value={ex.name}
                  onChange={(e) => onDraftChange(ex.id, "name", e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-[#ff6a00]/50 transition-colors placeholder-neutral-600"
                  placeholder="Exercise name"
                />
                <button
                  onClick={() => onRemove(ex.id)}
                  className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["sets", "reps"] as const).map((field) => (
                  <div key={field}>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1.5 px-1">
                      {field}
                    </p>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          onDraftChange(ex.id, field, Math.max(1, ex[field] - 1))
                        }
                        className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all text-lg font-black flex-shrink-0"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={ex[field]}
                        onChange={(e) =>
                          onDraftChange(ex.id, field, parseInt(e.target.value) || 1)
                        }
                        className="flex-1 bg-transparent text-center text-sm font-black text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => onDraftChange(ex.id, field, ex[field] + 1)}
                        className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all text-lg font-black flex-shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 mt-3">
        <button
          onClick={onAdd}
          className="w-full bg-white/5 border border-dashed border-white/20 hover:border-[#ff6a00]/40 hover:bg-[#ff6a00]/5 active:scale-[0.98] transition-all rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-2 text-neutral-400 hover:text-[#ff6a00]"
        >
          <Plus className="w-4 h-4" />
          Add Exercise
        </button>
      </div>

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