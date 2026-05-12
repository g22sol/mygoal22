import { DEFAULT_TEMPLATE, HISTORY_KEY, SPRINT_KEY, TEMPLATE_KEY } from "../constants";
import type { ExerciseTemplate, SavedSession, SprintEntry } from "../types";

export function loadTemplate(): ExerciseTemplate[] {
  try {
    const r = localStorage.getItem(TEMPLATE_KEY);
    if (r) return JSON.parse(r);
  } catch {}
  return DEFAULT_TEMPLATE;
}

export function saveTemplate(t: ExerciseTemplate[]) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(t));
}

export function loadHistory(): SavedSession[] {
  try {
    const r = localStorage.getItem(HISTORY_KEY);
    if (r) {
      const p = JSON.parse(r);
      return p.map((s: SavedSession, i: number) => ({
        ...s,
        id: s.id ?? `${s.date}-${i}`,
      }));
    }
  } catch {}
  return [];
}

export function saveHistory(h: SavedSession[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

export function loadSprints(): SprintEntry[] {
  try {
    const r = localStorage.getItem(SPRINT_KEY);
    if (r) return JSON.parse(r);
  } catch {}
  return [];
}

export function saveSprints(s: SprintEntry[]) {
  localStorage.setItem(SPRINT_KEY, JSON.stringify(s));
}