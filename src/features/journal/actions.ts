"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/shared/lib/db";
import { journalEntrySchema } from "./schema";

export async function createJournalEntry(input: unknown) {
  const data = journalEntrySchema.parse(input);
  await db.journalEntry.create({
    data: {
      date: new Date(),
      title: data.title,
      content: data.content,
      gratitude: data.gratitude || null,
    },
  });
  revalidatePath("/journal");
}
