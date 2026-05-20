import { supabase } from "./supabase";
import {
  DEFAULT_WEEKLY_TEMPLATE,
  LEGACY_DEFAULT_TEMPLATE,
  DEFAULT_SCHEDULE,
  HISTORY_KEY,
  SPRINT_KEY,
  TEMPLATE_KEY,
  SCHEDULE_KEY,
} from "../constants";
import type {
  ExerciseTemplate,
  WeeklyTemplate,
  DayTemplate,
  WeekDay,
  SavedSession,
  SprintEntry,
  ScheduleDay,
} from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

// ── Migration ──────────────────────────────────────────────────────────────────

/**
 * The old format stored ExerciseTemplate[] directly.
 * Detect it and promote to WeeklyTemplate, assigning the exercises to Monday
 * (the historical default active day).
 */
function migrateTemplate(raw: unknown): WeeklyTemplate {
  // Already a WeeklyTemplate
  if (
    raw &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    "days" in (raw as object)
  ) {
    return raw as WeeklyTemplate;
  }

  // Legacy: flat array — put it on Monday, fill remaining days with defaults
  if (Array.isArray(raw)) {
    const legacy = raw as ExerciseTemplate[];
    return {
      days: DEFAULT_WEEKLY_TEMPLATE.days.map((d) =>
        d.day === "Mon" ? { ...d, exercises: legacy } : { ...d }
      ),
    };
  }

  return DEFAULT_WEEKLY_TEMPLATE;
}

// ── WEEKLY TEMPLATE ────────────────────────────────────────────────────────────

export async function loadWeeklyTemplate(): Promise<WeeklyTemplate> {
  const userId = await getUserId();

  if (userId) {
    const { data, error } = await supabase
      .from("workout_template")
      .select("exercises")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data?.exercises) {
      const migrated = migrateTemplate(data.exercises);
      localStorage.setItem(TEMPLATE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  }

  // localStorage fallback
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    if (raw) return migrateTemplate(JSON.parse(raw));
  } catch {}

  return DEFAULT_WEEKLY_TEMPLATE;
}

export async function saveWeeklyTemplate(wt: WeeklyTemplate): Promise<void> {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(wt));

  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase
    .from("workout_template")
    .upsert(
      { user_id: userId, exercises: wt, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) console.error("[saveWeeklyTemplate] Supabase error:", error.message);
}

/** Convenience: get just the exercises for one day. */
export function getDayTemplate(wt: WeeklyTemplate, day: WeekDay): ExerciseTemplate[] {
  return wt.days.find((d) => d.day === day)?.exercises ?? [];
}

/** Convenience: return a new WeeklyTemplate with one day's exercises replaced. */
export function setDayTemplate(
  wt: WeeklyTemplate,
  day: WeekDay,
  exercises: ExerciseTemplate[]
): WeeklyTemplate {
  const allDays: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    days: allDays.map((d) => {
      const existing = wt.days.find((x) => x.day === d);
      if (d === day) return { day: d, exercises };
      return existing ?? { day: d, exercises: [] };
    }),
  };
}

// ── WORKOUT HISTORY ────────────────────────────────────────────────────────────

export async function loadHistory(): Promise<SavedSession[]> {
  const userId = await getUserId();

  if (userId) {
    const { data, error } = await supabase
      .from("workout_history")
      .select("id, title, exercises, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: true });

    if (!error && data) {
      const sessions: SavedSession[] = data.map((row) => ({
        id: row.id,
        date: row.completed_at,
        title: row.title,
        exercises: row.exercises,
      }));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
      return sessions;
    }
  }

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((s: SavedSession, i: number) => ({
        ...s,
        id: s.id ?? `${s.date}-${i}`,
      }));
    }
  } catch {}

  return [];
}

export async function saveSession(
  session: SavedSession,
  current: SavedSession[]
): Promise<SavedSession[]> {
  const updated = [...current, session];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

  const userId = await getUserId();
  if (!userId) return updated;

  const { error } = await supabase.from("workout_history").insert({
    id: session.id,
    user_id: userId,
    title: session.title,
    exercises: session.exercises,
    completed_at: session.date,
  });

  if (error) console.error("[saveSession] Supabase error:", error.message);
  return updated;
}

export async function deleteSession(
  id: string,
  current: SavedSession[]
): Promise<SavedSession[]> {
  const updated = current.filter((s) => s.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

  const userId = await getUserId();
  if (!userId) return updated;

  const { error } = await supabase
    .from("workout_history")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) console.error("[deleteSession] Supabase error:", error.message);
  return updated;
}

// ── SPRINT HISTORY ─────────────────────────────────────────────────────────────

function rowToSprint(row: Record<string, unknown>): SprintEntry {
  return {
    id: row.id as string,
    date: (row.date as string).slice(0, 10),
    topSpeed: row.top_speed != null ? String(row.top_speed) : "",
    time10m: row.time_10m != null ? String(row.time_10m) : "",
    time40yard: row.time_40yard != null ? String(row.time_40yard) : "",
    time60m: row.time_60m != null ? String(row.time_60m) : "",
    curvedRun: row.curved_run != null ? String(row.curved_run) : "",
    onBallSpeed: row.on_ball_speed != null ? String(row.on_ball_speed) : "",
    offBallSpeed: row.off_ball_speed != null ? String(row.off_ball_speed) : "",
    notes: (row.notes as string) ?? "",
  };
}

function sprintToRow(entry: SprintEntry, userId: string) {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    top_speed: entry.topSpeed !== "" ? parseFloat(entry.topSpeed) : null,
    time_10m: entry.time10m !== "" ? parseFloat(entry.time10m) : null,
    time_40yard: entry.time40yard !== "" ? parseFloat(entry.time40yard) : null,
    time_60m: entry.time60m !== "" ? parseFloat(entry.time60m) : null,
    curved_run: entry.curvedRun !== "" ? parseFloat(entry.curvedRun) : null,
    on_ball_speed: entry.onBallSpeed !== "" ? parseFloat(entry.onBallSpeed) : null,
    off_ball_speed: entry.offBallSpeed !== "" ? parseFloat(entry.offBallSpeed) : null,
    notes: entry.notes || null,
  };
}

export async function loadSprints(): Promise<SprintEntry[]> {
  const userId = await getUserId();

  if (userId) {
    const { data, error } = await supabase
      .from("sprint_history")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (!error && data) {
      const sprints = data.map(rowToSprint);
      localStorage.setItem(SPRINT_KEY, JSON.stringify(sprints));
      return sprints;
    }
  }

  try {
    const raw = localStorage.getItem(SPRINT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [];
}

export async function saveSprint(
  entry: SprintEntry,
  current: SprintEntry[]
): Promise<SprintEntry[]> {
  const updated = [...current, entry];
  localStorage.setItem(SPRINT_KEY, JSON.stringify(updated));

  const userId = await getUserId();
  if (!userId) return updated;

  const { error } = await supabase
    .from("sprint_history")
    .insert(sprintToRow(entry, userId));

  if (error) console.error("[saveSprint] Supabase error:", error.message);
  return updated;
}

export async function deleteSprint(
  id: string,
  current: SprintEntry[]
): Promise<SprintEntry[]> {
  const updated = current.filter((s) => s.id !== id);
  localStorage.setItem(SPRINT_KEY, JSON.stringify(updated));

  const userId = await getUserId();
  if (!userId) return updated;

  const { error } = await supabase
    .from("sprint_history")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) console.error("[deleteSprint] Supabase error:", error.message);
  return updated;
}

// ── WEEKLY SCHEDULE ────────────────────────────────────────────────────────────

export function loadSchedule(): ScheduleDay[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SCHEDULE;
}

export function saveSchedule(schedule: ScheduleDay[]): void {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}