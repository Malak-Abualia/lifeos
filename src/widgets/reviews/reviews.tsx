"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  CalendarRange,
} from "lucide-react";

import type { PeriodSummary } from "@/entities/insights/engine";
import { Insights, type Insight } from "@/widgets/insights/insights";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface ReviewPeriod {
  key: "weekly" | "monthly" | "yearly";
  label: string;
  rangeLabel: string;
  current: PeriodSummary;
  previous: PeriodSummary;
  insights: Insight[];
  recommendations: string[];
}

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function Delta({ now, prev, invert = false }: { now: number; prev: number; invert?: boolean }) {
  if (prev === 0 && now === 0)
    return <Minus className="size-3 text-steel" aria-hidden />;
  const up = now >= prev;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-[0.6875rem] tabular",
        good ? "text-emerald" : "text-ruby",
      )}
    >
      <Icon className="size-3" aria-hidden />
      {prev !== 0
        ? `${Math.abs(Math.round(((now - prev) / prev) * 100))}%`
        : "new"}
    </span>
  );
}

export function Reviews({ periods }: { periods: ReviewPeriod[] }) {
  const [active, setActive] = React.useState<ReviewPeriod["key"]>("weekly");
  const period = periods.find((p) => p.key === active) ?? periods[0];
  const { current: s, previous: p } = period;

  const stats: {
    label: string;
    value: string;
    now: number;
    prev: number;
    invert?: boolean;
  }[] = [
    {
      label: "Tasks completed",
      value: `${s.tasksDone}${s.tasksTotal ? ` / ${s.tasksTotal}` : ""}`,
      now: s.tasksDone,
      prev: p.tasksDone,
    },
    {
      label: "Habit consistency",
      value: `${s.habitConsistency}%`,
      now: s.habitConsistency,
      prev: p.habitConsistency,
    },
    {
      label: "Average mood",
      value: s.avgMood ? s.avgMood.toFixed(1) : "—",
      now: s.avgMood ?? 0,
      prev: p.avgMood ?? 0,
    },
    {
      label: "Workouts",
      value: `${s.workouts} · ${(s.trainingMinutes / 60).toFixed(1)}h`,
      now: s.workouts,
      prev: p.workouts,
    },
    {
      label: "Journal entries",
      value: String(s.journalEntries),
      now: s.journalEntries,
      prev: p.journalEntries,
    },
    {
      label: "Spending",
      value: fmtMoney(s.spending),
      now: s.spending,
      prev: p.spending,
      invert: true,
    },
    {
      label: "Saved",
      value: fmtMoney(s.saved),
      now: s.saved,
      prev: p.saved,
    },
    {
      label: "Career wins",
      value: String(s.careerWins),
      now: s.careerWins,
      prev: p.careerWins,
    },
  ];

  return (
    <Stagger className="space-y-4">
      {/* Period switcher */}
      <Rise>
        <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div
            role="tablist"
            aria-label="Review period"
            className="flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1"
          >
            {periods.map((per) => (
              <button
                key={per.key}
                role="tab"
                aria-selected={active === per.key}
                onClick={() => setActive(per.key)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-medium transition-all duration-200 ease-(--ease-swift)",
                  active === per.key
                    ? "bg-ice/12 text-ice shadow-[0_0_12px_rgba(110,198,255,0.1)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {per.label}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarRange className="size-3.5 text-ice" aria-hidden />
            {period.rangeLabel} · compared with the previous {period.label.toLowerCase()}
          </span>
        </GlassCard>
      </Rise>

      {/* Stat grid */}
      <div
        key={active}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <Rise key={stat.label}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xl font-semibold tabular leading-none">
                  {stat.value}
                </p>
                <Delta now={stat.now} prev={stat.prev} invert={stat.invert} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          </Rise>
        ))}
      </div>

      {/* Highlights */}
      <Rise>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Highlights</GlassCardTitle>
            <GlassCardDescription>
              The period in three lines
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="space-y-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            <p>
              {s.bestDay
                ? `Best day: ${format(s.bestDay.date, "EEEE, MMM d")} (mood ${s.bestDay.mood}/10).`
                : "No mood data logged this period — check in daily to unlock this."}
            </p>
            <p>
              {s.topSpendCategory
                ? `Biggest spending lever: ${s.topSpendCategory.category} at ${fmtMoney(s.topSpendCategory.amount)}.`
                : "No spending recorded this period."}
            </p>
            <p>
              {s.workouts > 0
                ? `${s.workouts} training sessions totalling ${(s.trainingMinutes / 60).toFixed(1)} hours.`
                : "No training sessions logged."}
            </p>
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Recommendations */}
      <Rise>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Lightbulb className="size-4 text-ice" aria-hidden />
              Recommendations
            </GlassCardTitle>
            <GlassCardDescription>
              Generated from this period&apos;s numbers
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <ul className="space-y-2.5">
              {period.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ice/60" aria-hidden />
                  {rec}
                </li>
              ))}
            </ul>
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Period insights */}
      <Rise>
        <Insights insights={period.insights} />
      </Rise>
    </Stagger>
  );
}
