"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Target } from "lucide-react";

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
import { Progress } from "@/shared/ui/progress";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface GoalData {
  id: string;
  title: string;
  quarter: string;
  area: string;
  keyResults: {
    id: string;
    title: string;
    current: number;
    target: number;
    unit: string;
  }[];
}

const AREA_BADGE = {
  work: "sapphire",
  health: "emerald",
  growth: "ice",
  career: "ice",
  finance: "emerald",
  personal: "steel",
} as const;

/** KR progress, handling inverted metrics (target below current start, e.g. pace). */
function krProgress(kr: GoalData["keyResults"][number]) {
  if (kr.target === 0) return 0;
  // Inverted when target < current means "lower is better" hasn't been reached
  if (kr.target < kr.current) {
    return Math.min(1, kr.target / kr.current);
  }
  return Math.min(1, kr.current / kr.target);
}

function goalProgress(goal: GoalData) {
  if (goal.keyResults.length === 0) return 0;
  return (
    goal.keyResults.reduce((sum, kr) => sum + krProgress(kr), 0) /
    goal.keyResults.length
  );
}

/** Circular progress ring drawn with SVG. */
function Ring({ pct, size = 52 }: { pct: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      role="img"
      aria-label={`${Math.round(pct * 100)} percent complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={pct >= 1 ? "#0EA47A" : "var(--chart-1)"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        className="transition-[stroke-dashoffset] duration-700 ease-(--ease-swift)"
      />
    </svg>
  );
}

export function Goals({ goals }: { goals: GoalData[] }) {
  const router = useRouter();
  const openEntity = useCommandStore((s) => s.openEntity);
  const [, startTransition] = React.useTransition();
  const quarters = [...new Set(goals.map((g) => g.quarter))].sort();
  const overall =
    goals.length > 0
      ? goals.reduce((s, g) => s + goalProgress(g), 0) / goals.length
      : 0;
  const onTrack = goals.filter((g) => goalProgress(g) >= 0.6).length;

  return (
    <Stagger className="space-y-4">
      {/* Summary strip */}
      <Rise>
        <GlassCard className="flex flex-wrap items-center justify-between gap-6 p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Ring pct={overall} size={64} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular">
                {Math.round(overall * 100)}%
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">
                {onTrack} of {goals.length} goals on track
              </p>
              <p className="text-xs text-muted-foreground">
                Average key-result completion across{" "}
                {quarters.join(" and ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {quarters.map((q) => (
              <Badge key={q} variant="ice">
                {q}
              </Badge>
            ))}
            <Button
              variant="glass"
              size="sm"
              onClick={() => openEntity("goal")}
            >
              <Plus /> Set goal
            </Button>
          </div>
        </GlassCard>
      </Rise>

      {goals.length === 0 && (
        <Rise>
          <GlassCard className="flex flex-col items-center p-12 text-center">
            <Target className="mb-3 size-6 text-ice" aria-hidden />
            <p className="text-sm font-medium">No goals yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Set a quarterly goal, then attach measurable key results to it.
            </p>
            <Button className="mt-4" size="sm" onClick={() => openEntity("goal")}>
              <Plus /> Set your first goal
            </Button>
          </GlassCard>
        </Rise>
      )}

      {/* Goal cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {goals.map((goal) => {
          const pct = goalProgress(goal);
          return (
            <Rise key={goal.id}>
              <GlassCard interactive className="group h-full">
                <GlassCardHeader className="flex-row items-start justify-between gap-4">
                  <div className="min-w-0">
                    <GlassCardTitle className="flex items-center gap-1 text-[0.9375rem]">
                      <span className="truncate">{goal.title}</span>
                      <RowActions
                        label={goal.title}
                        onEdit={() =>
                          openEntity("goal", {
                            id: goal.id,
                            initial: toForm.goal(goal),
                          })
                        }
                        onDelete={() =>
                          startTransition(async () => {
                            await deleteEntity("goal", goal.id);
                            router.refresh();
                          })
                        }
                      />
                    </GlassCardTitle>
                    <GlassCardDescription className="mt-1 flex items-center gap-2">
                      <Badge
                        variant={
                          AREA_BADGE[goal.area as keyof typeof AREA_BADGE] ??
                          "steel"
                        }
                      >
                        {goal.area}
                      </Badge>
                      <span>{goal.quarter}</span>
                    </GlassCardDescription>
                  </div>
                  <div className="relative shrink-0">
                    <Ring pct={pct} />
                    <span className="absolute inset-0 flex items-center justify-center text-[0.625rem] font-semibold tabular">
                      {Math.round(pct * 100)}%
                    </span>
                  </div>
                </GlassCardHeader>
                <GlassCardContent className="space-y-3.5">
                  {goal.keyResults.map((kr) => {
                    const p = krProgress(kr);
                    const done = p >= 1;
                    return (
                      <div key={kr.id} className="group/kr">
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span
                            className={cn(
                              "truncate",
                              done
                                ? "text-emerald"
                                : "text-muted-foreground",
                            )}
                          >
                            {kr.title}
                          </span>
                          <span className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEntity("keyResult", {
                                  id: kr.id,
                                  initial: toForm.keyResult({
                                    ...kr,
                                    goalId: goal.id,
                                  }),
                                })
                              }
                              className="rounded px-1 text-[0.6875rem] text-steel opacity-0 transition-opacity hover:text-ice group-hover/kr:opacity-100"
                              aria-label={`Update ${kr.title}`}
                            >
                              update
                            </button>
                            <span className="tabular text-steel">
                              {kr.current}
                              {kr.unit && ` ${kr.unit}`} / {kr.target}
                              {kr.unit && ` ${kr.unit}`}
                            </span>
                          </span>
                        </div>
                        <Progress
                          value={p * 100}
                          accent={done ? "emerald" : "ice"}
                          aria-label={`${kr.title}: ${Math.round(p * 100)}%`}
                        />
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() =>
                      openEntity("keyResult", {
                        initial: { goalId: goal.id },
                      })
                    }
                    className="w-full rounded-lg border border-dashed border-white/10 py-1.5 text-[0.6875rem] text-steel transition-colors hover:border-ice/30 hover:text-ice"
                  >
                    + key result
                  </button>
                </GlassCardContent>
              </GlassCard>
            </Rise>
          );
        })}
      </div>
    </Stagger>
  );
}
