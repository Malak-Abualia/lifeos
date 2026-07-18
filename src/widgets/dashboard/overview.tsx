"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/utils";

/* ---------------------------------------------------------------- */
/*  Demo data — replaced by Prisma queries in the dashboard module   */
/* ---------------------------------------------------------------- */

const STATS = [
  {
    label: "Focus today",
    value: "4.2h",
    delta: "+18%",
    up: true,
    icon: Timer,
  },
  {
    label: "Habit consistency",
    value: "86%",
    delta: "+4%",
    up: true,
    icon: Flame,
  },
  {
    label: "Goals on track",
    value: "5 / 7",
    delta: "71%",
    up: true,
    icon: Target,
  },
  {
    label: "Recovery",
    value: "72",
    delta: "-6",
    up: false,
    icon: HeartPulse,
  },
] as const;

const MOMENTUM = [
  { day: "Mon", score: 58 },
  { day: "Tue", score: 64 },
  { day: "Wed", score: 61 },
  { day: "Thu", score: 74 },
  { day: "Fri", score: 70 },
  { day: "Sat", score: 82 },
  { day: "Sun", score: 88 },
];

const STREAKS = [
  { name: "Deep work", days: 12, target: 14 },
  { name: "Morning run", days: 8, target: 10 },
  { name: "Reading", days: 21, target: 21 },
  { name: "No sugar", days: 4, target: 7 },
];

/* ---------------------------------------------------------------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const },
  },
};

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

export function DashboardOverview() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Greeting */}
      <motion.div variants={item}>
        <h2 className="text-2xl font-semibold tracking-tight">
          Good morning<span className="text-ice">.</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Momentum is building — here&apos;s where your week stands.
        </p>
      </motion.div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <GlassCard interactive className="p-5">
              <div className="flex items-start justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                  <stat.icon className="size-4 text-ice" aria-hidden />
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
          </motion.div>
        ))}
      </div>

      {/* Momentum chart + streaks */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div variants={item} className="xl:col-span-2">
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Weekly momentum</GlassCardTitle>
              <GlassCardDescription>
                Composite of focus, habits, and recovery — last 7 days
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={MOMENTUM}
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
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Active streaks</GlassCardTitle>
              <GlassCardDescription>
                Days in a row, against this week&apos;s target
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-5">
              {STREAKS.map((streak) => {
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
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
