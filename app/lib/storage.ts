import { supabase } from "./supabase";
import {
  DEFAULT_TEMPLATE,
  DEFAULT_SCHEDULE,
  HISTORY_KEY,
  SPRINT_KEY,
  TEMPLATE_KEY,
  SCHEDULE_KEY,
} from "../constants";
import type {
  ExerciseTemplate,
  SavedSession,
  SprintEntry,
  ScheduleDay,
} from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

// ── WORKOUT TEMPLATE ───────────────────────────────────────────────────────────

export async function loadTemplate(): Promise<ExerciseTemplate[]> {
  const userId = await getUserId();

  if (userId) {
    const { data, error } = await supabase
      .from("workout_template")
      .select("exercises")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data?.exercises) {
      localStorage.setItem(TEMPLATE_KEY, JSON.stringify(data.exercises));
      return data.exercises as ExerciseTemplate[];
    }
  }

  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  return DEFAULT_TEMPLATE;
}

export async function saveTemplate(exercises: ExerciseTemplate[]): Promise<void> {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(exercises));

  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase
    .from("workout_template")
    .upsert(
      { user_id: userId, exercises, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) console.error("[saveTemplate] Supabase error:", error.message);
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