import type { SavedSession, SavedExercise } from "../types";
import { getBestWeight } from "./utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ExercisePR = {
  exerciseName: string;
  weight: number;
  sessionId: string;
  date: string;
};

export type PRMap = Record<string, ExercisePR>;
// key = exerciseName, value = the session where the all-time best was set

export type SessionPRSet = Record<string, boolean>;
// key = exerciseName, value = true if this session contains the PR for that exercise

// ── Core builder ───────────────────────────────────────────────────────────────

/**
 * Walk every session in chronological order and track the running best weight
 * per exercise. When a session beats the previous best, it owns the PR.
 *
 * Returns:
 *   prMap        — the current all-time PR for every exercise
 *   sessionPRs   — map of sessionId → Set of exercise names that are PRs
 *                  in that session
 */
export function buildPRData(history: SavedSession[]): {
  prMap: PRMap;
  sessionPRs: Record<string, Set<string>>;
} {
  const prMap: PRMap = {};
  const sessionPRs: Record<string, Set<string>> = {};

  // History is stored oldest-first, so iterate as-is
  for (const session of history) {
    for (const ex of session.exercises) {
      const best = getBestWeight(ex);
      if (best === null) continue;

      const existing = prMap[ex.name];

      if (!existing || best > existing.weight) {
        // New PR
        prMap[ex.name] = {
          exerciseName: ex.name,
          weight: best,
          sessionId: session.id,
          date: session.date,
        };

        if (!sessionPRs[session.id]) {
          sessionPRs[session.id] = new Set();
        }
        sessionPRs[session.id].add(ex.name);

        // Remove PR badge from the previously-holding session (if any)
        if (existing) {
          sessionPRs[existing.sessionId]?.delete(ex.name);
        }
      }
    }
  }

  return { prMap, sessionPRs };
}

/**
 * Returns only PRs that were set in the most recent N sessions.
 * Used to show "new PRs" on the dashboard.
 */
export function getRecentPRs(
  history: SavedSession[],
  prMap: PRMap,
  sessionPRs: Record<string, Set<string>>,
  withinLastN = 3
): ExercisePR[] {
  const recentIds = new Set(
    history.slice(-withinLastN).map((s) => s.id)
  );

  return Object.values(prMap).filter(
    (pr) =>
      recentIds.has(pr.sessionId) &&
      sessionPRs[pr.sessionId]?.has(pr.exerciseName)
  );
}

/**
 * Given one exercise from a session, returns whether it is a PR in that
 * session according to the sessionPRs map.
 */
export function isExercisePR(
  sessionId: string,
  exerciseName: string,
  sessionPRs: Record<string, Set<string>>
): boolean {
  return sessionPRs[sessionId]?.has(exerciseName) ?? false;
}