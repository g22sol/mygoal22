import {
  Wind,
  Timer,
  Zap,
  Gauge,
  RotateCcw,
  Activity,
  TrendingUp,
} from "lucide-react";
import type { ExerciseTemplate, SprintEntry, SprintField, ScheduleDay } from "./types";

export const TEMPLATE_KEY = "workout_template";
export const HISTORY_KEY = "workout_history";
export const SPRINT_KEY = "sprint_history";
export const SCHEDULE_KEY = "workout_schedule";

export const DEFAULT_TEMPLATE: ExerciseTemplate[] = [
  { id: 1, name: "Front Squat", sets: 4, reps: 6 },
  { id: 2, name: "Romanian Deadlift", sets: 3, reps: 8 },
  { id: 3, name: "Bulgarian Split Squat", sets: 3, reps: 8 },
  { id: 4, name: "Calf Raises", sets: 4, reps: 15 },
];

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

// Legacy static export kept for any files that still import WEEK_SCHEDULE
export const WEEK_SCHEDULE = DEFAULT_SCHEDULE;