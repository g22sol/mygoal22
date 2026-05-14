export type ExerciseTemplate = {
  id: number;
  name: string;
  sets: number;
  reps: number;
};

export type Exercise = ExerciseTemplate & {
  weight: string;
  completed: boolean;
};

// ── NEW: one row per set ─────────────────────────────────────────────────────
export type SetLog = {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
};

// Updated: exercises now carry per-set data.
// `weight` kept as optional string for backwards compat with old sessions.
export type SavedExercise = {
  name: string;
  sets: number;
  reps: number;
  weight?: string;       // legacy — single weight from old sessions
  setLogs?: SetLog[];    // new — per-set data
};

export type SavedSession = {
  id: string;
  date: string;
  title: string;
  exercises: SavedExercise[];
};

export type SprintEntry = {
  id: string;
  date: string;
  topSpeed: string;
  time10m: string;
  time40yard: string;
  time60m: string;
  curvedRun: string;
  onBallSpeed: string;
  offBallSpeed: string;
  notes: string;
};

export type SprintField = {
  key: keyof Omit<SprintEntry, "id" | "date" | "notes">;
  label: string;
  unit: string;
  icon: React.ElementType;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type ViewName =
  | "dashboard"
  | "session"
  | "template"
  | "history"
  | "sprint"
  | "progress";