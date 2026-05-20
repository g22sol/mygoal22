export type ExerciseTemplate = {
  id: number;
  name: string;
  sets: number;
  reps: number;
  supersetGroup?: string | null;
};

export type Exercise = ExerciseTemplate & {
  weight: string;
  completed: boolean;
};

export type SetLog = {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
};

export type SavedExercise = {
  name: string;
  sets: number;
  reps: number;
  weight?: string;
  setLogs?: SetLog[];
  supersetGroup?: string | null;
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

export type WeekDay =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

export type ScheduleDay = {
  day: WeekDay;
  workout: string;
  active: boolean;
};

// ── Per-day template ───────────────────────────────────────────────────────────

/** One day's exercise list. */
export type DayTemplate = {
  day: WeekDay;
  exercises: ExerciseTemplate[];
};

/**
 * The shape stored in Supabase / localStorage under TEMPLATE_KEY.
 * Replaces the old bare ExerciseTemplate[].
 */
export type WeeklyTemplate = {
  days: DayTemplate[];
};