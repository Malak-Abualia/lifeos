"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Flame, Plus } from "lucide-react";

import { toggleHabitToday } from "@/features/habits/actions";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";

export interface HabitData {
  id: string;
  name: string;
  emoji: string;
  targetPerWeek: number;
  /** ISO day-keys (YYYY-MM-DD) with a completed log */
  loggedDays: string[];
}

const WEEKS = 16;

function dayKeyLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function computeStreak(logged: Set<string>): number {
  let streak = 0;
  const d = new Date();
  // Today may still be unlogged without breaking the streak
  if (!logged.has(dayKeyLocal(d))) d.setDate(d.getDate() - 1);
  while (logged.has(dayKeyLocal(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Completion heat for one day across all habits: 0..1 */
function heat(count: number, total: number) {
  if (total === 0) return 0;
  return count / total;
}

export function Habits({ habits }: { habits: HabitData[] }) {
  const router = useRouter();
  const openEntity = useCommandStore((s) => s.openEntity);
  const [, startTransition] = React.useTransition();
  const [optimisticToday, setOptimisticToday] = React.useState<
    Record<string, boolean>
  >({});

  const todayKey = dayKeyLocal(new Date());
  const sets = React.useMemo(
    () => habits.map((h) => new Set(h.loggedDays)),
    [habits],
  );

  const isCheckedToday = (i: number) =>
    optimisticToday[habits[i].id] ?? sets[i].has(todayKey);

  function handleToggle(i: number) {
    const habit = habits[i];
    setOptimisticToday((o) => ({ ...o, [habit.id]: !isCheckedToday(i) }));
    startTransition(async () => {
      await toggleHabitToday(habit.id);
      router.refresh();
    });
  }

  /* Build the aggregate heatmap grid: columns = weeks, rows = weekdays */
  const grid: { key: string; count: number; date: Date }[][] = [];
  const start = new Date();
  start.setDate(start.getDate() - (WEEKS * 7 - 1));
  // align to Monday
  while (start.getDay() !== 1) start.setDate(start.getDate() - 1);
  for (let w = 0; w < WEEKS; w++) {
    const col: { key: string; count: number; date: Date }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = dayKeyLocal(date);
      const count = sets.reduce((n, s) => n + (s.has(key) ? 1 : 0), 0);
      col.push({ key, count, date });
    }
    grid.push(col);
  }

  const totalToday = habits.filter((_, i) => isCheckedToday(i)).length;

  return (
    <Stagger className="space-y-4">
      {/* Today check-in row */}
      <Rise>
        <GlassCard>
          <GlassCardHeader className="flex-row items-center justify-between">
            <div>
              <GlassCardTitle>Today</GlassCardTitle>
              <GlassCardDescription>
                {totalToday} of {habits.length} habits done — tap to check in
              </GlassCardDescription>
            </div>
            <Button
              variant="glass"
              size="sm"
              onClick={() => openEntity("habit")}
            >
              <Plus /> New habit
            </Button>
          </GlassCardHeader>
          <GlassCardContent className="flex flex-wrap gap-2.5">
            {habits.length === 0 && (
              <button
                type="button"
                onClick={() => openEntity("habit")}
                className="w-full rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-xs text-steel transition-colors hover:border-ice/40 hover:text-ice"
              >
                No habits yet — create the first one. Small and daily beats
                big and rare.
              </button>
            )}
            {habits.map((habit, i) => {
              const checked = isCheckedToday(i);
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => handleToggle(i)}
                  aria-pressed={checked}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[0.8125rem]",
                    "transition-all duration-200 ease-(--ease-swift) active:scale-[0.96]",
                    checked
                      ? "border-emerald/40 bg-emerald/12 text-emerald shadow-[0_0_16px_rgba(16,185,129,0.15)]"
                      : "border-white/10 bg-white/4 text-muted-foreground hover:border-white/20 hover:text-foreground",
                  )}
                >
                  <span aria-hidden>{habit.emoji}</span>
                  {habit.name}
                  {checked && <Check className="size-3.5" aria-hidden />}
                </button>
              );
            })}
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Aggregate heatmap */}
      <Rise>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Consistency map</GlassCardTitle>
            <GlassCardDescription>
              All habits combined, last {WEEKS} weeks — darker is fuller
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="overflow-x-auto">
            <div className="flex gap-1" role="img" aria-label="Habit consistency heatmap">
              {grid.map((col, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {col.map((cell) => {
                    const h = heat(cell.count, habits.length);
                    const future = cell.date > new Date();
                    return (
                      <Tooltip key={cell.key}>
                        <TooltipTrigger asChild>
                          <span
                            tabIndex={future ? -1 : 0}
                            className={cn(
                              "size-3.5 rounded-[4px] outline-offset-1 transition-colors",
                              future && "opacity-0",
                            )}
                            style={{
                              backgroundColor:
                                h === 0
                                  ? "rgba(255,255,255,0.05)"
                                  : `rgba(62,155,224,${0.18 + h * 0.72})`,
                            }}
                          />
                        </TooltipTrigger>
                        {!future && (
                          <TooltipContent>
                            <span className="tabular">
                              {cell.key} — {cell.count}/{habits.length} habits
                            </span>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Per-habit stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {habits.map((habit, i) => {
          const streak = computeStreak(sets[i]);
          // completion over last 28 days
          let done28 = 0;
          for (let d = 0; d < 28; d++) {
            const dd = new Date();
            dd.setDate(dd.getDate() - d);
            if (sets[i].has(dayKeyLocal(dd))) done28++;
          }
          const rate = Math.round((done28 / 28) * 100);
          const last14: boolean[] = [];
          for (let d = 13; d >= 0; d--) {
            const dd = new Date();
            dd.setDate(dd.getDate() - d);
            last14.push(sets[i].has(dayKeyLocal(dd)));
          }
          return (
            <Rise key={habit.id}>
              <GlassCard interactive className="group p-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-sm font-medium">
                    <span className="text-base" aria-hidden>
                      {habit.emoji}
                    </span>
                    {habit.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <RowActions
                      label={habit.name}
                      onEdit={() =>
                        openEntity("habit", {
                          id: habit.id,
                          initial: toForm.habit(habit),
                        })
                      }
                      onDelete={() =>
                        startTransition(async () => {
                          await deleteEntity("habit", habit.id);
                          router.refresh();
                        })
                      }
                    />
                    <Badge variant={streak >= 7 ? "emerald" : "steel"}>
                      <Flame aria-hidden /> {streak}d
                    </Badge>
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold tabular leading-none">
                      {rate}%
                    </p>
                    <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                      28-day consistency · target {habit.targetPerWeek}×/wk
                    </p>
                  </div>
                  <div
                    className="flex items-end gap-[3px]"
                    aria-label={`Last 14 days for ${habit.name}`}
                  >
                    {last14.map((done, j) => (
                      <span
                        key={j}
                        className={cn(
                          "w-1.5 rounded-full",
                          done ? "h-5 bg-(--chart-1)" : "h-2 bg-white/8",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </GlassCard>
            </Rise>
          );
        })}
      </div>
    </Stagger>
  );
}
