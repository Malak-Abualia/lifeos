/**
 * Server-side analytics engine shared by AI Insights and the Review pages.
 * All rules operate on an arbitrary [from, to) window so the same logic
 * powers 60-day insights, weekly reviews, and yearly retrospectives.
 */
import { db } from "@/shared/lib/db";
import { dayKey } from "@/shared/lib/dates";
import type { Insight } from "@/widgets/insights/insights";

export interface PeriodSummary {
  label: string;
  from: Date;
  to: Date;
  tasksDone: number;
  tasksTotal: number;
  habitConsistency: number; // 0–100
  avgMood: number | null;
  bestDay: { date: Date; mood: number } | null;
  workouts: number;
  trainingMinutes: number;
  journalEntries: number;
  income: number;
  spending: number; // positive number, savings excluded
  saved: number;
  topSpendCategory: { category: string; amount: number } | null;
  careerWins: number;
  coursesCompleted: number;
}

export async function computePeriodSummary(
  from: Date,
  to: Date,
  label: string,
): Promise<PeriodSummary> {
  const [tasks, habits, logs, moods, workouts, journal, transactions, career, courses] =
    await Promise.all([
      db.task.findMany({ where: { date: { gte: from, lt: to } } }),
      db.habit.count(),
      db.habitLog.count({ where: { date: { gte: from, lt: to } } }),
      db.moodEntry.findMany({ where: { date: { gte: from, lt: to } } }),
      db.workout.findMany({ where: { date: { gte: from, lt: to } } }),
      db.journalEntry.count({ where: { date: { gte: from, lt: to } } }),
      db.transaction.findMany({ where: { date: { gte: from, lt: to } } }),
      db.careerEvent.count({
        where: { date: { gte: from, lt: to }, type: "win" },
      }),
      db.course.count({ where: { status: "done" } }),
    ]);

  const days = Math.max(
    1,
    Math.min(
      Math.round((to.getTime() - from.getTime()) / 86400000),
      Math.round((Date.now() - from.getTime()) / 86400000) + 1,
    ),
  );
  const slots = habits * days;

  const bestMood = moods.reduce<PeriodSummary["bestDay"]>((best, m) => {
    if (!best || m.mood > best.mood) return { date: m.date, mood: m.mood };
    return best;
  }, null);

  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const spending = transactions
    .filter((t) => t.amount < 0 && t.category !== "savings")
    .reduce((s, t) => s - t.amount, 0);
  const saved = transactions
    .filter((t) => t.category === "savings")
    .reduce((s, t) => s - t.amount, 0);

  const byCat = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount < 0 && t.category !== "savings") {
      byCat.set(t.category, (byCat.get(t.category) ?? 0) - t.amount);
    }
  }
  const topCat = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    label,
    from,
    to,
    tasksDone: tasks.filter((t) => t.done).length,
    tasksTotal: tasks.length,
    habitConsistency: slots ? Math.round((logs / slots) * 100) : 0,
    avgMood: moods.length
      ? moods.reduce((s, m) => s + m.mood, 0) / moods.length
      : null,
    bestDay: bestMood,
    workouts: workouts.length,
    trainingMinutes: workouts.reduce((s, w) => s + w.durationMin, 0),
    journalEntries: journal,
    income,
    spending,
    saved,
    topSpendCategory: topCat
      ? { category: topCat[0], amount: topCat[1] }
      : null,
    careerWins: career,
    coursesCompleted: courses,
  };
}

/** Rule-based insight generation over an arbitrary window. */
export async function computeInsights(
  from: Date,
  to: Date,
): Promise<Insight[]> {
  const [moods, workouts, habits, transactions, journalCount] =
    await Promise.all([
      db.moodEntry.findMany({ where: { date: { gte: from, lt: to } } }),
      db.workout.findMany({ where: { date: { gte: from, lt: to } } }),
      db.habit.findMany({
        include: {
          logs: {
            where: { date: { gte: from, lt: to } },
            select: { date: true },
          },
        },
      }),
      db.transaction.findMany({ where: { date: { gte: from, lt: to } } }),
      db.journalEntry.count({ where: { date: { gte: from, lt: to } } }),
    ]);

  const insights: Insight[] = [];
  const windowDays = Math.max(
    1,
    Math.round((to.getTime() - from.getTime()) / 86400000),
  );

  // Mood on workout days vs rest days
  const workoutDays = new Set(workouts.map((w) => dayKey(w.date)));
  const onDays = moods.filter((m) => workoutDays.has(dayKey(m.date)));
  const offDays = moods.filter((m) => !workoutDays.has(dayKey(m.date)));
  if (onDays.length >= 3 && offDays.length >= 3) {
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

  // Anchor habit (longest streak ending inside the window)
  let bestHabit = "";
  let bestStreak = 0;
  for (const h of habits) {
    const set = new Set(h.logs.map((l) => dayKey(l.date)));
    let streak = 0;
    const d = new Date(Math.min(to.getTime() - 86400000, Date.now()));
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
      body: "Your longest active run. Anchor habits stabilize the rest of the system — if a day goes sideways, protect this one first.",
    });
  }

  // Weakest habit
  if (habits.length > 1) {
    let weakHabit = "";
    let weakRate = 1;
    for (const h of habits) {
      const rate = h.logs.length / windowDays;
      if (rate < weakRate) {
        weakRate = rate;
        weakHabit = h.name;
      }
    }
    if (weakHabit && weakRate < 0.6) {
      insights.push({
        id: "weak-habit",
        kind: "warning",
        icon: "trend-down",
        title: `"${weakHabit}" keeps slipping`,
        metric: `${Math.round(weakRate * 100)}% of days`,
        body: "Lowest completion rate in this period. Shrink it until it's impossible to fail — a two-minute version done daily beats the full version done rarely.",
      });
    }
  }

  // Spending vs previous window of equal length
  const prevFrom = new Date(from.getTime() - (to.getTime() - from.getTime()));
  const prevTx = await db.transaction.findMany({
    where: { date: { gte: prevFrom, lt: from } },
  });
  const spend = (txs: typeof transactions) =>
    txs
      .filter((t) => t.amount < 0 && t.category !== "savings")
      .reduce((s, t) => s - t.amount, 0);
  const recent = spend(transactions);
  const previous = spend(prevTx);
  if (previous > 0 && recent > 0) {
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
      metric: `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% vs prior period`,
      body: `Outflows (excluding savings) were $${recent.toFixed(0)} this period against $${previous.toFixed(0)} in the equivalent window before.`,
    });
  }

  // Consistency trend: split window in half
  const mid = new Date((from.getTime() + to.getTime()) / 2);
  const firstHalf = habits.reduce(
    (s, h) => s + h.logs.filter((l) => l.date < mid).length,
    0,
  );
  const secondHalf = habits.reduce(
    (s, h) => s + h.logs.filter((l) => l.date >= mid).length,
    0,
  );
  if (habits.length > 0 && firstHalf + secondHalf > 5) {
    const up = secondHalf >= firstHalf;
    insights.push({
      id: "consistency-trend",
      kind: up ? "positive" : "warning",
      icon: up ? "trend-up" : "trend-down",
      title: up
        ? "Consistency is compounding"
        : "Consistency dipped in the second half",
      metric: `${firstHalf} → ${secondHalf} check-ins`,
      body: up
        ? "The second half of this period beat the first. The system is working — don't change anything."
        : "The second half fell off. Look at what changed mid-period; the fix is usually environmental, not motivational.",
    });
  }

  // Journaling
  insights.push({
    id: "journal-nudge",
    kind: journalCount >= Math.max(2, windowDays / 5) ? "positive" : "neutral",
    icon: "bulb",
    title:
      journalCount >= Math.max(2, windowDays / 5)
        ? "Reflection is part of the routine"
        : "The journal misses you",
    metric: `${journalCount} entries`,
    body:
      journalCount >= Math.max(2, windowDays / 5)
        ? "Regular written reflection correlates with your better mood stretches in this dataset."
        : "Higher-mood stretches tend to include journal entries. One honest paragraph tonight counts.",
  });

  return insights;
}

/** Plain-language recommendations derived from a summary. */
export function buildRecommendations(s: PeriodSummary): string[] {
  const recs: string[] = [];
  if (s.habitConsistency > 0 && s.habitConsistency < 60) {
    recs.push(
      `Habit consistency was ${s.habitConsistency}% — pick the two habits that matter most and let the rest go for now.`,
    );
  } else if (s.habitConsistency >= 80) {
    recs.push(
      `Consistency at ${s.habitConsistency}% — consider raising one habit's difficulty before boredom does it for you.`,
    );
  }
  if (s.workouts === 0) {
    recs.push("No training logged. Schedule one short session — the mood data says it's worth it.");
  } else if (s.trainingMinutes > 0 && s.workouts >= 4) {
    recs.push(`${s.workouts} sessions, ${(s.trainingMinutes / 60).toFixed(1)}h total — solid volume. Watch recovery on back-to-back high-effort days.`);
  }
  if (s.income > 0 && s.spending / s.income > 0.7) {
    recs.push(
      `Spending was ${Math.round((s.spending / s.income) * 100)}% of income${s.topSpendCategory ? ` — ${s.topSpendCategory.category} was the biggest lever at $${s.topSpendCategory.amount.toFixed(0)}` : ""}.`,
    );
  }
  if (s.journalEntries === 0) {
    recs.push("Zero journal entries this period. The review you're reading is only as good as the data you feed it.");
  }
  if (s.tasksTotal > 0 && s.tasksDone / s.tasksTotal < 0.5) {
    recs.push(
      `Only ${s.tasksDone} of ${s.tasksTotal} planned tasks got done — plan fewer, finish more.`,
    );
  }
  if (recs.length === 0) {
    recs.push("Nothing to fix — this period was genuinely strong. Bank the momentum.");
  }
  return recs;
}
