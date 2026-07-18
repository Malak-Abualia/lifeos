"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, Moon, Sun, User } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Input, Label } from "@/shared/ui/input";
import { Kbd } from "@/shared/ui/kbd";
import { Separator } from "@/shared/ui/separator";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  focusHoursTarget: z.number().min(0).max(16),
  weekStartsMonday: z.boolean(),
});

type ProfileInput = z.infer<typeof profileSchema>;

const PROFILE_KEY = "lifeos.profile";

const SHORTCUTS: Array<[string, string]> = [
  ["⌘K", "Open command palette"],
  ["G then D", "Go to Dashboard"],
  ["G then P", "Go to Planner"],
  ["G then H", "Go to Habits"],
  ["N", "New task (on Planner)"],
  ["Esc", "Close dialogs"],
];

export function Settings() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [savedFlash, setSavedFlash] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", focusHoursTarget: 4, weekStartsMonday: true },
  });

  // Hydrate saved profile from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) reset(profileSchema.parse(JSON.parse(raw)));
    } catch {
      /* corrupted or legacy value — keep defaults */
    }
  }, [reset]);

  const onSubmit = handleSubmit((data) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  });

  async function handleExport() {
    const res = await fetch("/api/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Stagger className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* Profile */}
      <Rise>
        <GlassCard className="h-full">
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <User className="size-4 text-ice" aria-hidden /> Profile
            </GlassCardTitle>
            <GlassCardDescription>
              Stored locally on this device
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="settings-name">Display name</Label>
                <Input
                  id="settings-name"
                  placeholder="How should LifeOS greet you?"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p role="alert" className="text-[0.6875rem] text-ruby">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-focus">
                  Daily deep-focus target (hours)
                </Label>
                <Input
                  id="settings-focus"
                  type="number"
                  step="0.5"
                  min={0}
                  max={16}
                  aria-invalid={!!errors.focusHoursTarget}
                  {...register("focusHoursTarget", { valueAsNumber: true })}
                />
                {errors.focusHoursTarget && (
                  <p role="alert" className="text-[0.6875rem] text-ruby">
                    {errors.focusHoursTarget.message}
                  </p>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-(--sapphire)"
                  {...register("weekStartsMonday")}
                />
                Weeks start on Monday
              </label>
              <Button type="submit">
                {savedFlash ? "Saved ✓" : "Save profile"}
              </Button>
            </form>
          </GlassCardContent>
        </GlassCard>
      </Rise>

      <div className="space-y-4">
        {/* Appearance */}
        <Rise>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Appearance</GlassCardTitle>
              <GlassCardDescription>
                Deep Winter is designed dark-first
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="flex gap-2.5">
              {mounted &&
                (
                  [
                    { id: "dark", label: "Deep Winter", icon: Moon },
                    { id: "light", label: "Daylight", icon: Sun },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    aria-pressed={resolvedTheme === t.id}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium",
                      "transition-all duration-200 ease-(--ease-swift)",
                      resolvedTheme === t.id
                        ? "border-ice/40 bg-ice/10 text-ice shadow-[0_0_20px_rgba(110,198,255,0.12)]"
                        : "border-white/10 bg-white/3 text-muted-foreground hover:border-white/20",
                    )}
                  >
                    <t.icon className="size-4" aria-hidden />
                    {t.label}
                  </button>
                ))}
            </GlassCardContent>
          </GlassCard>
        </Rise>

        {/* Data */}
        <Rise>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Your data</GlassCardTitle>
              <GlassCardDescription>
                Everything lives in a local SQLite file — export it any time
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <Button variant="glass" onClick={handleExport}>
                <Download /> Export all data as JSON
              </Button>
            </GlassCardContent>
          </GlassCard>
        </Rise>

        {/* Shortcuts */}
        <Rise>
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Keyboard shortcuts</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="space-y-2.5">
              {SHORTCUTS.map(([keys, desc], i) => (
                <React.Fragment key={keys}>
                  {i > 0 && <Separator className="opacity-50" />}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{desc}</span>
                    <span className="flex gap-1">
                      {keys.split(" then ").map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </GlassCardContent>
          </GlassCard>
        </Rise>
      </div>
    </Stagger>
  );
}
