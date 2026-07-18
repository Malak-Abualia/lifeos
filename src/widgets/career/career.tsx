"use client";

import * as React from "react";
import { format } from "date-fns";
import { Trophy, Send, MessageSquare, Milestone, Star, Plus } from "lucide-react";
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
import { cn } from "@/shared/lib/utils";

export interface CareerEventData {
  id: string;
  date: Date;
  type: string;
  title: string;
  detail: string | null;
  status: string | null;
}

const TYPE_META: Record<
  string,
  { icon: React.ElementType; label: string; tone: string }
> = {
  win: { icon: Trophy, label: "Win", tone: "text-emerald border-emerald/30 bg-emerald/10" },
  application: { icon: Send, label: "Application", tone: "text-ice border-ice/25 bg-ice/8" },
  interview: { icon: MessageSquare, label: "Interview", tone: "text-ice border-ice/25 bg-ice/8" },
  offer: { icon: Star, label: "Offer", tone: "text-emerald border-emerald/30 bg-emerald/10" },
  milestone: { icon: Milestone, label: "Milestone", tone: "text-[#7db8ea] border-sapphire/30 bg-sapphire/10" },
};

const APP_STATUS_VARIANT = {
  applied: "steel",
  screening: "sapphire",
  interview: "ice",
  offer: "emerald",
  rejected: "ruby",
} as const;

export function Career({ events }: { events: CareerEventData[] }) {
  const router = useRouter();
  const openEntity = useCommandStore((s) => s.openEntity);
  const [, startTransition] = React.useTransition();
  const wins = events.filter((e) => e.type === "win").length;
  const applications = events.filter(
    (e) => e.type === "application" || e.type === "interview",
  );
  const activeApps = applications.filter(
    (e) => e.status && !["rejected", "offer"].includes(e.status),
  );

  return (
    <Stagger className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Timeline */}
      <Rise className="xl:col-span-2">
        <GlassCard className="h-full">
          <GlassCardHeader className="flex-row items-center justify-between">
            <div>
              <GlassCardTitle>Trajectory</GlassCardTitle>
              <GlassCardDescription>
                {wins} wins logged · every entry is ammunition for the next
                review
              </GlassCardDescription>
            </div>
            <Button
              variant="glass"
              size="sm"
              onClick={() => openEntity("careerEvent")}
            >
              <Plus /> Log event
            </Button>
          </GlassCardHeader>
          <GlassCardContent>
            <ol className="relative space-y-6 before:absolute before:inset-y-1 before:left-[13px] before:w-px before:bg-white/8">
              {events.map((event) => {
                const meta = TYPE_META[event.type] ?? TYPE_META.milestone;
                return (
                  <li key={event.id} className="group relative flex gap-4 pl-0">
                    <span
                      className={cn(
                        "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border backdrop-blur",
                        meta.tone,
                      )}
                    >
                      <meta.icon className="size-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.8125rem] font-medium leading-snug">
                          {event.title}
                        </p>
                        <RowActions
                          label={event.title}
                          onEdit={() =>
                            openEntity("careerEvent", {
                              id: event.id,
                              initial: toForm.careerEvent(event),
                            })
                          }
                          onDelete={() =>
                            startTransition(async () => {
                              await deleteEntity("careerEvent", event.id);
                              router.refresh();
                            })
                          }
                        />
                        {event.status && (
                          <Badge
                            variant={
                              APP_STATUS_VARIANT[
                                event.status as keyof typeof APP_STATUS_VARIANT
                              ] ?? "steel"
                            }
                          >
                            {event.status}
                          </Badge>
                        )}
                      </div>
                      {event.detail && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {event.detail}
                        </p>
                      )}
                      <p className="mt-1 text-[0.6875rem] tabular text-steel">
                        {format(event.date, "MMM d, yyyy")} · {meta.label}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Applications pipeline */}
      <Rise>
        <GlassCard className="h-full">
          <GlassCardHeader>
            <GlassCardTitle>Applications</GlassCardTitle>
            <GlassCardDescription>
              {activeApps.length} in motion
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-white/6 bg-white/3 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-[0.8125rem] font-medium">
                    {app.title.replace(/^(Staff|Principal) Engineer — /, "")}
                  </p>
                  <Badge
                    variant={
                      APP_STATUS_VARIANT[
                        app.status as keyof typeof APP_STATUS_VARIANT
                      ] ?? "steel"
                    }
                  >
                    {app.status ?? "—"}
                  </Badge>
                </div>
                <p className="mt-1 text-[0.6875rem] text-steel">
                  {app.title.match(/^(Staff|Principal) Engineer/)?.[0] ??
                    "Role"}{" "}
                  · {format(app.date, "MMM d")}
                </p>
                {/* Stage dots */}
                <div
                  className="mt-2.5 flex items-center gap-1.5"
                  aria-hidden
                >
                  {(["applied", "screening", "interview", "offer"] as const).map(
                    (stage, i) => {
                      const stages = ["applied", "screening", "interview", "offer"];
                      const cur = stages.indexOf(app.status ?? "applied");
                      const rejected = app.status === "rejected";
                      return (
                        <span
                          key={stage}
                          className={cn(
                            "h-1 flex-1 rounded-full",
                            rejected
                              ? "bg-ruby/25"
                              : i <= cur
                                ? "bg-(--chart-1)"
                                : "bg-white/8",
                          )}
                        />
                      );
                    },
                  )}
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <p className="py-4 text-center text-xs text-steel">
                No applications tracked.
              </p>
            )}
          </GlassCardContent>
        </GlassCard>
      </Rise>
    </Stagger>
  );
}
