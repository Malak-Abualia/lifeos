"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Wallet,
  HeartPulse,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { GlassCard } from "@/shared/ui/glass-card";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface Insight {
  id: string;
  kind: "positive" | "warning" | "neutral";
  icon: "trend-up" | "trend-down" | "flame" | "wallet" | "heart" | "bulb";
  title: string;
  body: string;
  metric?: string;
}

const ICONS = {
  "trend-up": TrendingUp,
  "trend-down": TrendingDown,
  flame: Flame,
  wallet: Wallet,
  heart: HeartPulse,
  bulb: Lightbulb,
} as const;

const KIND_STYLE = {
  positive: "border-emerald/25 text-emerald bg-emerald/8",
  warning: "border-ruby/25 text-ruby bg-ruby/8",
  neutral: "border-ice/25 text-ice bg-ice/8",
} as const;

export function Insights({ insights }: { insights: Insight[] }) {
  return (
    <Stagger className="space-y-4">
      <Rise>
        <GlassCard className="relative overflow-hidden p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-56 w-100 rounded-full bg-ice/6 blur-3xl"
          />
          <div className="relative flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-ice/25 bg-ice/10">
              <Sparkles className="size-4.5 text-ice" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {insights.length} patterns surfaced from your data
              </h2>
              <p className="text-xs text-muted-foreground">
                Computed locally from the last 30–60 days — no data leaves
                your machine.
              </p>
            </div>
          </div>
        </GlassCard>
      </Rise>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {insights.map((insight) => {
          const Icon = ICONS[insight.icon];
          return (
            <Rise key={insight.id}>
              <GlassCard interactive className="flex h-full gap-4 p-5">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                    KIND_STYLE[insight.kind],
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold leading-snug">
                      {insight.title}
                    </p>
                    {insight.metric && (
                      <Badge
                        variant={
                          insight.kind === "positive"
                            ? "emerald"
                            : insight.kind === "warning"
                              ? "ruby"
                              : "ice"
                        }
                      >
                        {insight.metric}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {insight.body}
                  </p>
                </div>
              </GlassCard>
            </Rise>
          );
        })}
      </div>
    </Stagger>
  );
}
