"use client";

import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Gauge,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { SPRINT_FIELDS, EMPTY_SPRINT } from "../constants";
import type { SprintEntry } from "../types";
import { formatDate } from "../lib/utils";

type Props = {
  sprints: SprintEntry[];
  onSave: (entry: Omit<SprintEntry, "id">) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
};

export default function SprintTracker({ sprints, onSave, onDelete, onBack }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<SprintEntry, "id">>(EMPTY_SPRINT);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...sprints].reverse();

  const handleField = (key: keyof Omit<SprintEntry, "id">, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSave(form);
    setShowForm(false);
    setForm(EMPTY_SPRINT);
  };

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
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">MyGoal22</p>
          <h1 className="text-lg font-black tracking-tight">Sprint Tracker</h1>
        </div>
        {sprints.length > 0 && (
          <div className="bg-[#ff6a00]/10 px-2.5 py-1 rounded-full">
            <span className="text-xs font-black text-[#ff6a00]">{sprints.length}</span>
          </div>
        )}
      </header>

      {!showForm && (
        <div className="px-5 mb-5">
          <button
            onClick={() => { setShowForm(true); setForm(EMPTY_SPRINT); }}
            className="w-full bg-[#ff6a00] hover:bg-[#ff7a1a] active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff6a00]/20"
          >
            <Plus className="w-4 h-4" />
            Log Sprint Session
          </button>
        </div>
      )}

      {showForm && (
        <div className="mx-5 mb-5 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6a00] via-[#ee0979] to-transparent" />
          <div className="p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-4">
              New Sprint Entry
            </p>

            <div className="mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1.5">
                Date
              </p>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleField("date", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-[#ff6a00]/50 transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {SPRINT_FIELDS.map(({ key, label, unit }) => (
                <div key={key}>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1.5">
                    {label}
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="—"
                      value={form[key]}
                      onChange={(e) => handleField(key, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-[#ff6a00]/50 transition-colors placeholder-neutral-600 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-600 font-bold">
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1.5">
                Notes
              </p>
              <textarea
                value={form.notes}
                onChange={(e) => handleField("notes", e.target.value)}
                placeholder="Conditions, feel, observations..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#ff6a00]/50 transition-colors placeholder-neutral-600 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#ff6a00] hover:bg-[#ff7a1a] active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff6a00]/20"
              >
                <Save className="w-4 h-4" />
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {sorted.length === 0 && !showForm ? (
        <div className="mx-5 mt-6 rounded-2xl bg-[#111111] border border-white/10 p-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Gauge className="w-7 h-7 text-neutral-600" />
          </div>
          <p className="text-base font-black text-neutral-400">No sprint data yet</p>
          <p className="text-xs text-neutral-600 mt-1 font-semibold">
            Log your first sprint session above.
          </p>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-3">
          {sorted.map((sprint, index) => {
            const isExpanded = expanded === sprint.id;
            const filledFields = SPRINT_FIELDS.filter((f) => sprint[f.key]);
            return (
              <div
                key={sprint.id}
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
                          {formatDate(sprint.date)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {sprint.topSpeed && (
                          <span className="text-[10px] font-black text-[#ff6a00] bg-[#ff6a00]/10 px-2 py-0.5 rounded-md">
                            {sprint.topSpeed} km/h
                          </span>
                        )}
                        {sprint.time10m && (
                          <span className="text-[10px] font-bold text-neutral-300 bg-white/5 px-2 py-0.5 rounded-md">
                            10m: {sprint.time10m}s
                          </span>
                        )}
                        {sprint.time60m && (
                          <span className="text-[10px] font-bold text-neutral-300 bg-white/5 px-2 py-0.5 rounded-md">
                            60m: {sprint.time60m}s
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(sprint.id)}
                      className="ml-3 w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>

                  <button
                    onClick={() => setExpanded(isExpanded ? null : sprint.id)}
                    className="w-full flex items-center justify-between bg-white/5 active:scale-[0.99] transition-all rounded-xl px-3 py-2.5 mt-2"
                  >
                    <span className="text-[11px] font-bold text-neutral-400">
                      {isExpanded ? "Hide details" : `Show all ${filledFields.length} metrics`}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="w-full h-px bg-white/5 mb-3" />
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {SPRINT_FIELDS.map(({ key, label, unit, icon: Icon }) =>
                        sprint[key] ? (
                          <div key={key} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Icon className="w-3 h-3 text-[#ff6a00]" />
                              <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                                {label}
                              </p>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-white">{sprint[key]}</span>
                              <span className="text-[10px] text-neutral-500">{unit}</span>
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                    {sprint.notes && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText className="w-3 h-3 text-neutral-500" />
                          <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                            Notes
                          </p>
                        </div>
                        <p className="text-xs text-neutral-300 font-semibold leading-relaxed">
                          {sprint.notes}
                        </p>
                      </div>
                    )}
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