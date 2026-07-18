"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as Slider from "@radix-ui/react-slider";

import { checkInMood } from "@/features/mood/actions";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface MoodData {
  date: Date;
  mood: number;
  energy: number;
  tags: string;
}

const TAG_OPTIONS = [
  "focused",
  "calm",
  "energized",
  "grateful",
  "social",
  "inspired",
  "tired",
  "anxious",
  "stressed",
  "restless",
];

const SERIES = [
  { key: "mood", label: "Mood", color: "var(--chart-1)" },
  { key: "energy", label: "Energy", color: "var(--chart-2)" },
] as const;

function MoodTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; stroke: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-raised rounded-xl px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-0.5 flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ background: p.stroke }}
            aria-hidden
          />
          <span className="capitalize text-muted-foreground">{p.dataKey}</span>
          <span className="font-semibold tabular">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function ScaleSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold tabular text-ice">{value}</span>
      </div>
      <Slider.Root
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        className="relative flex h-5 w-full touch-none select-none items-center"
        aria-label={label}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-white/8">
          <Slider.Range className="absolute h-full rounded-full bg-linear-to-r from-sapphire to-ice" />
        </Slider.Track>
        <Slider.Thumb className="block size-4 rounded-full border border-ice/60 bg-arctic shadow-[0_0_12px_rgba(110,198,255,0.5)] transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ice" />
      </Slider.Root>
    </div>
  );
}

export function Mood({ entries }: { entries: MoodData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const todayEntry = entries[entries.length - 1];
  const [mood, setMood] = React.useState(todayEntry?.mood ?? 7);
  const [energy, setEnergy] = React.useState(todayEntry?.energy ?? 6);
  const [tags, setTags] = React.useState<string[]>(
    todayEntry?.tags ? todayEntry.tags.split(",").filter(Boolean) : [],
  );
  const [saved, setSaved] = React.useState(false);

  const chartData = entries.map((e) => ({
    day: format(e.date, "MMM d"),
    mood: e.mood,
    energy: e.energy,
  }));

  const avg30 = (
    entries.reduce((s, e) => s + e.mood, 0) / Math.max(1, entries.length)
  ).toFixed(1);

  /* Tag frequency across the window */
  const tagCounts = new Map<string, number>();
  for (const e of entries) {
    for (const t of e.tags.split(",").filter(Boolean)) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxTag = topTags[0]?.[1] ?? 1;

  function toggleTag(tag: string) {
    setTags((t) =>
      t.includes(tag) ? t.filter((x) => x !== tag) : t.length < 6 ? [...t, tag] : t,
    );
  }

  function handleSave() {
    startTransition(async () => {
      await checkInMood({ mood, energy, tags });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  return (
    <Stagger className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Chart */}
        <Rise className="xl:col-span-2">
          <GlassCard className="h-full">
            <GlassCardHeader className="flex-row items-baseline justify-between">
              <div>
                <GlassCardTitle>Emotional weather</GlassCardTitle>
                <GlassCardDescription>
                  Last 30 days · 30-day average mood {avg30}
                </GlassCardDescription>
              </div>
              {/* Legend */}
              <div className="flex gap-4">
                {SERIES.map((s) => (
                  <span
                    key={s.key}
                    className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground"
                  >
                    <span
                      className="h-0.5 w-4 rounded-full"
                      style={{ background: s.color }}
                      aria-hidden
                    />
                    {s.label}
                  </span>
                ))}
              </div>
            </GlassCardHeader>
            <GlassCardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 6"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b98a9", fontSize: 10 }}
                    interval={6}
                    dy={6}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[2, 4, 6, 8, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b98a9", fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={<MoodTooltip />}
                    cursor={{ stroke: "rgba(110,198,255,0.25)", strokeWidth: 1 }}
                  />
                  {SERIES.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                        stroke: "#08111F",
                        strokeWidth: 2,
                      }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </GlassCardContent>
          </GlassCard>
        </Rise>

        {/* Check-in */}
        <Rise>
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Today&apos;s check-in</GlassCardTitle>
              <GlassCardDescription>
                A 20-second pulse — future you will thank you
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-6">
              <ScaleSlider label="Mood" value={mood} onChange={setMood} />
              <ScaleSlider label="Energy" value={energy} onChange={setEnergy} />
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Tags{" "}
                  <span className="text-steel">({tags.length}/6)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_OPTIONS.map((tag) => {
                    const on = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-pressed={on}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[0.6875rem] transition-all duration-200",
                          on
                            ? "border-ice/40 bg-ice/12 text-ice"
                            : "border-white/10 bg-white/3 text-muted-foreground hover:border-white/20",
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="w-full"
              >
                {saved ? "Saved ✓" : isPending ? "Saving…" : "Save check-in"}
              </Button>
            </GlassCardContent>
          </GlassCard>
        </Rise>
      </div>

      {/* Tag frequency */}
      <Rise>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>What shows up most</GlassCardTitle>
            <GlassCardDescription>
              Tag frequency over the last 30 days
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="flex flex-wrap items-center gap-2.5">
            {topTags.map(([tag, count]) => (
              <Badge
                key={tag}
                variant="ice"
                className="px-3 py-1 text-xs"
                style={{ opacity: 0.45 + 0.55 * (count / maxTag) }}
              >
                {tag} <span className="tabular text-arctic/70">{count}</span>
              </Badge>
            ))}
          </GlassCardContent>
        </GlassCard>
      </Rise>
    </Stagger>
  );
}
