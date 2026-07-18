"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/shared/lib/db";
import { startOfToday } from "@/shared/lib/dates";
import { ENTITIES, type EntityKey } from "./registry";

/** "YYYY-MM-DD" → local-midnight Date (matches all stored dates). */
function parseDay(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function parseTime(s: string | undefined | null): number | null {
  if (!s) return null;
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

/** Map validated form input → Prisma create/update data, per entity. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const TO_DB: Record<EntityKey, (v: any) => Record<string, unknown>> = {
  task: (v) => ({
    title: v.title,
    date: parseDay(v.date),
    startMinute: parseTime(v.time),
    durationMin: v.durationMin,
    priority: v.priority,
    area: v.area,
    notes: v.notes || null,
  }),
  habit: (v) => ({
    name: v.name,
    emoji: v.emoji,
    targetPerWeek: v.targetPerWeek,
    accent: v.accent,
  }),
  goal: (v) => ({ title: v.title, quarter: v.quarter, area: v.area }),
  keyResult: (v) => ({
    goalId: v.goalId,
    title: v.title,
    current: v.current,
    target: v.target,
    unit: v.unit ?? "",
  }),
  mood: (v) => ({
    date: parseDay(v.date),
    mood: v.mood,
    energy: v.energy,
    tags: v.tags ?? "",
    note: v.note || null,
  }),
  journal: (v) => ({
    date: parseDay(v.date),
    title: v.title,
    content: v.content,
    gratitude: v.gratitude || null,
  }),
  workout: (v) => ({
    date: parseDay(v.date),
    type: v.type,
    durationMin: v.durationMin,
    load: v.load,
    notes: v.notes || null,
  }),
  personalRecord: (v) => ({
    exercise: v.exercise,
    value: v.value,
    unit: v.unit,
    date: parseDay(v.date),
  }),
  course: (v) => ({
    title: v.title,
    provider: v.provider ?? "",
    kind: v.kind,
    progress: v.progress,
    hours: v.hours,
    status: v.status,
  }),
  careerEvent: (v) => ({
    date: parseDay(v.date),
    type: v.type,
    title: v.title,
    detail: v.detail || null,
    status: v.status || null,
  }),
  transaction: (v) => ({
    date: parseDay(v.date),
    description: v.description,
    category: v.category,
    amount: v.direction === "expense" ? -Math.abs(v.amount) : Math.abs(v.amount),
    account: v.account,
  }),
};

function delegate(key: EntityKey) {
  const map: Record<EntityKey, any> = {
    task: db.task,
    habit: db.habit,
    goal: db.goal,
    keyResult: db.keyResult,
    mood: db.moodEntry,
    journal: db.journalEntry,
    workout: db.workout,
    personalRecord: db.personalRecord,
    course: db.course,
    careerEvent: db.careerEvent,
    transaction: db.transaction,
  };
  return map[key];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function refresh() {
  // Local single-user app: refreshing the whole tree keeps every module,
  // the dashboard, analytics, and insights in sync after any write.
  revalidatePath("/", "layout");
}

/** Create (id = null) or update (id set) any registered entity. */
export async function saveEntity(
  key: EntityKey,
  id: string | null,
  input: unknown,
) {
  const def = ENTITIES[key];
  if (!def) throw new Error(`Unknown entity: ${key}`);
  const data = TO_DB[key](def.schema.parse(input));

  if (key === "mood" && !id) {
    // Mood is unique per day — quietly upsert instead of failing
    const date = data.date as Date;
    await db.moodEntry.upsert({
      where: { date },
      create: data as never,
      update: data as never,
    });
  } else if (id) {
    await delegate(key).update({ where: { id }, data });
  } else {
    await delegate(key).create({ data });
  }
  refresh();
}

export async function deleteEntity(key: EntityKey, id: string) {
  const cleanId = z.string().min(1).parse(id);
  if (!ENTITIES[key]) throw new Error(`Unknown entity: ${key}`);
  await delegate(key).delete({ where: { id: cleanId } });
  refresh();
}

/* ------------------------------------------------------------------ */
/*  Daily check-in — one submit saves mood, journal, tomorrow's plan   */
/* ------------------------------------------------------------------ */

const checkinSchema = z.object({
  mood: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  tags: z.array(z.string().max(24)).max(6),
  note: z.string().max(1000).optional(),
  journal: z
    .object({
      content: z.string().max(20000),
      gratitude: z.string().max(300).optional(),
    })
    .optional(),
  tomorrowTasks: z.array(z.string().min(1).max(120)).max(5),
});

export async function submitDailyCheckin(input: unknown) {
  const data = checkinSchema.parse(input);
  const today = startOfToday();

  await db.moodEntry.upsert({
    where: { date: today },
    create: {
      date: today,
      mood: data.mood,
      energy: data.energy,
      tags: data.tags.join(","),
      note: data.note || null,
    },
    update: {
      mood: data.mood,
      energy: data.energy,
      tags: data.tags.join(","),
      note: data.note || null,
    },
  });

  if (data.journal && data.journal.content.trim().length > 0) {
    await db.journalEntry.create({
      data: {
        date: new Date(),
        title: `Daily note — ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        content: data.journal.content,
        gratitude: data.journal.gratitude || null,
      },
    });
  }

  if (data.tomorrowTasks.length > 0) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    await db.task.createMany({
      data: data.tomorrowTasks.map((title) => ({
        title,
        date: tomorrow,
        startMinute: null,
        priority: "medium",
        area: "personal",
      })),
    });
  }

  refresh();
}

/* ------------------------------------------------------------------ */
/*  Danger zone                                                        */
/* ------------------------------------------------------------------ */

/** Erase every row in every table. Guarded by a typed confirmation. */
export async function eraseAllData(confirmation: string) {
  if (confirmation !== "ERASE") {
    throw new Error("Confirmation phrase did not match.");
  }
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
  refresh();
}
