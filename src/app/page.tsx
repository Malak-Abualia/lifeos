import type { Metadata } from "next";
import { format } from "date-fns";

import { db } from "@/shared/lib/db";
import { daysAgo, dayKey, startOfToday } from "@/shared/lib/dates";
import {
  DashboardOverview,
  type DashboardData,
} from "@/widgets/dashboard/overview";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const since = daysAgo(14);
  const [tasksToday, habits, logs14, moods14, workouts7] = await Promise.all([
    db.task.findMany({ where: { date: startOfToday() } }),
    db.habit.findMany({
      include: {
        logs: { where: { date: { gte: daysAgo(60) } }, select: { date: true } },
      },
    }),
    db.habitLog.findMany({ where: { date: { gte: since } }, select: { date: true } }),
    db.moodEntry.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    db.workout.findMany({ where: { date: { gte: daysAgo(7) } } }),
  ]);

  /* Stats */
  const doneTasks = tasksToday.filter((t) => t.done);
  const focusMin = doneTasks.reduce((s, t) => s + t.durationMin, 0);

  const slots7 = habits.length * 7;
  const done7 = logs14.filter((l) => l.date >= daysAgo(7)).length;
  const donePrev7 = logs14.length - done7;
  const consistency = slots7 ? Math.round((done7 / slots7) * 100) : 0;
  const consistencyPrev = slots7 ? Math.round((donePrev7 / slots7) * 100) : 0;

  const goals = await db.goal.findMany({ include: { keyResults: true } });
  const goalProgress = (g: (typeof goals)[number]) =>
    g.keyResults.length
      ? g.keyResults.reduce((s, kr) => {
          const p =
            kr.target === 0
              ? 0
              : kr.target < kr.current
                ? Math.min(1, kr.target / kr.current)
                : Math.min(1, kr.current / kr.target);
          return s + p;
        }, 0) / g.keyResults.length
      : 0;
  const onTrack = goals.filter((g) => goalProgress(g) >= 0.6).length;

  const moods7 = moods14.filter((m) => m.date >= daysAgo(7));
  const moodsPrev7 = moods14.filter((m) => m.date < daysAgo(7));
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  const avgMood = avg(moods7.map((m) => m.mood));
  const avgMoodPrev = avg(moodsPrev7.map((m) => m.mood));
  const moodDelta = avgMood - avgMoodPrev;

  /* Momentum: per-day composite over last 7 days */
  const momentum: DashboardData["momentum"] = [];
  for (let ago = 6; ago >= 0; ago--) {
    const d = daysAgo(ago);
    const key = dayKey(d);
    const habitsDone = logs14.filter((l) => dayKey(l.date) === key).length;
    const habitScore = habits.length ? habitsDone / habits.length : 0;
    const mood = moods14.find((m) => dayKey(m.date) === key);
    const moodScore = mood ? mood.mood / 10 : 0.5;
    const trained = workouts7.some((w) => dayKey(w.date) === key) ? 1 : 0;
    momentum.push({
      day: format(d, "EEE"),
      score: Math.round((habitScore * 0.45 + moodScore * 0.4 + trained * 0.15) * 100),
    });
  }

  /* Streaks: top 4 habits by current streak */
  const streaks = habits
    .map((h) => {
      const set = new Set(h.logs.map((l) => dayKey(l.date)));
      let streak = 0;
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
      while (set.has(dayKey(d))) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
      return { name: h.name, days: streak, target: h.targetPerWeek * 2 };
    })
    .sort((a, b) => b.days - a.days)
    .slice(0, 4);

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Burning the midnight oil"
    : hour < 12 ? "Good morning"
    : hour < 18 ? "Good afternoon"
    : "Good evening";

  const data: DashboardData = {
    greeting,
    stats: [
      {
        key: "focus",
        label: "Focus completed today",
        value: `${(focusMin / 60).toFixed(1)}h`,
        delta: `${doneTasks.length} tasks`,
        up: focusMin > 0,
      },
      {
        key: "habits",
        label: "Habit consistency (7d)",
        value: `${consistency}%`,
        delta: `${consistency - consistencyPrev >= 0 ? "+" : ""}${consistency - consistencyPrev}%`,
        up: consistency >= consistencyPrev,
      },
      {
        key: "goals",
        label: "Goals on track",
        value: `${onTrack} / ${goals.length}`,
        delta: `${goals.length ? Math.round((onTrack / goals.length) * 100) : 0}%`,
        up: goals.length > 0 && onTrack / goals.length >= 0.5,
      },
      {
        key: "mood",
        label: "Avg mood (7d)",
        value: avgMood.toFixed(1),
        delta: `${moodDelta >= 0 ? "+" : ""}${moodDelta.toFixed(1)}`,
        up: moodDelta >= 0,
      },
    ],
    momentum,
    streaks,
    today: { done: doneTasks.length, total: tasksToday.length },
  };

  return <DashboardOverview data={data} />;
}
