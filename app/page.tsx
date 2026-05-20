"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  ExerciseTemplate,
  SavedExercise,
  SavedSession,
  SprintEntry,
  ViewName,
  ScheduleDay,
  WeeklyTemplate,
  WeekDay,
} from "./types";
import { DEFAULT_WEEKLY_TEMPLATE } from "./constants";
import {
  loadWeeklyTemplate,
  saveWeeklyTemplate,
  getDayTemplate,
  setDayTemplate,
  loadHistory,
  saveSession,
  deleteSession,
  loadSprints,
  saveSprint,
  deleteSprint,
  loadSchedule,
} from "./lib/storage";
import { getLastSession, getLatestSprint, nextId } from "./lib/utils";
import { supabase } from "./lib/supabase";
import { buildPRData, getRecentPRs } from "./lib/prDetection";
import type { ExercisePR } from "./lib/prDetection";

import LoginScreen from "./components/LoginScreen";
import BottomNav from "./components/BottomNav";
import Dashboard from "./components/Dashboard";
import WorkoutSession from "./components/WorkoutSession";
import WorkoutHistory from "./components/WorkoutHistory";
import TemplateEditor from "./components/TemplateEditor";
import SprintTracker from "./components/SprintTracker";
import ProgressAnalytics from "./components/ProgressAnalytics";
import ScheduleEditor from "./components/ScheduleEditor";

type AuthState = "loading" | "unauthenticated" | "authenticated";
type ExtendedView = ViewName | "schedule_editor";

export default function Page() {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthState(data.session ? "authenticated" : "unauthenticated");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthState(s ? "authenticated" : "unauthenticated");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  // ── App state ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<ExtendedView>("dashboard");
  const [touchesComplete, setTouchesComplete] = useState(false);

  // All-days template (replaces single `template`)
  const [weeklyTemplate, setWeeklyTemplate] = useState<WeeklyTemplate>(
    DEFAULT_WEEKLY_TEMPLATE
  );

  const [history, setHistory] = useState<SavedSession[]>([]);
  const [sprints, setSprints] = useState<SprintEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);

  // Template editor draft — only for the active day's exercises
  const [draft, setDraft] = useState<ExerciseTemplate[]>([]);
  const [templateSaved, setTemplateSaved] = useState(false);

  useEffect(() => {
    if (authState !== "authenticated") return;
    async function loadAll() {
      if (localStorage.getItem("touches_complete") === "true") setTouchesComplete(true);
      const [wt, hist, sprts] = await Promise.all([
        loadWeeklyTemplate(),
        loadHistory(),
        loadSprints(),
      ]);
      setWeeklyTemplate(wt);
      setHistory(hist);
      setSprints(sprts);
      setSchedule(loadSchedule());
    }
    loadAll();
  }, [authState]);

  // ── Derived: active day ────────────────────────────────────────────────────
  const activeDay: WeekDay =
    (schedule.find((d) => d.active)?.day as WeekDay) ?? "Mon";

  /** Exercises for the currently active day only. */
  const activeTemplate: ExerciseTemplate[] = useMemo(
    () => getDayTemplate(weeklyTemplate, activeDay),
    [weeklyTemplate, activeDay]
  );

  const lastSession = getLastSession(history);
  const latestSprint = getLatestSprint(sprints);

  const { prMap, sessionPRs } = useMemo(() => buildPRData(history), [history]);
  const recentPRs: ExercisePR[] = useMemo(
    () => getRecentPRs(history, prMap, sessionPRs, 3),
    [history, prMap, sessionPRs]
  );

  // ── Touches ────────────────────────────────────────────────────────────────
  const handleTouchesComplete = () => {
    setTouchesComplete(true);
    localStorage.setItem("touches_complete", "true");
  };

  // ── Session ────────────────────────────────────────────────────────────────
  const handleStartSession = () => setView("session");

  const handleFinishSession = async (savedExercises: SavedExercise[]) => {
    const activeScheduleDay = schedule.find((d) => d.active);
    const s: SavedSession = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      title: activeScheduleDay?.workout ?? "Workout",
      exercises: savedExercises,
    };
    const updated = await saveSession(s, history);
    setHistory(updated);
    setView("dashboard");
  };

  // ── History ────────────────────────────────────────────────────────────────
  const handleDeleteSession = async (id: string) => {
    const updated = await deleteSession(id, history);
    setHistory(updated);
  };

  // ── Template (per active day) ──────────────────────────────────────────────
  const handleOpenTemplate = () => {
    // Load only the active day's exercises into draft
    setDraft(activeTemplate.map((e) => ({ ...e })));
    setTemplateSaved(false);
    setView("template");
  };

  const handleDraftChange = (
    id: number,
    field: keyof ExerciseTemplate,
    value: string | number | null
  ) =>
    setDraft((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );

  const handleAddExercise = () =>
    setDraft((prev) => [
      ...prev,
      {
        id: nextId(prev),
        name: "New Exercise",
        sets: 3,
        reps: 10,
        supersetGroup: null,
      },
    ]);

  const handleRemoveExercise = (id: number) =>
    setDraft((prev) => prev.filter((e) => e.id !== id));

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= draft.length) return;
    setDraft((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleSaveTemplate = async () => {
    const cleaned = draft.map((e) => ({
      ...e,
      name: e.name.trim() || "Exercise",
      sets: Math.max(1, e.sets),
      reps: Math.max(1, e.reps),
    }));

    // Write only the active day; all other days are untouched
    const updated = setDayTemplate(weeklyTemplate, activeDay, cleaned);
    setWeeklyTemplate(updated);
    await saveWeeklyTemplate(updated);
    setTemplateSaved(true);
    setTimeout(() => setView("dashboard"), 700);
  };

  // ── Sprints ────────────────────────────────────────────────────────────────
  const handleSaveSprint = async (entry: Omit<SprintEntry, "id">) => {
    const newEntry: SprintEntry = { id: `${Date.now()}`, ...entry };
    setSprints(await saveSprint(newEntry, sprints));
  };

  const handleDeleteSprint = async (id: string) => {
    setSprints(await deleteSprint(id, sprints));
  };

  // ── Schedule ───────────────────────────────────────────────────────────────
  const handleScheduleSave = (updated: ScheduleDay[]) => {
    setSchedule(updated);
    setView("dashboard");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const showNav = ["dashboard", "history", "sprint", "progress"].includes(view);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ff6a00] flex items-center justify-center animate-pulse">
            <span className="text-white font-black text-lg">22</span>
          </div>
          <p className="text-neutral-600 text-xs font-bold uppercase tracking-widest">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <LoginScreen onAuthenticated={() => setAuthState("authenticated")} />;
  }

  const renderView = () => {
    switch (view) {
      case "session":
        return (
          <WorkoutSession
            // Pass only the active day's exercises — other days are isolated
            template={activeTemplate}
            lastSession={lastSession}
            onBack={() => setView("dashboard")}
            onFinishSession={handleFinishSession}
          />
        );

      case "history":
        return (
          <WorkoutHistory
            history={history}
            onDelete={handleDeleteSession}
            onBack={() => setView("dashboard")}
            onStartSession={handleStartSession}
          />
        );

      case "template":
        return (
          <TemplateEditor
            // Draft is already scoped to the active day (set in handleOpenTemplate)
            draft={draft}
            saved={templateSaved}
            activeDay={activeDay}
            onDraftChange={handleDraftChange}
            onAdd={handleAddExercise}
            onRemove={handleRemoveExercise}
            onSave={handleSaveTemplate}
            onBack={() => setView("dashboard")}
            onReorder={handleReorder}
          />
        );

      case "sprint":
        return (
          <SprintTracker
            sprints={sprints}
            onSave={handleSaveSprint}
            onDelete={handleDeleteSprint}
            onBack={() => setView("dashboard")}
          />
        );

      case "progress":
        return (
          <ProgressAnalytics
            sprints={sprints}
            history={history}
            onBack={() => setView("dashboard")}
          />
        );

      case "schedule_editor":
        return (
          <ScheduleEditor
            schedule={schedule}
            onSave={handleScheduleSave}
            onBack={() => setView("dashboard")}
          />
        );

      case "dashboard":
      default:
        return (
          <Dashboard
            // Only the active day's template reaches Dashboard
            template={activeTemplate}
            lastSession={lastSession}
            latestSprint={latestSprint}
            touchesComplete={touchesComplete}
            recentPRs={recentPRs}
            schedule={schedule}
            onStartSession={handleStartSession}
            onOpenTemplate={handleOpenTemplate}
            onTouchesComplete={handleTouchesComplete}
            onNavigate={(v) => setView(v)}
            onLogout={handleLogout}
            onEditSchedule={() => setView("schedule_editor")}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex justify-center">
      {renderView()}
      {showNav && (
        <BottomNav current={view as ViewName} onNavigate={(v) => setView(v)} />
      )}
    </main>
  );
}