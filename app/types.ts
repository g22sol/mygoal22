export type ViewName =
  | "dashboard"
  | "session"
  | "history"
  | "template"
  | "sprint"
  | "progress";

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

export type SavedExercise = {
  name: string;
  sets: number;
  reps: number;
  weight?: string;
};

export type SavedSession = {
  id: string;
  date: string;
  title: string;
  exercises: SavedExercise[];
};

export type SprintField = {
  key:
    | "topSpeed"
    | "time10m"
    | "time40yard"
    | "time60m"
    | "curvedRun"
    | "onBallSpeed"
    | "offBallSpeed";
  label: string;
  unit: string;
  icon: React.ElementType;
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

export type ChartPoint = {
  label: string;
  value: number;
};