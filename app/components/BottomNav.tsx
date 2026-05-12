"use client";

import { LayoutDashboard, Dumbbell, Zap, TrendingUp } from "lucide-react";
import type { ViewName } from "../types";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { label: "Workouts", icon: Dumbbell, key: "history" },
  { label: "Sprint", icon: Zap, key: "sprint" },
  { label: "Progress", icon: TrendingUp, key: "progress" },
] as const;

type Props = {
  current: ViewName;
  onNavigate: (v: ViewName) => void;
};

export default function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-white/10 flex justify-around py-2 px-2 z-50">
      {NAV_ITEMS.map(({ label, icon: Icon, key }) => {
        const active = current === key;
        return (
          <button
            key={label}
            onClick={() => onNavigate(key as ViewName)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              active ? "text-[#ff6a00]" : "text-neutral-600"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                active ? "bg-[#ff6a00]/10" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}