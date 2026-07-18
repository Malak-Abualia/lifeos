import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { startOfToday } from "@/shared/lib/dates";
import { Checkin } from "@/widgets/checkin/checkin";

export const metadata: Metadata = { title: "Daily Check-in" };
export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [habits, mood, journalCount, workoutsToday] = await Promise.all([
    db.habit.findMany({
      orderBy: { createdAt: "asc" },
      include: { logs: { where: { date: today }, select: { id: true } } },
    }),
    db.moodEntry.findUnique({ where: { date: today } }),
    db.journalEntry.count({ where: { date: { gte: today, lt: tomorrow } } }),
    db.workout.count({ where: { date: today } }),
  ]);

  return (
    <Checkin
      data={{
        habits: habits.map((h) => ({
          id: h.id,
          name: h.name,
          emoji: h.emoji,
          checkedToday: h.logs.length > 0,
        })),
        mood: mood
          ? { mood: mood.mood, energy: mood.energy, tags: mood.tags, note: mood.note }
          : null,
        journaledToday: journalCount > 0,
        workoutsToday,
      }}
    />
  );
}
