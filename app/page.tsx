"use client";

import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import type {
  ExerciseTemplate,
  SavedExercise,
  SavedSession,
  SprintEntry,
  ViewName,
} from "./types";
import { DEFAULT_TEMPLATE } from "./constants";
import {
  loadTemplate,
  saveTemplate,
  loadHistory,
  saveSession,
  deleteSession,
  loadSprints,
  saveSprint,
  deleteSprint,
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
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);

  const [view, setView] = useState<ViewName>("dashboard");
  const [touchesComplete, setTouchesComplete] = useState(false);
  const [template, setTemplate] = useState<ExerciseTemplate[]>(DEFAULT_TEMPLATE);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [sprints, setSprints] = useState<SprintEntry[]>([]);
  const [draft, setDraft] = useState<ExerciseTemplate[]>([]);
  const [templateSaved, setTemplateSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s);
      setAuthState(s ? "authenticated" : "unauthenticated");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthState(s ? "authenticated" : "unauthenticated");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authState !== "authenticated") return;

    async function loadAll() {
      if (localStorage.getItem("touches_complete") === "true") {
        setTouchesComplete(true);
      }

      const [tpl, hist, sprts] = await Promise.all([
        loadTemplate(),
        loadHistory(),
        loadSprints(),
      ]);

      setTemplate(tpl);
      setHistory(hist);
      setSprints(sprts);
    }

    loadAll();
  }, [authState]);

  const lastSession = getLastSession(history);
  const latestSprint = getLatestSprint(sprints);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("dashboard");
  };

  const handleTouchesComplete = () => {
    setTouchesComplete(true);
    localStorage.setItem("touches_complete", "true");
  };

  const handleStartSession = () => {
    setView("session");
  };

  const handleFinishSession = async (savedExercises: SavedExercise[]) => {
    const s: SavedSession = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      title: "Acceleration + Lowers",
      exercises: savedExercises,
    };

    const updated = await saveSession(s, history);
    setHistory(updated);
    setView("dashboard");
  };

  const handleDeleteSession = async (id: string) => {
    const updated = await deleteSession(id, history);
    setHistory(updated);
  };

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

  const handleSaveTemplate = async () => {
    const cleaned = draft.map((e) => ({
      ...e,
      name: e.name.trim() || "Exercise",
      sets: Math.max(1, e.sets),
      reps: Math.max(1, e.reps),
    }));

    setTemplate(cleaned);
    await saveTemplate(cleaned);
    setTemplateSaved(true);
    setTimeout(() => setView("dashboard"), 700);
  };

  const handleSaveSprint = async (entry: Omit<SprintEntry, "id">) => {
    const newEntry: SprintEntry = { id: `${Date.now()}`, ...entry };
    const updated = await saveSprint(newEntry, sprints);
    setSprints(updated);
  };

  const handleDeleteSprint = async (id: string) => {
    const updated = await deleteSprint(id, sprints);
    setSprints(updated);
  };

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
            template={template}
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