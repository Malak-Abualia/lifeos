"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface WeeklyRow {
  label: string;
  consistency: number; // % of habit slots completed
  moodIndex: number; // avg mood × 10 → 0–100
  loadIndex: number; // training load, normalized 0–100
}

const SERIES = [
  { key: "consistency", label: "Habit consistency", color: "var(--chart-1)" },
  { key: "moodIndex", label: "Mood index", color: "var(--chart-2)" },
  { key: "loadIndex", label: "Training load", color: "var(--chart-3)" },
] as const;

function AnalyticsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; stroke: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const names: Record<string, string> = {
    consistency: "Consistency",
    moodIndex: "Mood",
    loadIndex: "Load",
  };
  return (
    <div className="glass-raised rounded-xl px-3 py-2 text-xs">
      <p className="text-muted-foreground">Week of {label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-0.5 flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ background: p.stroke }}
            aria-hidden
          />
          <span className="text-muted-foreground">{names[p.dataKey]}</span>
          <span className="font-semibold tabular">{Math.round(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

/** Pearson correlation between two equal-length series. */
function pearson(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 3) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

function corrLabel(r: number) {
  const a = Math.abs(r);
  if (a >= 0.7) return "strong";
  if (a >= 0.4) return "moderate";
  if (a >= 0.2) return "weak";
  return "negligible";
}

export function Analytics({ weeks }: { weeks: WeeklyRow[] }) {
  const rMoodHabits = pearson(
    weeks.map((w) => w.consistency),
    weeks.map((w) => w.moodIndex),
  );
  const rMoodLoad = pearson(
    weeks.map((w) => w.loadIndex),
    weeks.map((w) => w.moodIndex),
  );

  const correlations = [
    {
      pair: "Habits ↔ Mood",
      r: rMoodHabits,
      note: "Weeks with fuller habit completion",
    },
    {
      pair: "Training ↔ Mood",
      r: rMoodLoad,
      note: "Weeks with more training volume",
    },
  ];

  return (
    <Stagger className="space-y-4">
      {/* Correlation stats */}
      <Rise className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {correlations.map((c) => (
          <GlassCard key={c.pair} className="p-6">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold">{c.pair}</p>
              <p
                className={cn(
                  "text-2xl font-semibold tabular leading-none",
                  c.r >= 0.4
                    ? "text-emerald"
                    : c.r <= -0.4
                      ? "text-ruby"
                      : "text-foreground",
                )}
              >
                r = {c.r.toFixed(2)}
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {c.note} show a{" "}
              <span className="font-medium text-foreground">
                {corrLabel(c.r)} {c.r >= 0 ? "positive" : "negative"}
              </span>{" "}
              relationship with mood across {weeks.length} weeks.
            </p>
          </GlassCard>
        ))}
      </Rise>

      {/* Indexed chart */}
      <Rise>
        <GlassCard>
          <GlassCardHeader className="flex-row flex-wrap items-baseline justify-between gap-3">
            <div>
              <GlassCardTitle>The week, indexed</GlassCardTitle>
              <GlassCardDescription>
                All series normalized to 0–100 so trends share one axis
              </GlassCardDescription>
            </div>
            <div className="flex flex-wrap gap-4">
              {SERIES.map((s) => (
                <span
                  key={s.key}
                  className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground"
                >
                  <span
                    className="h-0.5 w-4 rounded-full"
                    style={{ background: s.color }}
                    aria-hidden
                  />
                  {s.label}
                </span>
              ))}
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeks}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8b98a9", fontSize: 10 }}
                  dy={6}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8b98a9", fontSize: 11 }}
                />
                <ChartTooltip
                  content={<AnalyticsTooltip />}
                  cursor={{ stroke: "rgba(110,198,255,0.25)", strokeWidth: 1 }}
                />
                {SERIES.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: "#08111F", strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Weekly table */}
      <Rise>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Weekly numbers</GlassCardTitle>
            <GlassCardDescription>
              The same data, as a table — for the skeptics
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="overflow-x-auto">
            <table className="w-full min-w-100 border-separate border-spacing-0 text-[0.8125rem]">
              <thead>
                <tr>
                  {["Week", "Consistency", "Mood", "Load"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-white/8 pb-2 pr-4 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-steel"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((w) => (
                  <tr key={w.label} className="hover:bg-white/3">
                    <td className="border-b border-white/4 py-2 pr-4 tabular text-muted-foreground">
                      {w.label}
                    </td>
                    <td className="border-b border-white/4 py-2 pr-4 tabular">
                      {Math.round(w.consistency)}%
                    </td>
                    <td className="border-b border-white/4 py-2 pr-4 tabular">
                      {(w.moodIndex / 10).toFixed(1)}
                    </td>
                    <td className="border-b border-white/4 py-2 pr-4 tabular">
                      {Math.round(w.loadIndex)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCardContent>
        </GlassCard>
      </Rise>
    </Stagger>
  );
}
