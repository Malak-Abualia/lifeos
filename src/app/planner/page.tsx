import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { startOfToday } from "@/shared/lib/dates";
import { Planner } from "@/widgets/planner/planner";

export const metadata: Metadata = { title: "Daily Planner" };
export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  const tasks = await db.task.findMany({
    where: { date: startOfToday() },
    orderBy: [{ startMinute: "asc" }],
    select: {
      id: true,
      title: true,
      date: true,
      startMinute: true,
      durationMin: true,
      priority: true,
      area: true,
      notes: true,
      done: true,
    },
  });

  return <Planner tasks={tasks} />;
}
