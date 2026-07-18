"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trophy, Activity, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { deleteEntity } from "@/features/crud/actions";
import { useCommandStore } from "@/features/crud/store";
import { toForm } from "@/features/crud/to-form";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { RowActions } from "@/shared/ui/row-actions";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Stagger, Rise } from "@/shared/ui/animate";

export interface WorkoutData {
  id: string;
  date: Date;
  type: string;
  durationMin: number;
  load: number;
}

export interface PRData {
  id: string;
  exercise: string;
  value: number;
  unit: string;
  date: Date;
}

const TYPE_EMOJI: Record<string, string> = {
  run: "🏃",
  strength: "🏋️",
  cycle: "🚴",
  swim: "🏊",
  yoga: "🧘",
  climb: "🧗",
};

function LoadTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-raised rounded-xl px-3 py-2 text-xs">
      <p className="text-muted-foreground">Week of {label}</p>
      <p className="mt-0.5 font-semibold tabular">{payload[0].value} load</p>
    </div>
  );
}

export function Fitness({
  workouts,
  prs,
}: {
  workouts: WorkoutData[];
  prs: PRData[];
}) {
  const router = useRouter();
  const openEntity = useCommandStore((s) => s.openEntity);
  const [, startTransition] = React.useTransition();
  /* Weekly aggregate (last 10 weeks) */
  const weeks: { label: string; load: number; sessions: number }[] = [];
  for (let w = 9; w >= 0; w--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() + 1 - w * 7); // Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const inWeek = workouts.filter((x) => x.date >= start && x.date < end);
    weeks.push({
      label: format(start, "MMM d"),
      load: inWeek.reduce((s, x) => s + x.load, 0),
      sessions: inWeek.length,
    });
  }

  const thisWeek = weeks[weeks.length - 1];
  const lastWeek = weeks[weeks.length - 2];
  const totalMin30 = workouts
    .filter((w) => w.date >= new Date(Date.now() - 30 * 86400000))
    .reduce((s, w) => s + w.durationMin, 0);

  const recent = workouts.slice(0, 7);

  return (
    <Stagger className="space-y-4">
      {/* Stat strip */}
      <Rise className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Sessions this week", value: String(thisWeek.sessions) },
          {
            label: "Weekly load",
            value: String(thisWeek.load),
            sub:
              lastWeek.load > 0
                ? `${thisWeek.load >= lastWeek.load ? "+" : ""}${Math.round(((thisWeek.load - lastWeek.load) / lastWeek.load) * 100)}% vs last week`
                : undefined,
          },
          {
            label: "Hours (30 days)",
            value: (totalMin30 / 60).toFixed(1) + "h",
          },
          { label: "Personal records", value: String(prs.length) },
        ].map((s) => (
          <GlassCard key={s.label} className="p-5">
            <p className="text-2xl font-semibold tabular leading-none">
              {s.value}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">{s.label}</p>
            {s.sub && (
              <p className="mt-0.5 text-[0.6875rem] tabular text-steel">
                {s.sub}
              </p>
            )}
          </GlassCard>
        ))}
      </Rise>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Training load chart */}
        <Rise className="xl:col-span-2">
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Training load</GlassCardTitle>
              <GlassCardDescription>
                Weekly cumulative load, last 10 weeks
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeks}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  barCategoryGap="28%"
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
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b98a9", fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={<LoadTooltip />}
                    cursor={{ fill: "rgba(110,198,255,0.05)" }}
                  />
                  <Bar
                    dataKey="load"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </GlassCardContent>
          </GlassCard>
        </Rise>

        {/* PR board */}
        <Rise>
          <GlassCard className="h-full">
            <GlassCardHeader className="flex-row items-center justify-between">
              <div>
                <GlassCardTitle>Personal records</GlassCardTitle>
                <GlassCardDescription>All-time bests</GlassCardDescription>
              </div>
              <Button
                variant="glass"
                size="icon-sm"
                onClick={() => openEntity("personalRecord")}
                aria-label="Log personal record"
              >
                <Plus />
              </Button>
            </GlassCardHeader>
            <GlassCardContent className="space-y-2.5">
              {prs.map((pr) => (
                <div
                  key={pr.id}
                  className="group flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-3.5 py-2.5"
                >
                  <Trophy className="size-3.5 shrink-0 text-ice" aria-hidden />
                  <span className="flex-1 truncate text-[0.8125rem]">
                    {pr.exercise}
                  </span>
                  <RowActions
                    label={pr.exercise}
                    onEdit={() =>
                      openEntity("personalRecord", {
                        id: pr.id,
                        initial: toForm.personalRecord(pr),
                      })
                    }
                    onDelete={() =>
                      startTransition(async () => {
                        await deleteEntity("personalRecord", pr.id);
                        router.refresh();
                      })
                    }
                  />
                  <span className="text-[0.8125rem] font-semibold tabular">
                    {pr.value}
                    <span className="ml-0.5 text-[0.6875rem] font-normal text-steel">
                      {pr.unit}
                    </span>
                  </span>
                </div>
              ))}
              {prs.length === 0 && (
                <p className="py-4 text-center text-xs text-steel">
                  No records yet — log your first PR.
                </p>
              )}
            </GlassCardContent>
          </GlassCard>
        </Rise>
      </div>

      {/* Recent sessions */}
      <Rise>
        <GlassCard>
          <GlassCardHeader className="flex-row items-center justify-between">
            <GlassCardTitle>Recent sessions</GlassCardTitle>
            <Button
              variant="glass"
              size="sm"
              onClick={() => openEntity("workout")}
            >
              <Plus /> Log workout
            </Button>
          </GlassCardHeader>
          <GlassCardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {recent.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() =>
                  openEntity("workout", {
                    id: w.id,
                    initial: toForm.workout(w),
                  })
                }
                className="rounded-xl border border-white/6 bg-white/3 p-3 text-center transition-all duration-200 hover:border-ice/25 hover:bg-white/5"
                title={`Edit ${w.type} on ${format(w.date, "MMM d")}`}
              >
                <span className="text-lg" aria-hidden>
                  {TYPE_EMOJI[w.type] ?? "💪"}
                </span>
                <p className="mt-1 text-xs font-medium capitalize">{w.type}</p>
                <p className="text-[0.6875rem] tabular text-steel">
                  {format(w.date, "EEE")} · {w.durationMin}m
                </p>
                <Badge
                  variant={w.load > 70 ? "ruby" : w.load > 45 ? "sapphire" : "steel"}
                  className="mt-1.5"
                >
                  <Activity aria-hidden /> {w.load}
                </Badge>
              </button>
            ))}
            {recent.length === 0 && (
              <p className="col-span-full py-4 text-center text-xs text-steel">
                No sessions yet — log the first one and the charts wake up.
              </p>
            )}
          </GlassCardContent>
        </GlassCard>
      </Rise>
    </Stagger>
  );
}
