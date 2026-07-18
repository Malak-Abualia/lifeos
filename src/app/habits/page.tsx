import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { daysAgo, dayKey } from "@/shared/lib/dates";
import { Habits } from "@/widgets/habits/habits";

export const metadata: Metadata = { title: "Habits" };
export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await db.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        where: { date: { gte: daysAgo(120) } },
        select: { date: true },
      },
    },
  });

  const data = habits.map((h) => ({
    id: h.id,
    name: h.name,
    emoji: h.emoji,
    targetPerWeek: h.targetPerWeek,
    loggedDays: h.logs.map((l) => dayKey(l.date)),
  }));

  return <Habits habits={data} />;
}
