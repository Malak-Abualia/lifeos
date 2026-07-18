"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { toggleTask, createTask } from "@/features/planner/actions";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Input } from "@/shared/ui/input";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface PlannerTask {
  id: string;
  title: string;
  startMinute: number | null;
  durationMin: number;
  priority: string;
  area: string;
  done: boolean;
}

const DAY_START = 7 * 60; // 07:00
const DAY_END = 22 * 60; // 22:00
const PX_PER_MIN = 44 / 60; // 44px per hour

const AREA_ACCENT: Record<string, string> = {
  work: "border-sapphire/40 bg-sapphire/12",
  health: "border-emerald/40 bg-emerald/12",
  growth: "border-ice/40 bg-ice/10",
  career: "border-ice/40 bg-ice/10",
  personal: "border-white/12 bg-white/5",
};

const PRIORITY_VARIANT = {
  high: "ruby",
  medium: "sapphire",
  low: "steel",
} as const;

function minuteLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function Planner({ tasks }: { tasks: PlannerTask[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [newTitle, setNewTitle] = React.useState("");
  // Optimistic done-state so checkboxes respond instantly
  const [optimistic, setOptimistic] = React.useState<Record<string, boolean>>({});

  const scheduled = tasks
    .filter((t) => t.startMinute !== null)
    .sort((a, b) => (a.startMinute ?? 0) - (b.startMinute ?? 0));
  const backlog = tasks.filter((t) => t.startMinute === null);

  const isDone = (t: PlannerTask) => optimistic[t.id] ?? t.done;
  const doneCount = tasks.filter(isDone).length;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMin >= DAY_START && nowMin <= DAY_END;

  function handleToggle(task: PlannerTask) {
    setOptimistic((o) => ({ ...o, [task.id]: !isDone(task) }));
    startTransition(async () => {
      await toggleTask(task.id);
      router.refresh();
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    startTransition(async () => {
      await createTask({ title, priority: "medium", area: "personal" });
      router.refresh();
    });
  }

  return (
    <Stagger className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      {/* Timeline */}
      <Rise className="xl:col-span-3">
        <GlassCard className="h-full">
          <GlassCardHeader className="flex-row items-baseline justify-between">
            <div>
              <GlassCardTitle>Today&apos;s timeline</GlassCardTitle>
              <GlassCardDescription>
                {scheduled.length} blocks · {doneCount}/{tasks.length} done
              </GlassCardDescription>
            </div>
            <span className="text-xs tabular text-muted-foreground">
              07:00 – 22:00
            </span>
          </GlassCardHeader>
          <GlassCardContent>
            <div
              className="relative"
              style={{ height: (DAY_END - DAY_START) * PX_PER_MIN }}
            >
              {/* Hour rules */}
              {Array.from(
                { length: (DAY_END - DAY_START) / 60 + 1 },
                (_, i) => DAY_START + i * 60,
              ).map((min) => (
                <div
                  key={min}
                  className="absolute inset-x-0 flex items-center gap-3"
                  style={{ top: (min - DAY_START) * PX_PER_MIN }}
                >
                  <span className="w-10 text-right text-[0.625rem] tabular text-steel">
                    {minuteLabel(min)}
                  </span>
                  <div className="h-px flex-1 bg-white/4" />
                </div>
              ))}

              {/* Now line */}
              {showNowLine && (
                <div
                  className="absolute inset-x-0 z-10 flex items-center gap-3"
                  style={{ top: (nowMin - DAY_START) * PX_PER_MIN }}
                  aria-label={`Current time ${minuteLabel(nowMin)}`}
                >
                  <span className="w-10 text-right text-[0.625rem] font-semibold tabular text-ice">
                    {minuteLabel(nowMin)}
                  </span>
                  <div className="relative h-px flex-1 bg-ice/60 shadow-[0_0_8px_rgba(110,198,255,0.6)]">
                    <span className="absolute -left-1 -top-[2.5px] size-1.5 rounded-full bg-ice" />
                  </div>
                </div>
              )}

              {/* Blocks */}
              {scheduled.map((task) => {
                const top = ((task.startMinute ?? 0) - DAY_START) * PX_PER_MIN;
                const height = Math.max(26, task.durationMin * PX_PER_MIN - 3);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleToggle(task)}
                    className={cn(
                      "absolute left-14 right-1 rounded-lg border px-3 text-left backdrop-blur-sm",
                      "transition-all duration-200 ease-(--ease-swift) hover:brightness-125",
                      AREA_ACCENT[task.area] ?? AREA_ACCENT.personal,
                      isDone(task) && "opacity-45 saturate-50",
                    )}
                    style={{ top, height }}
                    aria-pressed={isDone(task)}
                    title={`${task.title} — click to ${isDone(task) ? "reopen" : "complete"}`}
                  >
                    <span
                      className={cn(
                        "block truncate pt-1 text-xs font-medium leading-tight",
                        isDone(task) && "line-through",
                      )}
                    >
                      {task.title}
                    </span>
                    {height > 40 && (
                      <span className="text-[0.625rem] tabular text-muted-foreground">
                        {minuteLabel(task.startMinute ?? 0)} ·{" "}
                        {task.durationMin}m
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Task list + backlog */}
      <Rise className="xl:col-span-2">
        <div className="flex h-full flex-col gap-4">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Quick add</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <form onSubmit={handleCreate} className="flex gap-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What needs doing?"
                  aria-label="New task title"
                  maxLength={120}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isPending || !newTitle.trim()}
                  aria-label="Add task"
                >
                  <Plus />
                </Button>
              </form>
            </GlassCardContent>
          </GlassCard>

          <GlassCard className="flex-1">
            <GlassCardHeader>
              <GlassCardTitle>All tasks</GlassCardTitle>
              <GlassCardDescription>
                Backlog items have no time block yet
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-1.5">
              {[...scheduled, ...backlog].map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors duration-200 hover:bg-white/4"
                >
                  <Checkbox
                    checked={isDone(task)}
                    onCheckedChange={() => handleToggle(task)}
                    aria-label={`Mark "${task.title}" ${isDone(task) ? "not done" : "done"}`}
                  />
                  <span
                    className={cn(
                      "flex-1 truncate text-[0.8125rem]",
                      isDone(task)
                        ? "text-steel line-through"
                        : "text-foreground",
                    )}
                  >
                    {task.title}
                  </span>
                  {task.startMinute === null && (
                    <Badge variant="steel">backlog</Badge>
                  )}
                  <Badge
                    variant={
                      PRIORITY_VARIANT[
                        task.priority as keyof typeof PRIORITY_VARIANT
                      ] ?? "steel"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="py-6 text-center text-xs text-steel">
                  Nothing scheduled — add your first task above.
                </p>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      </Rise>
    </Stagger>
  );
}
