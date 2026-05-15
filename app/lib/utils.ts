import type { ChartPoint, SavedExercise, SavedSession, SprintEntry } from "../types";

// ── Formatting ─────────────────────────────────────────────────────────────────

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function nextId(list: { id: number }[]) {
  return list.length ? Math.max(...list.map((e) => e.id)) + 1 : 1;
}

// ── Session / sprint helpers ───────────────────────────────────────────────────

export function getLastSession(h: SavedSession[]): SavedSession | null {
  return h.length ? h[h.length - 1] : null;
}

export function getLatestSprint(s: SprintEntry[]): SprintEntry | null {
  return s.length ? s[s.length - 1] : null;
}

// ── Weight helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the highest weight logged for an exercise across all its sets.
 * Handles new per-set format and legacy single-weight format.
 */
export function getBestWeight(ex: SavedExercise): number | null {
  if (ex.setLogs && ex.setLogs.length > 0) {
    const weights = ex.setLogs
      .filter((s) => s.completed && s.weight !== "")
      .map((s) => parseFloat(s.weight))
      .filter((n) => !isNaN(n));
    return weights.length ? Math.max(...weights) : null;
  }
  if (ex.weight && ex.weight !== "") {
    const n = parseFloat(ex.weight);
    return isNaN(n) ? null : n;
  }
  return null;
}

// ── 1RM helpers ────────────────────────────────────────────────────────────────

/**
 * Epley formula: weight × (1 + reps / 30)
 * Returns null for invalid inputs or when reps === 1 (actual 1RM, no estimation needed).
 */
export function estimatedOneRM(weight: number, reps: number): number | null {
  if (weight <= 0 || reps <= 0 || isNaN(weight) || isNaN(reps)) return null;
  if (reps === 1) return weight; // actual 1RM
  return weight * (1 + reps / 30);
}

/**
 * Returns the highest estimated 1RM across all completed sets of a saved exercise.
 * Tries new setLogs format first, then falls back to legacy single weight + target reps.
 */
export function getBest1RM(ex: SavedExercise): number | null {
  // New per-set format
  if (ex.setLogs && ex.setLogs.length > 0) {
    const estimates = ex.setLogs
      .filter((s) => s.completed && s.weight !== "" && s.reps !== "")
      .map((s) => {
        const w = parseFloat(s.weight);
        const r = parseInt(s.reps, 10);
        return estimatedOneRM(w, r);
      })
      .filter((v): v is number => v !== null);
    return estimates.length ? Math.max(...estimates) : null;
  }

  // Legacy single weight — use the target reps from the exercise
  if (ex.weight && ex.weight !== "") {
    const w = parseFloat(ex.weight);
    const r = ex.reps; // target reps stored on the exercise
    if (!isNaN(w) && r > 0) return estimatedOneRM(w, r);
  }

  return null;
}

/**
 * Builds a ChartPoint series of the best estimated 1RM per session
 * for a given exercise name. Used in ProgressAnalytics.
 */
export function oneRMSeries(
  history: SavedSession[],
  exerciseName: string
): ChartPoint[] {
  return history
    .map((session) => {
      const ex = session.exercises.find((e) => e.name === exerciseName);
      if (!ex) return null;
      const orm = getBest1RM(ex);
      if (orm === null) return null;
      return { label: shortDate(session.date), value: parseFloat(orm.toFixed(1)) };
    })
    .filter(Boolean) as ChartPoint[];
}

// ── Progressive overload ───────────────────────────────────────────────────────

export function getPreviousData(name: string, last: SavedSession | null) {
  if (!last) return { lastWeight: null, suggested: null };
  const m = last.exercises.find((e) => e.name === name);
  if (!m) return { lastWeight: null, suggested: null };
  const best = getBestWeight(m);
  if (best === null) return { lastWeight: null, suggested: null };
  return {
    lastWeight: String(best),
    suggested: (best + 2.5).toFixed(1).replace(/\.0$/, ""),
  };
}

// ── Chart series ───────────────────────────────────────────────────────────────

export function sprintSeries(
  sprints: SprintEntry[],
  key: keyof Omit<SprintEntry, "id" | "date" | "notes">
): ChartPoint[] {
  return sprints
    .filter((s) => s[key] !== "" && !isNaN(parseFloat(s[key])))
    .map((s) => ({ label: shortDate(s.date), value: parseFloat(s[key]) }));
}

export function gymSeries(
  history: SavedSession[],
  exerciseName: string
): ChartPoint[] {
  return history
    .map((session) => {
      const ex = session.exercises.find((e) => e.name === exerciseName);
      if (!ex) return null;
      const best = getBestWeight(ex);
      if (best === null) return null;
      return { label: shortDate(session.date), value: best };
    })
    .filter(Boolean) as ChartPoint[];
}

export function getStats(data: ChartPoint[], higherIsBetter: boolean) {
  if (!data.length) return { pb: null, latest: null, diff: null };
  const values = data.map((d) => d.value);
  const pb = higherIsBetter ? Math.max(...values) : Math.min(...values);
  const latest = data[data.length - 1].value;
  const diff = parseFloat((latest - data[0].value).toFixed(2));
  return { pb, latest, diff };
}