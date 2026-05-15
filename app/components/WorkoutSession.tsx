"use client";

import {
  ArrowLeft,
  Check,
  Flag,
  TrendingUp,
  Trophy,
  Timer,
  Play,
  Pause,
  RotateCcw,
  X,
  RotateCcw as DiscardIcon,
  AlertCircle,
  Layers,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import type {
  ExerciseTemplate,
  SavedSession,
  SavedExercise,
  SetLog,
} from "../types";
import { getPreviousData } from "../lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type LiveSet = {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
};

type LiveExercise = {
  id: number;
  name: string;
  targetSets: number;
  targetReps: number;
  supersetGroup: string | null;
  sets: LiveSet[];
  collapsed: boolean;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const REST_OPTIONS = [60, 90, 120, 180] as const;
type RestOption = (typeof REST_OPTIONS)[number];
const AUTOSAVE_KEY = "mygoal22_autosave_session";

// ── Superset colours ───────────────────────────────────────────────────────────

const SUPERSET_COLORS: Record<string, { border: string; bg: string; text: string; bar: string }> = {
  A: {
    border: "border-purple-500/50",
    bg: "bg-purple-500/5",
    text: "text-purple-400",
    bar: "bg-purple-500",
  },
  B: {
    border: "border-sky-500/50",
    bg: "bg-sky-500/5",
    text: "text-sky-400",
    bar: "bg-sky-500",
  },
  C: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  D: {
    border: "border-pink-500/50",
    bg: "bg-pink-500/5",
    text: "text-pink-400",
    bar: "bg-pink-500",
  },
};

function getSupersetColor(group: string | null) {
  if (!group || !SUPERSET_COLORS[group]) return null;
  return SUPERSET_COLORS[group];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildLiveSets(
  targetSets: number,
  targetReps: number,
  suggestedWeight: string | null
): LiveSet[] {
  return Array.from({ length: targetSets }, (_, i) => ({
    setNumber: i + 1,
    weight: suggestedWeight ?? "",
    reps: String(targetReps),
    completed: false,
  }));
}

function buildLiveExercises(
  template: ExerciseTemplate[],
  lastSession: SavedSession | null
): LiveExercise[] {
  return template.map((ex) => {
    const { suggested } = getPreviousData(ex.name, lastSession);
    return {
      id: ex.id,
      name: ex.name,
      targetSets: ex.sets,
      targetReps: ex.reps,
      supersetGroup: ex.supersetGroup ?? null,
      sets: buildLiveSets(ex.sets, ex.reps, suggested),
      collapsed: false,
    };
  });
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ── Autosave ───────────────────────────────────────────────────────────────────

type AutosavePayload = {
  templateSnapshot: { id: number; name: string }[];
  exercises: LiveExercise[];
  savedAt: string;
};

function readAutosave(): AutosavePayload | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? (JSON.parse(raw) as AutosavePayload) : null;
  } catch { return null; }
}

function writeAutosave(template: ExerciseTemplate[], exercises: LiveExercise[]) {
  try {
    localStorage.setItem(
      AUTOSAVE_KEY,
      JSON.stringify({
        templateSnapshot: template.map(({ id, name }) => ({ id, name })),
        exercises,
        savedAt: new Date().toISOString(),
      } satisfies AutosavePayload)
    );
  } catch {}
}

function clearAutosave() {
  try { localStorage.removeItem(AUTOSAVE_KEY); } catch {}
}

function snapshotMatchesTemplate(
  snap: AutosavePayload["templateSnapshot"],
  tpl: ExerciseTemplate[]
): boolean {
  return (
    snap.length === tpl.length &&
    snap.every((s, i) => s.id === tpl[i].id && s.name === tpl[i].name)
  );
}

// ── Rest Timer ─────────────────────────────────────────────────────────────────

function RestTimer({
  defaultDuration,
  onDurationChange,
  triggerKey,
  onDismiss,
}: {
  defaultDuration: RestOption;
  onDurationChange: (d: RestOption) => void;
  triggerKey: number;
  onDismiss: () => void;
}) {
  const [duration, setDuration] = useState<RestOption>(defaultDuration);
  const [remaining, setRemaining] = useState(defaultDuration);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (triggerKey === 0) return;
    setRemaining(duration);
    setFinished(false);
    setRunning(true);
  }, [triggerKey]); // eslint-disable-line

  useEffect(() => {
    if (running) {
      iv.current = setInterval(() => {
        setRemaining((p) => {
          if (p <= 1) { clearInterval(iv.current!); setRunning(false); setFinished(true); return 0; }
          return p - 1;
        });
      }, 1000);
    } else clearInterval(iv.current!);
    return () => clearInterval(iv.current!);
  }, [running]);

  const changeDuration = (d: RestOption) => {
    setDuration(d); onDurationChange(d); setRemaining(d); setRunning(false); setFinished(false);
  };
  const reset = () => { setRemaining(duration); setRunning(false); setFinished(false); };

  const size = 100, sw = 7, r = (size - sw) / 2, circ = 2 * Math.PI * r;

  return (
    <div className={`mx-5 mb-4 rounded-2xl border overflow-hidden relative transition-all duration-300 ${finished ? "bg-emerald-950/40 border-emerald-500/30" : "bg-[#111111] border-white/10"}`}>
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${finished ? "bg-emerald-500" : running ? "bg-gradient-to-r from-[#ff6a00] via-[#ee0979] to-transparent animate-pulse" : "bg-gradient-to-r from-[#ff6a00] to-transparent"}`} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${finished ? "text-emerald-400" : "text-[#ff6a00]"}`} />
            <p className="text-xs font-black uppercase tracking-widest text-white">Rest Timer</p>
            {running && <span className="text-[9px] font-black text-[#ff6a00] bg-[#ff6a00]/10 px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Active</span>}
            {finished && <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Done</span>}
          </div>
          <button onClick={onDismiss} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-3 h-3 text-neutral-500" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f1f1f" strokeWidth={sw} />
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={finished ? "#10b981" : "#ff6a00"} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - remaining / duration)} style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-black tabular-nums ${finished ? "text-emerald-400" : "text-white"}`}>{formatTime(remaining)}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => { if (finished) { reset(); setRunning(true); setFinished(false); return; } setRunning((r) => !r); }}
                className={`flex-1 rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] ${running ? "bg-white/10 border border-white/10 text-white" : "bg-[#ff6a00] text-white shadow-lg shadow-[#ff6a00]/20"}`}
              >
                {running ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />{finished ? "Restart" : remaining === duration ? "Start" : "Resume"}</>}
              </button>
              <button onClick={reset} className="w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-[0.97] transition-all">
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
            <div>
              <p className="text-[9px] text-neutral-600 uppercase tracking-wider font-bold mb-1.5">Rest duration</p>
              <div className="flex gap-1.5">
                {REST_OPTIONS.map((opt) => (
                  <button key={opt} onClick={() => changeDuration(opt)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 ${duration === opt ? "bg-[#ff6a00] text-white" : "bg-white/5 text-neutral-500 hover:text-neutral-300"}`}>
                    {opt >= 60 ? `${opt / 60}m` : `${opt}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {finished && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-center">
            <p className="text-xs font-black text-emerald-400">Rest complete — start your next set!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = {
  template: ExerciseTemplate[];
  lastSession: SavedSession | null;
  onBack: () => void;
  onFinishSession: (exercises: SavedExercise[]) => void;
};

// ── Main ───────────────────────────────────────────────────────────────────────

export default function WorkoutSession({ template, lastSession, onBack, onFinishSession }: Props) {
  const [liveExercises, setLiveExercises] = useState<LiveExercise[]>([]);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [restTrigger, setRestTrigger] = useState(0);
  const [restDuration, setRestDuration] = useState<RestOption>(90);
  const [showTimer, setShowTimer] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const saved = readAutosave();
    if (saved && snapshotMatchesTemplate(saved.templateSnapshot, template)) {
      setLiveExercises(saved.exercises);
      setShowRestoreBanner(true);
    } else {
      setLiveExercises(buildLiveExercises(template, lastSession));
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (liveExercises.length === 0) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    writeAutosave(template, liveExercises);
  }, [liveExercises]); // eslint-disable-line

  const handleDiscard = () => {
    clearAutosave();
    setLiveExercises(buildLiveExercises(template, lastSession));
    setShowRestoreBanner(false);
    isFirstRender.current = true;
  };

  const updateSet = (exId: number, setNum: number, field: "weight" | "reps", value: string) =>
    setLiveExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => s.setNumber === setNum ? { ...s, [field]: value } : s) }
      )
    );

  const toggleSetComplete = useCallback((exId: number, setNum: number) => {
    setLiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const wasCompleted = ex.sets.find((s) => s.setNumber === setNum)?.completed;
        const sets = ex.sets.map((s) => s.setNumber === setNum ? { ...s, completed: !s.completed } : s);
        if (!wasCompleted) { setShowTimer(true); setRestTrigger((t) => t + 1); }
        return { ...ex, sets };
      })
    );
  }, []);

  const fillAllSets = (exId: number, weight: string) =>
    setLiveExercises((prev) =>
      prev.map((ex) => ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => ({ ...s, weight })) })
    );

  const toggleCollapse = (exId: number) =>
    setLiveExercises((prev) =>
      prev.map((ex) => ex.id === exId ? { ...ex, collapsed: !ex.collapsed } : ex)
    );

  const totalSets = liveExercises.reduce((n, ex) => n + ex.sets.length, 0);
  const completedSets = liveExercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0);
  const allDone = totalSets > 0 && completedSets === totalSets;

  const hasPreviousData = lastSession?.exercises.some((e) => e.setLogs ? e.setLogs.some((s) => s.weight !== "") : !!e.weight) ?? false;

  const handleFinish = () => {
    clearAutosave();
    onFinishSession(
      liveExercises.map((ex) => ({
        name: ex.name,
        sets: ex.targetSets,
        reps: ex.targetReps,
        supersetGroup: ex.supersetGroup,
        setLogs: ex.sets.map((s): SetLog => ({
          setNumber: s.setNumber, weight: s.weight, reps: s.reps, completed: s.completed,
        })),
      }))
    );
  };

  // ── Group superset runs ────────────────────────────────────────────────────

  type GroupedItem =
    | { type: "single"; exercise: LiveExercise; index: number }
    | { type: "superset"; group: string; exercises: { ex: LiveExercise; index: number }[] };

  const grouped: GroupedItem[] = [];
  let i = 0;
  while (i < liveExercises.length) {
    const ex = liveExercises[i];
    if (!ex.supersetGroup) {
      grouped.push({ type: "single", exercise: ex, index: i });
      i++;
    } else {
      const group = ex.supersetGroup;
      const members: { ex: LiveExercise; index: number }[] = [];
      while (i < liveExercises.length && liveExercises[i].supersetGroup === group) {
        members.push({ ex: liveExercises[i], index: i });
        i++;
      }
      grouped.push({ type: "superset", group, exercises: members });
    }
  }

  // ── Exercise card renderer ─────────────────────────────────────────────────

  const renderExerciseCard = (ex: LiveExercise, globalIndex: number, inSuperset: boolean, isLast: boolean) => {
    const exCompleted = ex.sets.every((s) => s.completed);
    const exCompletedCount = ex.sets.filter((s) => s.completed).length;
    const { lastWeight, suggested } = getPreviousData(ex.name, lastSession);
    const sc = getSupersetColor(ex.supersetGroup);

    return (
      <div
        key={ex.id}
        className={`rounded-2xl border overflow-hidden relative transition-all duration-300 ${
          exCompleted
            ? "bg-emerald-950/40 border-emerald-500/30"
            : inSuperset && sc
            ? `${sc.bg} ${sc.border}`
            : "bg-[#111111] border-white/10"
        }`}
      >
        {/* Top accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${
            exCompleted
              ? "bg-emerald-500"
              : inSuperset && sc
              ? sc.bar
              : "bg-gradient-to-r from-[#ff6a00] to-transparent"
          }`}
        />

        {/* Header */}
        <button
          onClick={() => toggleCollapse(ex.id)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-black leading-tight ${exCompleted ? "text-emerald-400" : "text-white"}`}>
              {ex.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] text-neutral-500 font-semibold">
                {ex.targetSets} sets × {ex.targetReps} reps
              </span>
              {lastWeight && (
                <>
                  <span className="text-neutral-700 text-[10px]">·</span>
                  <span className="text-[10px] text-neutral-500 font-semibold">
                    Last: <span className="text-neutral-300">{lastWeight} kg</span>
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${exCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-neutral-400"}`}>
              {exCompletedCount}/{ex.sets.length}
            </span>
            {exCompleted && (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            )}
            <span className="text-neutral-600 text-[10px]">{ex.collapsed ? "▼" : "▲"}</span>
          </div>
        </button>

        {/* Sets */}
        {!ex.collapsed && (
          <div className="px-4 pb-4">
            {suggested && !exCompleted && (
              <button
                onClick={() => fillAllSets(ex.id, suggested)}
                className="w-full mb-3 bg-[#ff6a00]/10 border border-[#ff6a00]/30 hover:bg-[#ff6a00]/20 active:scale-[0.98] transition-all rounded-xl py-2 font-black text-xs flex items-center justify-center gap-1.5 text-[#ff6a00]"
              >
                <TrendingUp className="w-3 h-3" />
                Fill all sets with suggested {suggested} kg
              </button>
            )}

            <div className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 mb-1.5 px-1">
              <div />
              <p className="text-[9px] text-neutral-600 uppercase tracking-wider font-bold text-center">kg</p>
              <p className="text-[9px] text-neutral-600 uppercase tracking-wider font-bold text-center">reps</p>
              <div />
            </div>

            {ex.sets.map((set) => (
              <div
                key={set.setNumber}
                className={`grid grid-cols-[32px_1fr_1fr_40px] gap-2 mb-2 items-center transition-opacity ${set.completed ? "opacity-55" : ""}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${set.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-neutral-400"}`}>
                  {set.setNumber}
                </div>
                <input
                  type="number" min="0" step="0.5" placeholder="—"
                  value={set.weight}
                  onChange={(e) => updateSet(ex.id, set.setNumber, "weight", e.target.value)}
                  disabled={set.completed}
                  className={`w-full rounded-xl px-2 py-2.5 text-sm font-black text-white text-center outline-none placeholder-neutral-700 transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${set.completed ? "bg-white/5 border border-white/5" : "bg-white/5 border border-white/10 focus:border-[#ff6a00]/40"}`}
                />
                <input
                  type="number" min="0" placeholder="—"
                  value={set.reps}
                  onChange={(e) => updateSet(ex.id, set.setNumber, "reps", e.target.value)}
                  disabled={set.completed}
                  className={`w-full rounded-xl px-2 py-2.5 text-sm font-black text-white text-center outline-none placeholder-neutral-700 transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${set.completed ? "bg-white/5 border border-white/5" : "bg-white/5 border border-white/10 focus:border-[#ff6a00]/40"}`}
                />
                <button
                  onClick={() => toggleSetComplete(ex.id, set.setNumber)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${set.completed ? "bg-emerald-500 shadow-lg shadow-emerald-900/40" : "bg-white/5 border border-white/10 hover:border-[#ff6a00]/40"}`}
                >
                  <Check className={`w-4 h-4 ${set.completed ? "text-white" : "text-neutral-600"}`} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-md min-h-screen pb-10">

      {/* Header */}
      <header className="px-5 pt-10 pb-5 flex items-center gap-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Active Session</p>
          <h1 className="text-lg font-black tracking-tight">Acceleration + Lowers</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500 font-semibold">Sets</p>
          <p className="text-lg font-black text-[#ff6a00]">{completedSets}<span className="text-neutral-600">/{totalSets}</span></p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="mx-5 mb-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full transition-all duration-500" style={{ width: `${totalSets ? (completedSets / totalSets) * 100 : 0}%` }} />
      </div>

      {/* Restore banner */}
      {showRestoreBanner && (
        <div className="mx-5 mb-4 rounded-2xl bg-[#111111] border border-[#ff6a00]/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6a00] to-transparent" />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ff6a00]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-[#ff6a00]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">Unfinished session restored</p>
                <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">Your last session was automatically saved. Continue where you left off, or start fresh.</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowRestoreBanner(false)} className="flex-1 bg-[#ff6a00] hover:bg-[#ff7a1a] active:scale-[0.98] transition-all rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#ff6a00]/20">
                    <Play className="w-3 h-3" />Continue
                  </button>
                  <button onClick={handleDiscard} className="flex-1 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 active:scale-[0.98] transition-all rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-1.5 text-neutral-400 hover:text-red-400">
                    <DiscardIcon className="w-3 h-3" />Discard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer */}
      {showTimer && (
        <RestTimer
          defaultDuration={restDuration}
          onDurationChange={setRestDuration}
          triggerKey={restTrigger}
          onDismiss={() => setShowTimer(false)}
        />
      )}

      {!showTimer && completedSets > 0 && (
        <div className="mx-5 mb-4">
          <button onClick={() => setShowTimer(true)} className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/8 active:scale-[0.98] transition-all rounded-xl py-2.5 text-xs font-bold text-neutral-500">
            <Timer className="w-3.5 h-3.5" />Show rest timer
          </button>
        </div>
      )}

      {/* Overload banner */}
      <div className="mx-5 mb-5">
        {hasPreviousData ? (
          <div className="flex items-center gap-2 bg-[#ff6a00]/5 border border-[#ff6a00]/20 rounded-xl px-3 py-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#ff6a00] flex-shrink-0" />
            <p className="text-[11px] font-semibold text-[#ff6a00]">Weights pre-filled from last session +2.5 kg.</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <TrendingUp className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
            <p className="text-[11px] font-semibold text-neutral-500">No previous data — enter your weights below.</p>
          </div>
        )}
      </div>

      {/* Grouped exercise cards */}
      <div className="px-5 flex flex-col gap-4">
        {grouped.map((item, gi) => {
          if (item.type === "single") {
            return renderExerciseCard(item.exercise, item.index, false, true);
          }

          // Superset block
          const sc = getSupersetColor(item.group)!;
          return (
            <div key={`superset-${item.group}-${gi}`} className="flex flex-col">
              {/* Superset label */}
              <div className={`flex items-center gap-2 mb-2 px-1`}>
                <Layers className={`w-3.5 h-3.5 ${sc.text}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${sc.text}`}>
                  Superset {item.group}
                </span>
                <div className={`flex-1 h-px ${sc.bar} opacity-30`} />
              </div>

              {/* Connected exercises */}
              <div className="flex">
                {/* Vertical connection bar */}
                <div className="flex flex-col items-center mr-3 flex-shrink-0">
                  <div className={`w-0.5 flex-1 ${sc.bar} opacity-40 rounded-full`} />
                </div>

                {/* Exercise cards */}
                <div className="flex-1 flex flex-col gap-2">
                  {item.exercises.map(({ ex, index }, idx) =>
                    renderExerciseCard(ex, index, true, idx === item.exercises.length - 1)
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish session */}
      {allDone && (
        <div className="px-5 mt-5">
          <div className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-lg font-black">All sets done!</p>
              <p className="text-neutral-500 text-sm mt-1 mb-5">Save this session to your workout history.</p>
              <button onClick={handleFinish} className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all rounded-xl py-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40">
                <Flag className="w-4 h-4" />Finish &amp; Save Session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 mt-4">
        <button onClick={onBack} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 text-neutral-400">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </button>
      </div>
    </div>
  );
}