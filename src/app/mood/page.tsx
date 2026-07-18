import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { daysAgo } from "@/shared/lib/dates";
import { Mood } from "@/widgets/mood/mood";

export const metadata: Metadata = { title: "Mood" };
export const dynamic = "force-dynamic";

export default async function MoodPage() {
  const entries = await db.moodEntry.findMany({
    where: { date: { gte: daysAgo(30) } },
    orderBy: { date: "asc" },
    select: { date: true, mood: true, energy: true, tags: true },
  });
  return <Mood entries={entries} />;
}
