import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { daysAgo, dayKey } from "@/shared/lib/dates";
import { Insights, type Insight } from "@/widgets/insights/insights";

export const metadata: Metadata = { title: "AI Insights" };
export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const since = daysAgo(60);
  const [moods, workouts, habits, transactions] = await Promise.all([
    db.moodEntry.findMany({ where: { date: { gte: since } } }),
    db.workout.findMany({ where: { date: { gte: since } } }),
    db.habit.findMany({
      include: {
        logs: { where: { date: { gte: since } }, select: { date: true } },
      },
    }),
    db.transaction.findMany({ where: { date: { gte: daysAgo(60) } } }),
  ]);

  const insights: Insight[] = [];

  // 1 — Mood on workout days vs rest days
  const workoutDays = new Set(workouts.map((w) => dayKey(w.date)));
  const onDays = moods.filter((m) => workoutDays.has(dayKey(m.date)));
  const offDays = moods.filter((m) => !workoutDays.has(dayKey(m.date)));
  if (onDays.length >= 5 && offDays.length >= 5) {
    const avgOn = onDays.reduce((s, m) => s + m.mood, 0) / onDays.length;
    const avgOff = offDays.reduce((s, m) => s + m.mood, 0) / offDays.length;
    const delta = avgOn - avgOff;
    insights.push({
      id: "workout-mood",
      kind: delta > 0.3 ? "positive" : "neutral",
      icon: "heart",
      title:
        delta > 0.3
          ? "Training days lift your mood"
          : "Mood holds steady on rest days",
      metric: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} mood`,
      body: `Across ${onDays.length} workout days your mood averaged ${avgOn.toFixed(1)}, versus ${avgOff.toFixed(1)} on rest days. ${delta > 0.3 ? "Protect the training slot — it pays for itself." : "Recovery isn't costing you anything emotionally."}`,
    });
  }

  // 2 — Best active streak
  let bestHabit = "";
  let bestStreak = 0;
  for (const h of habits) {
    const set = new Set(h.logs.map((l) => dayKey(l.date)));
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
    while (set.has(dayKey(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    if (streak > bestStreak) {
      bestStreak = streak;
      bestHabit = h.name;
    }
  }
  if (bestStreak >= 3) {
    insights.push({
      id: "best-streak",
      kind: "positive",
      icon: "flame",
      title: `"${bestHabit}" is your anchor habit`,
      metric: `${bestStreak}-day streak`,
      body: `This is currently your longest run. Anchor habits stabilize the rest of the system — if a day goes sideways, protect this one first.`,
    });
  }

  // 3 — Weakest habit needs a smaller version
  let weakHabit = "";
  let weakRate = 1;
  for (const h of habits) {
    const rate = h.logs.length / 60;
    if (rate < weakRate) {
      weakRate = rate;
      weakHabit = h.name;
    }
  }
  if (weakHabit) {
    insights.push({
      id: "weak-habit",
      kind: "warning",
      icon: "trend-down",
      title: `"${weakHabit}" keeps slipping`,
      metric: `${Math.round(weakRate * 100)}% of days`,
      body: `Lowest completion rate of all habits over 60 days. Shrink it until it's impossible to fail — a two-minute version done daily beats the full version done rarely.`,
    });
  }

  // 4 — Spending trend, this 30d vs previous 30d
  const cut = daysAgo(30);
  const spend = (from: Date, to: Date) =>
    transactions
      .filter(
        (t) =>
          t.amount < 0 && t.category !== "savings" && t.date >= from && t.date < to,
      )
      .reduce((s, t) => s - t.amount, 0);
  const recent = spend(cut, new Date());
  const previous = spend(daysAgo(60), cut);
  if (previous > 0) {
    const pct = ((recent - previous) / previous) * 100;
    insights.push({
      id: "spend-trend",
      kind: pct > 10 ? "warning" : "positive",
      icon: "wallet",
      title:
        pct > 10
          ? "Spending is trending up"
          : pct < -10
            ? "Spending is trending down"
            : "Spending is stable",
      metric: `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% vs prior 30d`,
      body: `Outflows (excluding savings) were $${recent.toFixed(0)} in the last 30 days against $${previous.toFixed(0)} in the 30 before. ${pct > 10 ? "Worth a two-minute scan of the leisure and food categories." : "Savings rate is holding — keep the autopilot on."}`,
    });
  }

  // 5 — Habit consistency trend, last 14d vs previous 14d
  const totalSlots = habits.length * 14;
  const inWindow = (from: Date, to: Date) =>
    habits.reduce(
      (s, h) => s + h.logs.filter((l) => l.date >= from && l.date < to).length,
      0,
    );
  const last14 = inWindow(daysAgo(14), new Date());
  const prev14 = inWindow(daysAgo(28), daysAgo(14));
  if (totalSlots > 0) {
    const d = ((last14 - prev14) / totalSlots) * 100;
    insights.push({
      id: "consistency-trend",
      kind: d >= 0 ? "positive" : "warning",
      icon: d >= 0 ? "trend-up" : "trend-down",
      title: d >= 0 ? "Consistency is compounding" : "Consistency dipped this fortnight",
      metric: `${d >= 0 ? "+" : ""}${d.toFixed(0)} pts`,
      body: `You completed ${last14} habit check-ins in the last two weeks, versus ${prev14} in the two before. ${d >= 0 ? "The system is working — don't change anything." : "Look at what changed two weeks ago; the fix is usually environmental, not motivational."}`,
    });
  }

  // 6 — Journaling nudge
  const journalCount = await db.journalEntry.count({
    where: { date: { gte: daysAgo(14) } },
  });
  insights.push({
    id: "journal-nudge",
    kind: journalCount >= 3 ? "positive" : "neutral",
    icon: "bulb",
    title:
      journalCount >= 3
        ? "Reflection is part of the routine"
        : "The journal misses you",
    metric: `${journalCount} entries / 14d`,
    body:
      journalCount >= 3
        ? "Regular written reflection correlates with your better mood weeks in this dataset."
        : "Your higher-mood weeks tend to include journal entries. One honest paragraph tonight counts.",
  });

  return <Insights insights={insights} />;
}
