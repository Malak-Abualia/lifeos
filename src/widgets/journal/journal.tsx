"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Feather, Sparkle } from "lucide-react";

import { createJournalEntry } from "@/features/journal/actions";
import {
  journalEntrySchema,
  type JournalEntryInput,
} from "@/features/journal/schema";
import { Button } from "@/shared/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Input, Textarea, Label } from "@/shared/ui/input";
import { Stagger, Rise } from "@/shared/ui/animate";

export interface JournalEntryData {
  id: string;
  date: Date;
  title: string;
  content: string;
  gratitude: string | null;
}

const PROMPTS = [
  "What moved the needle today?",
  "What drained you — and was it worth it?",
  "What would you tell yourself this morning?",
  "What deserves more of your attention tomorrow?",
];

export function Journal({ entries }: { entries: JournalEntryData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const prompt = React.useMemo(
    () => PROMPTS[new Date().getDate() % PROMPTS.length],
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JournalEntryInput>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: { title: "", content: "", gratitude: "" },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      await createJournalEntry(data);
      reset();
      router.refresh();
    });
  });

  return (
    <Stagger className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      {/* Compose */}
      <Rise className="xl:col-span-2">
        <GlassCard className="sticky top-24">
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Feather className="size-4 text-ice" aria-hidden />
              New entry
            </GlassCardTitle>
            <GlassCardDescription>{prompt}</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="journal-title">Title</Label>
                <Input
                  id="journal-title"
                  placeholder="Name today"
                  aria-invalid={!!errors.title}
                  {...register("title")}
                />
                {errors.title && (
                  <p role="alert" className="text-[0.6875rem] text-ruby">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="journal-content">Reflection</Label>
                <Textarea
                  id="journal-content"
                  rows={7}
                  placeholder="Write freely — nobody's watching."
                  aria-invalid={!!errors.content}
                  {...register("content")}
                />
                {errors.content && (
                  <p role="alert" className="text-[0.6875rem] text-ruby">
                    {errors.content.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="journal-gratitude">
                  One thing you&apos;re grateful for{" "}
                  <span className="text-steel">(optional)</span>
                </Label>
                <Input
                  id="journal-gratitude"
                  placeholder="Small counts."
                  {...register("gratitude")}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving…" : "Save entry"}
              </Button>
            </form>
          </GlassCardContent>
        </GlassCard>
      </Rise>

      {/* Feed */}
      <div className="space-y-4 xl:col-span-3">
        {entries.map((entry) => (
          <Rise key={entry.id}>
            <GlassCard interactive>
              <GlassCardHeader className="flex-row items-baseline justify-between">
                <GlassCardTitle className="text-[0.9375rem]">
                  {entry.title}
                </GlassCardTitle>
                <span className="shrink-0 text-[0.6875rem] tabular text-steel">
                  {format(entry.date, "EEE, MMM d")}
                </span>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {entry.content}
                </p>
                {entry.gratitude && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald/15 bg-emerald/6 px-3.5 py-2.5 text-xs leading-relaxed text-emerald/90">
                    <Sparkle className="mt-0.5 size-3 shrink-0" aria-hidden />
                    <span>
                      <span className="font-medium">Grateful for:</span>{" "}
                      {entry.gratitude}
                    </span>
                  </p>
                )}
              </GlassCardContent>
            </GlassCard>
          </Rise>
        ))}
        {entries.length === 0 && (
          <Rise>
            <GlassCard className="p-10 text-center text-sm text-steel">
              No entries yet — the first one is the hardest.
            </GlassCard>
          </Rise>
        )}
      </div>
    </Stagger>
  );
}
