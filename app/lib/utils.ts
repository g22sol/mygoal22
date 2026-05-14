import type { ChartPoint, SavedExercise, SavedSession, SprintEntry } from "../types";

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

export function getLastSession(h: SavedSession[]): SavedSession | null {
  return h.length ? h[h.length - 1] : null;
}

export function getLatestSprint(s: SprintEntry[]): SprintEntry | null {
  return s.length ? s[s.length - 1] : null;
}

/**
 * Get the best (heaviest) weight logged for an exercise across all its sets.
 * Handles both new per-set format and legacy single-weight format.
 */
export function getBestWeight(ex: SavedExercise): number | null {
  // New format — per-set logs
  if (ex.setLogs && ex.setLogs.length > 0) {
    const weights = ex.setLogs
      .filter((s) => s.completed && s.weight !== "")
      .map((s) => parseFloat(s.weight))
      .filter((n) => !isNaN(n));
    return weights.length ? Math.max(...weights) : null;
  }
  // Legacy format — single weight string
  if (ex.weight && ex.weight !== "") {
    const n = parseFloat(ex.weight);
    return isNaN(n) ? null : n;
  }
  return null;
}

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