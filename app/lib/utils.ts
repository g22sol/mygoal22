import type {
  ChartPoint,
  SavedSession,
  SprintEntry,
  ExerciseTemplate,
} from "../types";

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function nextId(arr: ExerciseTemplate[]) {
  return arr.length ? Math.max(...arr.map((e) => e.id)) + 1 : 1;
}

export function getLastSession(history: SavedSession[]) {
  return history.length ? history[history.length - 1] : null;
}

export function getLatestSprint(sprints: SprintEntry[]) {
  return sprints.length ? sprints[sprints.length - 1] : null;
}

export function getPreviousData(
  name: string,
  lastSession: SavedSession | null
) {
  if (!lastSession) {
    return { lastWeight: null, suggested: null };
  }

  const found = lastSession.exercises.find((e) => e.name === name);

  if (!found?.weight) {
    return { lastWeight: null, suggested: null };
  }

  const weight = parseFloat(found.weight);

  return {
    lastWeight: found.weight,
    suggested: (Math.round(weight * 1.025 * 10) / 10).toString(),
  };
}

export function sprintSeries(
  sprints: SprintEntry[],
  key: keyof SprintEntry
): ChartPoint[] {
  return sprints
    .filter((s) => s[key])
    .map((s) => ({
      label: new Date(s.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      value: parseFloat(String(s[key])),
    }))
    .filter((p) => !isNaN(p.value));
}

export function gymSeries(
  history: SavedSession[],
  exerciseName: string
): ChartPoint[] {
  return history
    .map((session) => {
      const found = session.exercises.find(
        (e) => e.name === exerciseName
      );

      if (!found?.weight) return null;

      return {
        label: new Date(session.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
        value: parseFloat(found.weight),
      };
    })
    .filter(Boolean) as ChartPoint[];
}

export function getStats(
  data: ChartPoint[],
  higherIsBetter: boolean
) {
  if (!data.length) {
    return {
      pb: null,
      latest: null,
      diff: null,
    };
  }

  const latest = data[data.length - 1].value;

  const pb = higherIsBetter
    ? Math.max(...data.map((d) => d.value))
    : Math.min(...data.map((d) => d.value));

  let diff = null;

  if (data.length >= 2) {
    diff = Number(
      (latest - data[data.length - 2].value).toFixed(2)
    );
  }

  return {
    pb,
    latest,
    diff,
  };
}