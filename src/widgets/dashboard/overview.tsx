"use client";

import * as React from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Target,
  Timer,
  HeartPulse,
  ArrowRight,
  ClipboardCheck,
  Sparkles,
  Plus,
} from "lucide-react";

import { useCommandStore } from "@/features/crud/store";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Progress } from "@/shared/ui/progress";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface DashboardData {
  greeting: string;
  stats: {
    key: "focus" | "habits" | "goals" | "mood";
    label: string;
    value: string;
    delta: string;
    up: boolean;
  }[];
  momentum: { day: string; score: number }[];
  streaks: { name: string; days: number; target: number }[];
  today: { done: number; total: number };
}

const STAT_ICON = {
  focus: Timer,
  habits: Flame,
  goals: Target,
  mood: HeartPulse,
} as const;

function MomentumTooltip({
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
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold tabular text-foreground">
        {payload[0].value} momentum
      </p>
    </div>
  );
}

export function DashboardOverview({ data }: { data: DashboardData }) {
  const openEntity = useCommandStore((s) => s.openEntity);
  const isEmpty = data.streaks.length === 0 && data.today.total === 0;

  return (
    <Stagger className="space-y-6">
      {/* Greeting */}
      <Rise>
        <h2 className="text-2xl font-semibold tracking-tight">
          {data.greeting}
          <span className="text-ice">.</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEmpty
            ? "A blank slate — your operating system is ready for its first real data."
            : `${data.today.done} of ${data.today.total} tasks done today — here's where your week stands.`}
        </p>
      </Rise>

      {/* First-run onboarding */}
      {isEmpty && (
        <Rise>
          <GlassCard className="relative overflow-hidden p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/3 h-64 w-125 rounded-full bg-ice/6 blur-3xl"
            />
            <div className="relative flex flex-col items-start gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl border border-ice/25 bg-ice/10">
                <Sparkles className="size-5 text-ice" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Make it yours in two minutes
                </h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Create a habit or two, then run your first daily check-in.
                  Every chart, correlation, and insight on this dashboard
                  builds itself from what you enter.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button asChild>
                  <Link href="/checkin">
                    <ClipboardCheck /> Start daily check-in
                  </Link>
                </Button>
                <Button variant="glass" onClick={() => openEntity("habit")}>
                  <Plus /> Create a habit
                </Button>
                <Button variant="glass" onClick={() => openEntity("task")}>
                  <Plus /> Add a task
                </Button>
              </div>
            </div>
          </GlassCard>
        </Rise>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => {
          const Icon = STAT_ICON[stat.key];
          return (
            <Rise key={stat.key}>
              <GlassCard interactive className="p-5">
                <div className="flex items-start justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                    <Icon className="size-4 text-ice" aria-hidden />
                  </span>
                  <Badge variant={stat.up ? "emerald" : "ruby"}>
                    {stat.up ? (
                      <ArrowUpRight aria-hidden />
                    ) : (
                      <ArrowDownRight aria-hidden />
                    )}
                    {stat.delta}
                  </Badge>
                </div>
                <p className="mt-4 text-[1.75rem] font-semibold leading-none tracking-tight tabular">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </GlassCard>
            </Rise>
          );
        })}
      </div>

      {/* Momentum chart + streaks */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Rise className="xl:col-span-2">
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Weekly momentum</GlassCardTitle>
              <GlassCardDescription>
                Composite of habits, mood, and training — last 7 days
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.momentum}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="momentumFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 6"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b98a9", fontSize: 11 }}
                    dy={6}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b98a9", fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={<MomentumTooltip />}
                    cursor={{
                      stroke: "rgba(110,198,255,0.25)",
                      strokeWidth: 1,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#momentumFill)"
                    activeDot={{
                      r: 4,
                      fill: "var(--chart-1)",
                      stroke: "#08111F",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCardContent>
          </GlassCard>
        </Rise>

        <Rise>
          <GlassCard className="flex h-full flex-col">
            <GlassCardHeader>
              <GlassCardTitle>Active streaks</GlassCardTitle>
              <GlassCardDescription>
                Days in a row, against weekly target ×2
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="flex-1 space-y-5">
              {data.streaks.map((streak) => {
                const pct = Math.round((streak.days / streak.target) * 100);
                const done = streak.days >= streak.target;
                return (
                  <div key={streak.name}>
                    <div className="mb-1.5 flex items-baseline justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {streak.name}
                      </span>
                      <span
                        className={cn(
                          "tabular",
                          done ? "text-emerald" : "text-muted-foreground",
                        )}
                      >
                        {streak.days}
                        <span className="text-steel"> / {streak.target}d</span>
                      </span>
                    </div>
                    <Progress
                      value={Math.min(pct, 100)}
                      accent={done ? "emerald" : "ice"}
                      aria-label={`${streak.name}: ${streak.days} of ${streak.target} days`}
                    />
                  </div>
                );
              })}
              <Link
                href="/habits"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-ice transition-colors hover:text-arctic"
              >
                All habits <ArrowRight className="size-3" aria-hidden />
              </Link>
            </GlassCardContent>
          </GlassCard>
        </Rise>
      </div>
    </Stagger>
  );
}
