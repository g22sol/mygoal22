"use client";

import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import type {
  Exercise,
  ExerciseTemplate,
  SavedSession,
  SprintEntry,
  ViewName,
} from "./types";
import { DEFAULT_TEMPLATE, EMPTY_SPRINT } from "./constants";
import {
  loadTemplate,
  saveTemplate,
  loadHistory,
  saveHistory,
  loadSprints,
  saveSprints,
} from "./lib/storage";
import { getLastSession, getLatestSprint, nextId } from "./lib/utils";
import { supabase } from "./lib/supabase";

import LoginScreen from "./components/LoginScreen";
import BottomNav from "./components/BottomNav";
import Dashboard from "./components/Dashboard";
import WorkoutSession from "./components/WorkoutSession";
import WorkoutHistory from "./components/WorkoutHistory";
import TemplateEditor from "./components/TemplateEditor";
import SprintTracker from "./components/SprintTracker";
import ProgressAnalytics from "./components/ProgressAnalytics";

type AuthState = "loading" | "unauthenticated" | "authenticated";

export default function Page() {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s);
      setAuthState(s ? "authenticated" : "unauthenticated");
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setAuthState(s ? "authenticated" : "unauthenticated");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will fire and set state to unauthenticated
  };

  // ── App state ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<ViewName>("dashboard");
  const [touchesComplete, setTouchesComplete] = useState(false);
  const [template, setTemplate] = useState<ExerciseTemplate[]>(DEFAULT_TEMPLATE);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [sprints, setSprints] = useState<SprintEntry[]>([]);
  const [draft, setDraft] = useState<ExerciseTemplate[]>([]);
  const [templateSaved, setTemplateSaved] = useState(false);

  useEffect(() => {
    if (authState !== "authenticated") return;
    if (localStorage.getItem("touches_complete") === "true") setTouchesComplete(true);
    setTemplate(loadTemplate());
    setHistory(loadHistory());
    setSprints(loadSprints());
  }, [authState]);

  const lastSession = getLastSession(history);
  const latestSprint = getLatestSprint(sprints);

  // ── Touches ────────────────────────────────────────────────────────────────
  const handleTouchesComplete = () => {
    setTouchesComplete(true);
    localStorage.setItem("touches_complete", "true");
  };

  // ── Session ────────────────────────────────────────────────────────────────
  const handleStartSession = () => {
    setExercises(template.map((e) => ({ ...e, weight: "", completed: false })));
    setView("session");
  };

  const handleWeightChange = (id: number, value: string) =>
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, weight: value } : e))
    );

  const handleUseSuggested = (id: number, suggested: string) =>
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, weight: suggested } : e))
    );

  const handleCompleteExercise = (id: number) =>
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: true } : e))
    );

  const handleFinishSession = () => {
    const s: SavedSession = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      title: "Acceleration + Lowers",
      exercises: exercises.map(({ name, sets, reps, weight }) => ({
        name,
        sets,
        reps,
        weight,
      })),
    };
    const updated = [...history, s];
    setHistory(updated);
    saveHistory(updated);
    setView("dashboard");
  };

  // ── Workout history ────────────────────────────────────────────────────────
  const handleDeleteSession = (id: string) => {
    const updated = history.filter((s) => s.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  // ── Template ───────────────────────────────────────────────────────────────
  const handleOpenTemplate = () => {
    setDraft(template.map((e) => ({ ...e })));
    setTemplateSaved(false);
    setView("template");
  };

  const handleDraftChange = (
    id: number,
    field: keyof ExerciseTemplate,
    value: string | number
  ) =>
    setDraft((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );

  const handleAddExercise = () =>
    setDraft((prev) => [
      ...prev,
      { id: nextId(prev), name: "New Exercise", sets: 3, reps: 10 },
    ]);

  const handleRemoveExercise = (id: number) =>
    setDraft((prev) => prev.filter((e) => e.id !== id));

  const handleSaveTemplate = () => {
    const cleaned = draft.map((e) => ({
      ...e,
      name: e.name.trim() || "Exercise",
      sets: Math.max(1, e.sets),
      reps: Math.max(1, e.reps),
    }));
    setTemplate(cleaned);
    saveTemplate(cleaned);
    setTemplateSaved(true);
    setTimeout(() => setView("dashboard"), 700);
  };

  // ── Sprints ────────────────────────────────────────────────────────────────
  const handleSaveSprint = (entry: Omit<SprintEntry, "id">) => {
    const newEntry: SprintEntry = { id: `${Date.now()}`, ...entry };
    const updated = [...sprints, newEntry];
    setSprints(updated);
    saveSprints(updated);
  };

  const handleDeleteSprint = (id: string) => {
    const updated = sprints.filter((s) => s.id !== id);
    setSprints(updated);
    saveSprints(updated);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // Loading state — show nothing while Supabase checks the session
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

  // Auth gate
  if (authState === "unauthenticated") {
    return (
      <LoginScreen onAuthenticated={() => setAuthState("authenticated")} />
    );
  }

  const showNav =
    view === "dashboard" ||
    view === "history" ||
    view === "sprint" ||
    view === "progress";

  const renderView = () => {
    switch (view) {
      case "session":
        return (
          <WorkoutSession
            exercises={exercises}
            lastSession={lastSession}
            onBack={() => setView("dashboard")}
            onWeightChange={handleWeightChange}
            onUseSuggested={handleUseSuggested}
            onCompleteExercise={handleCompleteExercise}
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
            draft={draft}
            saved={templateSaved}
            onDraftChange={handleDraftChange}
            onAdd={handleAddExercise}
            onRemove={handleRemoveExercise}
            onSave={handleSaveTemplate}
            onBack={() => setView("dashboard")}
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
      case "dashboard":
      default:
        return (
          <Dashboard
            template={template}
            lastSession={lastSession}
            latestSprint={latestSprint}
            touchesComplete={touchesComplete}
            onStartSession={handleStartSession}
            onOpenTemplate={handleOpenTemplate}
            onTouchesComplete={handleTouchesComplete}
            onNavigate={setView}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex justify-center">
      {renderView()}
      {showNav && <BottomNav current={view} onNavigate={setView} />}
    </main>
  );
}