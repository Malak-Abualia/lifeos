import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { daysAgo } from "@/shared/lib/dates";
import { Fitness } from "@/widgets/fitness/fitness";

export const metadata: Metadata = { title: "Fitness" };
export const dynamic = "force-dynamic";

export default async function FitnessPage() {
  const [workouts, prs] = await Promise.all([
    db.workout.findMany({
      where: { date: { gte: daysAgo(75) } },
      orderBy: { date: "desc" },
    }),
    db.personalRecord.findMany({ orderBy: { date: "desc" } }),
  ]);
  return <Fitness workouts={workouts} prs={prs} />;
}
