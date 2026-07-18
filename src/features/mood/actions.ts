"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/shared/lib/db";
import { startOfToday } from "@/shared/lib/dates";

const checkInSchema = z.object({
  mood: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  tags: z.array(z.string().max(24)).max(6),
});

/** Upsert today's mood entry. */
export async function checkInMood(input: unknown) {
  const data = checkInSchema.parse(input);
  const date = startOfToday();
  await db.moodEntry.upsert({
    where: { date },
    create: { date, mood: data.mood, energy: data.energy, tags: data.tags.join(",") },
    update: { mood: data.mood, energy: data.energy, tags: data.tags.join(",") },
  });
  revalidatePath("/mood");
  revalidatePath("/");
}
