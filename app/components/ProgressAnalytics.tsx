"use client";

import {
  ArrowLeft,
  Dumbbell,
  Minus,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wind,
  Zap,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ChartPoint, SavedSession, SprintEntry } from "../types";
import { gymSeries, getStats, sprintSeries } from "../lib/utils";

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-neutral-500 font-bold mb-0.5">{label}</p>
      <p className="text-sm font-black text-[#ff6a00]">
        {payload[0].value}{" "}
        <span className="text-neutral-400 font-semibold text-xs">{unit}</span>
      </p>
    </div>
  );
}

// ── Individual chart card ──────────────────────────────────────────────────────

function ProgressCard({
  title,
  unit,
  data,
  higherIsBetter,
  icon: Icon,
  accentColor = "#ff6a00",
}: {
  title: string;
  unit: string;
  data: ChartPoint[];
  higherIsBetter: boolean;
  icon: React.ElementType;
  accentColor?: string;
}) {
  const { pb, latest, diff } = getStats(data, higherIsBetter);
  const hasData = data.length > 1;
  const hasAny = data.length > 0;
  const improved = diff !== null && (higherIsBetter ? diff > 0 : diff < 0);
  const regressed = diff !== null && (higherIsBetter ? diff < 0 : diff > 0);

  return (
    <div className="mx-5 mb-4 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative">
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }}
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-white">{title}</p>
          </div>
          <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">
            {unit}
          </span>
        </div>

        {hasAny ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
                Latest
              </p>
              <p className="text-lg font-black text-white">{latest}</p>
            </div>
            <div
              className="rounded-xl p-3 text-center border"
              style={{
                backgroundColor: `${accentColor}10`,
                borderColor: `${accentColor}30`,
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-2.5 h-2.5" style={{ color: accentColor }} />
                <p
                  className="text-[9px] uppercase tracking-wider font-bold"
                  style={{ color: accentColor }}
                >
                  PB
                </p>
              </div>
              <p className="text-lg font-black text-white">{pb}</p>
            </div>
            <div
              className={`rounded-xl p-3 text-center border ${
                improved
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : regressed
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-white/5 border-white/0"
              }`}
            >
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
                Change
              </p>
              <div className="flex items-center justify-center gap-0.5">
                {improved && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {regressed && <TrendingDown className="w-3 h-3 text-red-400" />}
                {!improved && !regressed && <Minus className="w-3 h-3 text-neutral-500" />}
                <p
                  className={`text-lg font-black ${
                    improved
                      ? "text-emerald-400"
                      : regressed
                      ? "text-red-400"
                      : "text-neutral-500"
                  }`}
                >
                  {diff !== null ? (diff > 0 ? `+${diff}` : diff) : "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-4 text-center mb-4">
            <p className="text-xs text-neutral-600 font-semibold">
              No data yet. Log entries to see progress.
            </p>
          </div>
        )}

        {hasData ? (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: "#555", fontSize: 9, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#555", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              {pb !== null && (
                <ReferenceLine
                  y={pb}
                  stroke={accentColor}
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={2.5}
                dot={{ fill: accentColor, r: 3, strokeWidth: 0 }}
                activeDot={{ fill: accentColor, r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : hasAny ? (
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[10px] text-neutral-600 font-semibold">
              Add more entries to see the chart.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

type Props = {
  sprints: SprintEntry[];
  history: SavedSession[];
  onBack: () => void;
};

export default function ProgressAnalytics({ sprints, history, onBack }: Props) {
  const topSpeedData = sprintSeries(sprints, "topSpeed");
  const yardData = sprintSeries(sprints, "time40yard");
  const onBallData = sprintSeries(sprints, "onBallSpeed");
  const offBallData = sprintSeries(sprints, "offBallSpeed");
  const frontSquatData = gymSeries(history, "Front Squat");

  const topSpeedPB = topSpeedData.length
    ? Math.max(...topSpeedData.map((d) => d.value))
    : null;
  const yardPB = yardData.length
    ? Math.min(...yardData.map((d) => d.value))
    : null;
  const squatPB = frontSquatData.length
    ? Math.max(...frontSquatData.map((d) => d.value))
    : null;

  return (
    <div className="w-full max-w-md min-h-screen pb-24">

      <header className="px-5 pt-10 pb-5 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">MyGoal22</p>
          <h1 className="text-lg font-black tracking-tight">Progress Analytics</h1>
        </div>
      </header>

      {/* Summary strip */}
      <div className="mx-5 mb-5 grid grid-cols-3 gap-2">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
            Sessions
          </p>
          <p className="text-xl font-black text-white">{history.length}</p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
            Sprint Logs
          </p>
          <p className="text-xl font-black text-white">{sprints.length}</p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
            Top Speed PB
          </p>
          <p className="text-xl font-black text-white">{topSpeedPB ?? "—"}</p>
        </div>
      </div>

      {/* PB highlights */}
      {(topSpeedPB || yardPB || squatPB) && (
        <div className="mx-5 mb-5 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6a00] via-[#ee0979] to-transparent" />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-3.5 h-3.5 text-[#ff6a00]" />
              <p className="text-xs font-black uppercase tracking-widest text-[#ff6a00]">
                Personal Bests
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {topSpeedPB && (
                <div className="bg-[#ff6a00]/10 border border-[#ff6a00]/20 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-[#ff6a00] font-bold uppercase tracking-wider">
                    Top Speed
                  </p>
                  <p className="text-sm font-black text-white">
                    {topSpeedPB}{" "}
                    <span className="text-neutral-500 text-[10px]">km/h</span>
                  </p>
                </div>
              )}
              {yardPB && (
                <div className="bg-[#ff6a00]/10 border border-[#ff6a00]/20 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-[#ff6a00] font-bold uppercase tracking-wider">
                    40 Yard
                  </p>
                  <p className="text-sm font-black text-white">
                    {yardPB}{" "}
                    <span className="text-neutral-500 text-[10px]">s</span>
                  </p>
                </div>
              )}
              {squatPB && (
                <div className="bg-[#ff6a00]/10 border border-[#ff6a00]/20 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-[#ff6a00] font-bold uppercase tracking-wider">
                    Front Squat
                  </p>
                  <p className="text-sm font-black text-white">
                    {squatPB}{" "}
                    <span className="text-neutral-500 text-[10px]">kg</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-5 mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
          Sprint Performance
        </p>
      </div>

      <ProgressCard
        title="Top Speed"
        unit="km/h"
        data={topSpeedData}
        higherIsBetter
        icon={Wind}
        accentColor="#ff6a00"
      />
      <ProgressCard
        title="40 Yard Dash"
        unit="s"
        data={yardData}
        higherIsBetter={false}
        icon={Zap}
        accentColor="#ee0979"
      />
      <ProgressCard
        title="On-Ball Speed"
        unit="s"
        data={onBallData}
        higherIsBetter={false}
        icon={Activity}
        accentColor="#f59e0b"
      />
      <ProgressCard
        title="Off-Ball Speed"
        unit="s"
        data={offBallData}
        higherIsBetter={false}
        icon={TrendingUp}
        accentColor="#8b5cf6"
      />

      <div className="px-5 mb-3 mt-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
          Gym Strength
        </p>
      </div>

      <ProgressCard
        title="Front Squat"
        unit="kg"
        data={frontSquatData}
        higherIsBetter
        icon={Dumbbell}
        accentColor="#10b981"
      />

      <div className="px-5 mb-6">
        <button
          onClick={onBack}
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-2 text-neutral-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}