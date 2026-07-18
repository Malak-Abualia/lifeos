"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Hammer, Clock, Plus } from "lucide-react";

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

export interface CourseData {
  id: string;
  title: string;
  provider: string;
  kind: string;
  progress: number;
  hours: number;
  status: string;
}

const KIND_ICON = {
  course: GraduationCap,
  book: BookOpen,
  project: Hammer,
} as const;

const COLUMNS = [
  { status: "active", label: "In progress", hint: "Current focus" },
  { status: "queued", label: "Up next", hint: "The queue" },
  { status: "done", label: "Completed", hint: "Shipped & shelved" },
] as const;

export function Learning({ courses }: { courses: CourseData[] }) {
  const router = useRouter();
  const openEntity = useCommandStore((s) => s.openEntity);
  const [, startTransition] = React.useTransition();
  const totalHours = courses.reduce((s, c) => s + c.hours, 0);
  const active = courses.filter((c) => c.status === "active");
  const doneCount = courses.filter((c) => c.status === "done").length;

  return (
    <Stagger className="space-y-4">
      {/* Summary */}
      <Rise>
        <GlassCard className="flex flex-wrap items-center gap-x-10 gap-y-4 p-6">
          <div>
            <p className="text-2xl font-semibold tabular leading-none">
              {totalHours.toFixed(0)}h
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              invested this year
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular leading-none">
              {active.length}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              in progress
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular leading-none">
              {doneCount}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">completed</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-steel sm:flex">
              <Clock className="size-3.5" aria-hidden />
              Avg{" "}
              {active.length > 0
                ? (
                    active.reduce((s, c) => s + c.hours, 0) / active.length
                  ).toFixed(1)
                : 0}
              h per active track
            </span>
            <Button
              variant="glass"
              size="sm"
              onClick={() => openEntity("course")}
            >
              <Plus /> Add
            </Button>
          </div>
        </GlassCard>
      </Rise>

      {/* Pipeline */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = courses.filter((c) => c.status === col.status);
          return (
            <Rise key={col.status}>
              <GlassCard className="h-full">
                <GlassCardHeader>
                  <GlassCardTitle>
                    {col.label}{" "}
                    <span className="ml-1 text-xs font-normal tabular text-steel">
                      {items.length}
                    </span>
                  </GlassCardTitle>
                  <GlassCardDescription>{col.hint}</GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent className="space-y-3">
                  {items.map((course) => {
                    const Icon =
                      KIND_ICON[course.kind as keyof typeof KIND_ICON] ??
                      GraduationCap;
                    return (
                      <div
                        key={course.id}
                        className="group rounded-xl border border-white/6 bg-white/3 p-3.5 transition-all duration-200 hover:border-white/12 hover:bg-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-2.5">
                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/4">
                              <Icon
                                className="size-3.5 text-ice"
                                aria-hidden
                              />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[0.8125rem] font-medium leading-snug">
                                {course.title}
                              </p>
                              <p className="mt-0.5 truncate text-[0.6875rem] text-steel">
                                {course.provider}
                              </p>
                            </div>
                          </div>
                          <span className="flex items-center gap-1">
                            <RowActions
                              label={course.title}
                              onEdit={() =>
                                openEntity("course", {
                                  id: course.id,
                                  initial: toForm.course(course),
                                })
                              }
                              onDelete={() =>
                                startTransition(async () => {
                                  await deleteEntity("course", course.id);
                                  router.refresh();
                                })
                              }
                            />
                            <Badge
                              variant={
                                course.status === "done" ? "emerald" : "steel"
                              }
                            >
                              {course.kind}
                            </Badge>
                          </span>
                        </div>
                        {course.status !== "queued" && (
                          <div className="mt-3 flex items-center gap-3">
                            <Progress
                              value={course.progress}
                              accent={
                                course.status === "done" ? "emerald" : "ice"
                              }
                              className="flex-1"
                              aria-label={`${course.title}: ${course.progress}%`}
                            />
                            <span className="text-[0.6875rem] tabular text-muted-foreground">
                              {course.progress}% · {course.hours}h
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="py-4 text-center text-xs text-steel">
                      Nothing here yet.
                    </p>
                  )}
                </GlassCardContent>
              </GlassCard>
            </Rise>
          );
        })}
      </div>
    </Stagger>
  );
}
