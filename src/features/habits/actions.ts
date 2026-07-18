"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/shared/lib/db";
import { startOfToday } from "@/shared/lib/dates";

/** Check or uncheck a habit for today. */
export async function toggleHabitToday(habitId: string) {
  const id = z.string().min(1).parse(habitId);
  const date = startOfToday();
  const existing = await db.habitLog.findUnique({
    where: { habitId_date: { habitId: id, date } },
  });
  if (existing) {
    await db.habitLog.delete({ where: { id: existing.id } });
  } else {
    await db.habitLog.create({ data: { habitId: id, date } });
  }
  revalidatePath("/habits");
  revalidatePath("/");
}
