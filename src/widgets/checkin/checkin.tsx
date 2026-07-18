"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";
import { Check, Dumbbell, Wallet, Sparkles } from "lucide-react";

import { toggleHabitToday } from "@/features/habits/actions";
import { submitDailyCheckin } from "@/features/crud/actions";
import { useCommandStore } from "@/features/crud/store";
import { Button } from "@/shared/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Input, Textarea } from "@/shared/ui/input";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface CheckinData {
  habits: { id: string; name: string; emoji: string; checkedToday: boolean }[];
  mood: { mood: number; energy: number; tags: string; note: string | null } | null;
  journaledToday: boolean;
  workoutsToday: number;
}

const TAG_OPTIONS = [
  "focused", "calm", "energized", "grateful", "social",
  "inspired", "tired", "anxious", "stressed", "restless",
];

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] font-semibold tabular",
        "transition-all duration-300 ease-(--ease-swift)",
        done
          ? "border-emerald bg-emerald text-midnight shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          : "border-white/15 bg-white/4 text-muted-foreground",
      )}
    >
      {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
    </span>
  );
}

function MiniSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
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

export function Checkin({ data }: { data: CheckinData }) {
  const router = useRouter();
  const openEntity = useCommandStore((s) => s.openEntity);
  const [isPending, startTransition] = React.useTransition();

  const [checked, setChecked] = React.useState<Record<string, boolean>>(
    Object.fromEntries(data.habits.map((h) => [h.id, h.checkedToday])),
  );
  const [mood, setMood] = React.useState(data.mood?.mood ?? 7);
  const [energy, setEnergy] = React.useState(data.mood?.energy ?? 6);
  const [tags, setTags] = React.useState<string[]>(
    data.mood?.tags ? data.mood.tags.split(",").filter(Boolean) : [],
  );
  const [journalText, setJournalText] = React.useState("");
  const [gratitude, setGratitude] = React.useState("");
  const [tomorrow, setTomorrow] = React.useState(["", "", ""]);
  const [done, setDone] = React.useState(false);

  const habitsDone = Object.values(checked).filter(Boolean).length;
  const steps = {
    habits: habitsDone > 0,
    mood: data.mood !== null || done,
    journal: data.journaledToday || journalText.trim().length > 0,
    tomorrow: tomorrow.some((t) => t.trim()),
  };
  const stepCount = Object.values(steps).filter(Boolean).length;

  function toggleHabit(id: string) {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
    startTransition(() => toggleHabitToday(id));
  }

  function toggleTag(tag: string) {
    setTags((t) =>
      t.includes(tag) ? t.filter((x) => x !== tag) : t.length < 6 ? [...t, tag] : t,
    );
  }

  function handleSubmit() {
    startTransition(async () => {
      await submitDailyCheckin({
        mood,
        energy,
        tags,
        journal: journalText.trim()
          ? { content: journalText.trim(), gratitude: gratitude.trim() || undefined }
          : undefined,
        tomorrowTasks: tomorrow.map((t) => t.trim()).filter(Boolean),
      });
      setDone(true);
      setJournalText("");
      setGratitude("");
      setTomorrow(["", "", ""]);
      router.refresh();
    });
  }

  return (
    <Stagger className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <Rise>
        <GlassCard className="relative overflow-hidden p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-0 h-48 w-96 rounded-full bg-emerald/6 blur-3xl"
          />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Daily check-in
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Four quick steps — usually under three minutes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[steps.habits, steps.mood, steps.journal, steps.tomorrow].map(
                (s, i) => (
                  <motion.span
                    key={i}
                    animate={{ scale: s ? 1 : 0.85, opacity: s ? 1 : 0.5 }}
                    className={cn(
                      "h-1.5 w-8 rounded-full",
                      s ? "bg-emerald" : "bg-white/10",
                    )}
                  />
                ),
              )}
              <span className="ml-1 text-xs tabular text-muted-foreground">
                {stepCount}/4
              </span>
            </div>
          </div>
        </GlassCard>
      </Rise>

      {/* 1 — Habits */}
      <Rise>
        <GlassCard>
          <GlassCardHeader className="flex-row items-center gap-3">
            <StepBadge n={1} done={steps.habits} />
            <div>
              <GlassCardTitle>Habits</GlassCardTitle>
              <GlassCardDescription>
                {habitsDone}/{data.habits.length} — saves instantly on tap
              </GlassCardDescription>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="flex flex-wrap gap-2.5">
            {data.habits.map((habit) => {
              const on = checked[habit.id];
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => toggleHabit(habit.id)}
                  aria-pressed={on}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[0.8125rem]",
                    "transition-all duration-200 ease-(--ease-swift) active:scale-[0.96]",
                    on
                      ? "border-emerald/40 bg-emerald/12 text-emerald"
                      : "border-white/10 bg-white/4 text-muted-foreground hover:border-white/20 hover:text-foreground",
                  )}
                >
                  <span aria-hidden>{habit.emoji}</span>
                  {habit.name}
                  {on && <Check className="size-3.5" aria-hidden />}
                </button>
              );
            })}
            {data.habits.length === 0 && (
              <button
                type="button"
                onClick={() => openEntity("habit")}
                className="rounded-xl border border-dashed border-white/15 px-4 py-2 text-xs text-steel transition-colors hover:border-ice/40 hover:text-ice"
              >
                + Create your first habit
              </button>
            )}
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* 2 — Mood */}
      <Rise>
        <GlassCard>
          <GlassCardHeader className="flex-row items-center gap-3">
            <StepBadge n={2} done={steps.mood} />
            <div>
              <GlassCardTitle>Mood & energy</GlassCardTitle>
              <GlassCardDescription>
                {data.mood ? "Already logged — adjust freely" : "How was today, honestly?"}
              </GlassCardDescription>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="space-y-5">
            <div className="flex gap-8">
              <MiniSlider label="Mood" value={mood} onChange={setMood} />
              <MiniSlider label="Energy" value={energy} onChange={setEnergy} />
            </div>
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
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* 3 — Journal */}
      <Rise>
        <GlassCard>
          <GlassCardHeader className="flex-row items-center gap-3">
            <StepBadge n={3} done={steps.journal} />
            <div>
              <GlassCardTitle>One honest paragraph</GlassCardTitle>
              <GlassCardDescription>
                {data.journaledToday
                  ? "You already journaled today — more is optional"
                  : "What actually happened today?"}
              </GlassCardDescription>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="space-y-3">
            <Textarea
              rows={3}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Skip freely — but one line beats zero."
              aria-label="Journal entry"
            />
            <Input
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="One thing you're grateful for (optional)"
              aria-label="Gratitude"
            />
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* 4 — Tomorrow */}
      <Rise>
        <GlassCard>
          <GlassCardHeader className="flex-row items-center gap-3">
            <StepBadge n={4} done={steps.tomorrow} />
            <div>
              <GlassCardTitle>Tomorrow&apos;s top 3</GlassCardTitle>
              <GlassCardDescription>
                They land in the Planner backlog for tomorrow
              </GlassCardDescription>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="space-y-2.5">
            {tomorrow.map((t, i) => (
              <Input
                key={i}
                value={t}
                onChange={(e) =>
                  setTomorrow((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))
                }
                placeholder={`Priority ${i + 1}${i > 0 ? " (optional)" : ""}`}
                aria-label={`Tomorrow priority ${i + 1}`}
                maxLength={120}
              />
            ))}
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Extras + submit */}
      <Rise className="flex flex-wrap items-center gap-2.5">
        <Button variant="glass" size="sm" onClick={() => openEntity("workout")}>
          <Dumbbell /> Log workout
          {data.workoutsToday > 0 && (
            <span className="tabular text-emerald">· {data.workoutsToday} today</span>
          )}
        </Button>
        <Button variant="glass" size="sm" onClick={() => openEntity("transaction")}>
          <Wallet /> Add expense
        </Button>
        <span className="flex-1" />
        <Button size="lg" onClick={handleSubmit} disabled={isPending}>
          {done ? (
            <>
              <Sparkles /> Saved — see you tomorrow
            </>
          ) : isPending ? (
            "Saving…"
          ) : (
            "Complete check-in"
          )}
        </Button>
      </Rise>
    </Stagger>
  );
}
