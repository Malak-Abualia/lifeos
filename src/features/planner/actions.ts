"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/shared/lib/db";

export async function toggleTask(taskId: string) {
  const id = z.string().min(1).parse(taskId);
  const task = await db.task.findUniqueOrThrow({ where: { id } });
  await db.task.update({ where: { id }, data: { done: !task.done } });
  revalidatePath("/planner");
  revalidatePath("/");
}

const createTaskSchema = z.object({
  title: z.string().min(1, "Give the task a name").max(120),
  priority: z.enum(["low", "medium", "high"]),
  area: z.enum(["work", "personal", "health", "growth", "career"]),
});

export async function createTask(input: unknown) {
  const data = createTaskSchema.parse(input);
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  await db.task.create({ data: { ...data, date, startMinute: null } });
  revalidatePath("/planner");
}
