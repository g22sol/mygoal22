import {
  Wind,
  Timer,
  Zap,
  Gauge,
  RotateCcw,
  Activity,
  TrendingUp,
} from "lucide-react";
import type {
  ExerciseTemplate,
  SprintEntry,
  SprintField,
  ScheduleDay,
  WeekDay,
  WeeklyTemplate,
} from "./types";

export const TEMPLATE_KEY = "workout_template";
export const HISTORY_KEY = "workout_history";
export const SPRINT_KEY = "sprint_history";
export const SCHEDULE_KEY = "workout_schedule";

// ── Default per-day exercises ──────────────────────────────────────────────────

const defaultLowers: ExerciseTemplate[] = [
  { id: 1, name: "Front Squat", sets: 4, reps: 6 },
  { id: 2, name: "Romanian Deadlift", sets: 3, reps: 8 },
  { id: 3, name: "Bulgarian Split Squat", sets: 3, reps: 8 },
  { id: 4, name: "Calf Raises", sets: 4, reps: 15 },
];

const defaultUpper: ExerciseTemplate[] = [
  { id: 1, name: "Bench Press", sets: 4, reps: 6 },
  { id: 2, name: "Barbell Row", sets: 4, reps: 6 },
  { id: 3, name: "Overhead Press", sets: 3, reps: 8 },
  { id: 4, name: "Pull-ups", sets: 3, reps: 8 },
];

const defaultPlyoPower: ExerciseTemplate[] = [
  { id: 1, name: "Box Jumps", sets: 4, reps: 5 },
  { id: 2, name: "Depth Jumps", sets: 3, reps: 5 },
  { id: 3, name: "Power Clean", sets: 4, reps: 4 },
  { id: 4, name: "Broad Jumps", sets: 3, reps: 5 },
];

const defaultUpperFitness: ExerciseTemplate[] = [
  { id: 1, name: "Bench Press", sets: 4, reps: 8 },
  { id: 2, name: "Cable Row", sets: 4, reps: 10 },
  { id: 3, name: "Lateral Raises", sets: 3, reps: 12 },
  { id: 4, name: "Assault Bike", sets: 5, reps: 1 },
];

const defaultTopSpeed: ExerciseTemplate[] = [
  { id: 1, name: "Flying 20m", sets: 6, reps: 1 },
  { id: 2, name: "Top Speed Run 30m", sets: 4, reps: 1 },
  { id: 3, name: "Wicket Runs", sets: 4, reps: 1 },
];

const defaultRecovery: ExerciseTemplate[] = [
  { id: 1, name: "Foam Rolling", sets: 1, reps: 1 },
  { id: 2, name: "Hip Flexor Stretch", sets: 3, reps: 1 },
  { id: 3, name: "Hamstring Stretch", sets: 3, reps: 1 },
];

export const DEFAULT_WEEKLY_TEMPLATE: WeeklyTemplate = {
  days: [
    { day: "Mon", exercises: defaultLowers },
    { day: "Tue", exercises: defaultUpper },
    { day: "Wed", exercises: defaultRecovery },
    { day: "Thu", exercises: defaultPlyoPower },
    { day: "Fri", exercises: defaultUpperFitness },
    { day: "Sat", exercises: defaultTopSpeed },
    { day: "Sun", exercises: defaultRecovery },
  ],
};

/**
 * Legacy fallback: a single flat list used before per-day templates existed.
 * Kept only for the migration path in storage.ts.
 */
export const LEGACY_DEFAULT_TEMPLATE: ExerciseTemplate[] = defaultLowers;

export const SPRINT_FIELDS: SprintField[] = [
  { key: "topSpeed", label: "Top Speed", unit: "km/h", icon: Wind },
  { key: "time10m", label: "10m Time", unit: "s", icon: Timer },
  { key: "time40yard", label: "40 Yard Dash", unit: "s", icon: Zap },
  { key: "time60m", label: "60m Time", unit: "s", icon: Gauge },
  { key: "curvedRun", label: "Curved Run", unit: "s", icon: RotateCcw },
  { key: "onBallSpeed", label: "On-Ball Speed", unit: "s", icon: Activity },
  { key: "offBallSpeed", label: "Off-Ball Speed", unit: "s", icon: TrendingUp },
];

export const EMPTY_SPRINT: Omit<SprintEntry, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  topSpeed: "",
  time10m: "",
  time40yard: "",
  time60m: "",
  curvedRun: "",
  onBallSpeed: "",
  offBallSpeed: "",
  notes: "",
};

export const DEFAULT_SCHEDULE: ScheduleDay[] = [
  { day: "Mon", workout: "Acceleration + Lowers", active: true },
  { day: "Tue", workout: "Upper", active: false },
  { day: "Wed", workout: "Recovery", active: false },
  { day: "Thu", workout: "Plyo + Power", active: false },
  { day: "Fri", workout: "Upper + Fitness", active: false },
  { day: "Sat", workout: "Top Speed", active: false },
  { day: "Sun", workout: "Recovery", active: false },
];

// Alias for any files that still import WEEK_SCHEDULE
export const WEEK_SCHEDULE = DEFAULT_SCHEDULE;