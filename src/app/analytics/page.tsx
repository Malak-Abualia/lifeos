import type { Metadata } from "next";
import { format } from "date-fns";

import { db } from "@/shared/lib/db";
import { daysAgo } from "@/shared/lib/dates";
import { Analytics, type WeeklyRow } from "@/widgets/analytics/analytics";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const since = daysAgo(70);
  const [habits, logs, moods, workouts] = await Promise.all([
    db.habit.count(),
    db.habitLog.findMany({ where: { date: { gte: since } }, select: { date: true } }),
    db.moodEntry.findMany({ where: { date: { gte: since } }, select: { date: true, mood: true } }),
    db.workout.findMany({ where: { date: { gte: since } }, select: { date: true, load: true } }),
  ]);

  // Build 10 Monday-aligned weeks, oldest first
  const weeks: WeeklyRow[] = [];
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const maxLoad = 1; // computed after aggregation
  const raw: { label: string; consistency: number; mood: number; load: number }[] = [];
  for (let w = 9; w >= 0; w--) {
    const start = new Date(monday);
    start.setDate(start.getDate() - w * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const inWin = (d: Date) => d >= start && d < end;
    const daysElapsed = w === 0
      ? Math.min(7, Math.floor((Date.now() - start.getTime()) / 86400000) + 1)
      : 7;
    const slots = habits * daysElapsed;
    const done = logs.filter((l) => inWin(l.date)).length;
    const weekMoods = moods.filter((m) => inWin(m.date));
    const avgMood = weekMoods.length
      ? weekMoods.reduce((s, m) => s + m.mood, 0) / weekMoods.length
      : 0;
    const load = workouts.filter((x) => inWin(x.date)).reduce((s, x) => s + x.load, 0);
    raw.push({
      label: format(start, "MMM d"),
      consistency: slots ? (done / slots) * 100 : 0,
      mood: avgMood,
      load,
    });
  }
  const peakLoad = Math.max(maxLoad, ...raw.map((r) => r.load));
  for (const r of raw) {
    weeks.push({
      label: r.label,
      consistency: r.consistency,
      moodIndex: r.mood * 10,
      loadIndex: (r.load / peakLoad) * 100,
    });
  }

  return <Analytics weeks={weeks} />;
}
