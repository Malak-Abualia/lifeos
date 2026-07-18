/**
 * LifeOS seed — deterministic, realistic demo data for the last ~120 days.
 * Mood, habits, workouts, and finances are loosely correlated so the
 * Analytics and AI Insights modules have real patterns to surface.
 *
 * DESTRUCTIVE: wipes every table before inserting. To protect real
 * user-entered data, it refuses to run unless SEED_DEMO=1 is set:
 *   SEED_DEMO=1 npx prisma db seed
 */
import "dotenv/config";

if (process.env.SEED_DEMO !== "1") {
  console.error(
    "Refusing to seed: this WIPES all data and inserts demo rows.\n" +
      "If you really want that, run with SEED_DEMO=1.",
  );
  process.exit(1);
}
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

/** Deterministic PRNG so reseeding produces identical data. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260718);
const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];

const DAYS = 120;
const today = new Date();
today.setHours(0, 0, 0, 0);
/** Day at UTC midnight, `n` days ago — keeps SQLite dates comparable. */
const day = (ago: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - ago);
  return d;
};

async function main() {
  // Wipe in dependency order so reseeding is idempotent
  await db.habitLog.deleteMany();
  await db.habit.deleteMany();
  await db.keyResult.deleteMany();
  await db.goal.deleteMany();
  await db.task.deleteMany();
  await db.moodEntry.deleteMany();
  await db.journalEntry.deleteMany();
  await db.workout.deleteMany();
  await db.personalRecord.deleteMany();
  await db.course.deleteMany();
  await db.careerEvent.deleteMany();
  await db.transaction.deleteMany();

  /* ------------------------------------------------ Habits + logs */
  const habitDefs = [
    { name: "Deep work 2h", emoji: "🎯", targetPerWeek: 5, accent: "sapphire", p: 0.78 },
    { name: "Morning run", emoji: "🏃", targetPerWeek: 4, accent: "emerald", p: 0.55 },
    { name: "Read 30 min", emoji: "📖", targetPerWeek: 7, accent: "ice", p: 0.85 },
    { name: "Meditate", emoji: "🧘", targetPerWeek: 5, accent: "ice", p: 0.6 },
    { name: "No sugar", emoji: "🚫", targetPerWeek: 7, accent: "ruby", p: 0.5 },
    { name: "Sleep by 23:00", emoji: "🌙", targetPerWeek: 6, accent: "steel", p: 0.65 },
  ];
  // dayQuality[ago] drives correlation between habits, mood, and workouts
  const dayQuality: number[] = [];
  for (let ago = 0; ago < DAYS; ago++) {
    const drift = 0.15 * Math.sin(ago / 9); // multi-week waves
    const trend = 0.1 * (1 - ago / DAYS); // slow improvement toward today
    dayQuality[ago] = Math.min(1, Math.max(0, 0.5 + drift + trend + (rand() - 0.5) * 0.35));
  }

  for (const def of habitDefs) {
    const habit = await db.habit.create({
      data: {
        name: def.name,
        emoji: def.emoji,
        targetPerWeek: def.targetPerWeek,
        accent: def.accent,
      },
    });
    const logs: { habitId: string; date: Date }[] = [];
    for (let ago = 0; ago < DAYS; ago++) {
      const prob = def.p * (0.55 + 0.9 * dayQuality[ago]);
      if (rand() < prob) logs.push({ habitId: habit.id, date: day(ago) });
    }
    await db.habitLog.createMany({ data: logs });
  }

  /* ------------------------------------------------ Goals + key results */
  const goals: Array<{
    title: string;
    quarter: string;
    area: string;
    krs: Array<{ title: string; current: number; target: number; unit: string }>;
  }> = [
    {
      title: "Run a half marathon",
      quarter: "2026-Q3",
      area: "health",
      krs: [
        { title: "Weekly distance", current: 32, target: 40, unit: "km" },
        { title: "Long run", current: 15, target: 21, unit: "km" },
        { title: "Avg pace", current: 5.4, target: 5.0, unit: "min/km" },
      ],
    },
    {
      title: "Ship LifeOS v1",
      quarter: "2026-Q3",
      area: "work",
      krs: [
        { title: "Modules complete", current: 9, target: 13, unit: "" },
        { title: "Beta users", current: 12, target: 50, unit: "" },
      ],
    },
    {
      title: "Read 24 books this year",
      quarter: "2026-Q3",
      area: "growth",
      krs: [{ title: "Books finished", current: 14, target: 24, unit: "books" }],
    },
    {
      title: "6-month emergency fund",
      quarter: "2026-Q4",
      area: "finance",
      krs: [{ title: "Months saved", current: 4.2, target: 6, unit: "mo" }],
    },
    {
      title: "Speak at a conference",
      quarter: "2026-Q4",
      area: "career",
      krs: [
        { title: "CFPs submitted", current: 3, target: 6, unit: "" },
        { title: "Talks accepted", current: 1, target: 1, unit: "" },
      ],
    },
    {
      title: "Learn conversational Spanish",
      quarter: "2026-Q3",
      area: "growth",
      krs: [{ title: "Lessons completed", current: 34, target: 90, unit: "" }],
    },
    {
      title: "Deadlift 1.5× bodyweight",
      quarter: "2026-Q4",
      area: "health",
      krs: [{ title: "Deadlift", current: 105, target: 120, unit: "kg" }],
    },
  ];
  for (const g of goals) {
    await db.goal.create({
      data: {
        title: g.title,
        quarter: g.quarter,
        area: g.area,
        keyResults: { create: g.krs },
      },
    });
  }

  /* ------------------------------------------------ Tasks (today + next days) */
  const taskDefs: Array<[string, number, number, number, string, string, boolean]> = [
    // [title, dayOffsetFromToday(-past), startMinute, duration, priority, area, done]
    ["Deep work: Analytics module", 0, 9 * 60, 120, "high", "work", true],
    ["Team standup", 0, 11 * 60 + 30, 15, "medium", "work", true],
    ["Review pull requests", 0, 13 * 60, 45, "medium", "work", false],
    ["Interval run 6×800m", 0, 17 * 60 + 30, 60, "high", "health", false],
    ["Spanish lesson 35", 0, 20 * 60, 30, "low", "growth", false],
    ["Plan tomorrow", 0, 21 * 60 + 30, 15, "medium", "personal", false],
    ["Quarterly goal review", -1, 10 * 60, 60, "high", "personal", false],
    ["Dentist appointment", -1, 15 * 60, 60, "medium", "health", false],
    ["Write conference talk outline", -2, 9 * 60 + 30, 90, "high", "career", false],
    ["Grocery run", -2, 18 * 60, 45, "low", "personal", false],
  ];
  for (const [title, offset, startMinute, durationMin, priority, area, done] of taskDefs) {
    await db.task.create({
      data: { title, date: day(offset), startMinute, durationMin, priority, area, done },
    });
  }
  // Backlog (unscheduled)
  for (const title of ["Renew passport", "Refactor auth flow", "Book flights for October", "Try new climbing gym"]) {
    await db.task.create({
      data: { title, date: day(0), startMinute: null, priority: "low", area: "personal" },
    });
  }

  /* ------------------------------------------------ Mood (correlated with dayQuality) */
  const tagPool = ["focused", "calm", "tired", "anxious", "energized", "social", "stressed", "grateful", "restless", "inspired"];
  for (let ago = 0; ago < DAYS; ago++) {
    const q = dayQuality[ago];
    const mood = Math.min(10, Math.max(1, Math.round(3.5 + q * 5.5 + (rand() - 0.5) * 1.6)));
    const energy = Math.min(10, Math.max(1, Math.round(3 + q * 5 + (rand() - 0.5) * 2)));
    const tags = [pick(tagPool), pick(tagPool)]
      .filter((t, i, a) => a.indexOf(t) === i)
      .join(",");
    await db.moodEntry.create({
      data: { date: day(ago), mood, energy, tags },
    });
  }

  /* ------------------------------------------------ Journal */
  const journalSeeds: Array<[number, string, string, string]> = [
    [0, "Momentum", "The analytics module clicked into place this morning — two hours of genuinely deep work before standup. Afternoon dipped, but the interval session brought it back. Noticing that the days I run are the days I write better code.", "The quiet hour before anyone was awake."],
    [1, "On saying no", "Turned down the side project. It hurt for about ten minutes and then felt like dropping a backpack I'd been carrying uphill. More room for the half-marathon block and the talk.", "A friend who tells me the truth."],
    [3, "Small wins compound", "Streak day 21 on reading. 'The Design of Everyday Things' again — it reads differently now that I'm building LifeOS. Norman would have opinions about my sidebar.", "Coffee, obviously."],
    [6, "Rest is training", "Took a full rest day without guilt. Legs needed it after Saturday's long run. Watched the sea documentary and slept nine hours.", "A body that recovers."],
    [10, "Halfway", "Emergency fund crossed four months. Eighteen months ago this number was zero. Slow is fine. Slow works.", "Past me, for starting."],
    [15, "Shipped the shell", "The app shell went live tonight. Frosted glass, the little pill that glides in the sidebar — details nobody asked for and everyone feels.", "Work that doesn't feel like work."],
  ];
  for (const [ago, title, content, gratitude] of journalSeeds) {
    await db.journalEntry.create({
      data: { date: day(ago), title, content, gratitude },
    });
  }

  /* ------------------------------------------------ Workouts + PRs */
  const workoutTypes = ["run", "strength", "cycle", "yoga", "climb"] as const;
  for (let ago = 0; ago < DAYS; ago++) {
    if (rand() < 0.3 + 0.35 * dayQuality[ago]) {
      const type = pick(workoutTypes);
      await db.workout.create({
        data: {
          date: day(ago),
          type,
          durationMin: 30 + Math.floor(rand() * 60),
          load: Math.round(30 + dayQuality[ago] * 50 + rand() * 20),
        },
      });
    }
  }
  const prs: Array<[string, number, string, number]> = [
    ["Deadlift", 105, "kg", 12],
    ["Bench press", 72.5, "kg", 26],
    ["5K", 23.4, "min", 8],
    ["10K", 49.1, "min", 31],
    ["Longest run", 16.2, "km", 5],
    ["Plank", 3.5, "min", 44],
  ];
  for (const [exercise, value, unit, ago] of prs) {
    await db.personalRecord.create({
      data: { exercise, value, unit, date: day(ago) },
    });
  }

  /* ------------------------------------------------ Learning */
  const courses: Array<[string, string, string, number, number, string]> = [
    ["Advanced TypeScript Patterns", "Frontend Masters", "course", 82, 14.5, "active"],
    ["Designing Data-Intensive Applications", "O'Reilly", "book", 55, 21, "active"],
    ["Spanish A2 → B1", "Babbel", "course", 38, 26, "active"],
    ["The Design of Everyday Things", "Basic Books", "book", 100, 9, "done"],
    ["Rust for TypeScript Devs", "self-paced", "course", 100, 18, "done"],
    ["Distributed Systems", "MIT 6.824", "course", 0, 0, "queued"],
    ["Shape Up", "Basecamp", "book", 0, 0, "queued"],
    ["Personal site redesign", "side project", "project", 64, 22, "active"],
  ];
  for (const [title, provider, kind, progress, hours, status] of courses) {
    await db.course.create({ data: { title, provider, kind, progress, hours, status } });
  }

  /* ------------------------------------------------ Career */
  const careerEvents: Array<[number, string, string, string | null, string | null]> = [
    [2, "win", "Led incident review — praised by VP Eng", "Turned a rough outage into a process fix adopted org-wide.", null],
    [9, "interview", "Staff Engineer — Meridian Labs", "System design round went well; take-home next.", "interview"],
    [14, "application", "Principal Engineer — Northwind", "Referred by Dana.", "screening"],
    [21, "win", "LifeOS design system shipped", "Foundation for every module going forward.", null],
    [30, "application", "Staff Engineer — Vantage", null, "applied"],
    [38, "milestone", "Promoted to Senior II", "Comp adjusted, new scope: platform team.", null],
    [52, "win", "Conference talk accepted — WinterConf", "\"Glassmorphism at scale\" — October.", null],
    [70, "application", "Staff Engineer — Polar", null, "rejected"],
    [90, "milestone", "Started mentoring two juniors", null, null],
  ];
  for (const [ago, type, title, detail, status] of careerEvents) {
    await db.careerEvent.create({
      data: { date: day(ago), type, title, detail, status },
    });
  }

  /* ------------------------------------------------ Finance (4 months) */
  const months = [0, 1, 2, 3];
  for (const m of months) {
    const base = m * 30;
    await db.transaction.create({
      data: { date: day(base + 17), description: "Salary — Aurora Systems", category: "income", amount: 6800, account: "checking" },
    });
    if (rand() < 0.7) {
      await db.transaction.create({
        data: { date: day(base + 10), description: "Freelance — dashboard audit", category: "income", amount: Math.round(400 + rand() * 900), account: "checking" },
      });
    }
    await db.transaction.create({
      data: { date: day(base + 15), description: "Rent", category: "housing", amount: -1850, account: "checking" },
    });
    await db.transaction.create({
      data: { date: day(base + 14), description: "Transfer to savings", category: "savings", amount: -1200, account: "savings" },
    });
    const spends: Array<[string, string, number, number]> = [
      ["Groceries — Nordmarket", "food", 90, 160],
      ["Groceries — Nordmarket", "food", 80, 140],
      ["Restaurants", "food", 60, 180],
      ["Metro pass", "transport", 55, 55],
      ["Fuel", "transport", 40, 90],
      ["Climbing gym", "health", 65, 65],
      ["Physio", "health", 0, 80],
      ["Concert tickets", "leisure", 0, 120],
      ["Streaming bundle", "leisure", 24, 24],
      ["Cloud + SaaS tools", "tools", 48, 85],
      ["Books", "tools", 15, 60],
    ];
    for (const [description, category, min, max] of spends) {
      const amount = min === max ? min : Math.round(min + rand() * (max - min));
      if (amount > 0) {
        await db.transaction.create({
          data: {
            date: day(base + Math.floor(rand() * 28)),
            description,
            category,
            amount: -amount,
            account: "checking",
          },
        });
      }
    }
  }

  const counts = {
    habits: await db.habit.count(),
    habitLogs: await db.habitLog.count(),
    goals: await db.goal.count(),
    tasks: await db.task.count(),
    moods: await db.moodEntry.count(),
    journal: await db.journalEntry.count(),
    workouts: await db.workout.count(),
    courses: await db.course.count(),
    career: await db.careerEvent.count(),
    transactions: await db.transaction.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    return db.$disconnect().then(() => process.exit(1));
  });
