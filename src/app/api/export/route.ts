import { NextResponse } from "next/server";

import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

/** Full data export — the user's data belongs to the user. */
export async function GET() {
  const [
    tasks,
    habits,
    habitLogs,
    goals,
    keyResults,
    moods,
    journal,
    workouts,
    personalRecords,
    courses,
    careerEvents,
    transactions,
  ] = await Promise.all([
    db.task.findMany(),
    db.habit.findMany(),
    db.habitLog.findMany(),
    db.goal.findMany(),
    db.keyResult.findMany(),
    db.moodEntry.findMany(),
    db.journalEntry.findMany(),
    db.workout.findMany(),
    db.personalRecord.findMany(),
    db.course.findMany(),
    db.careerEvent.findMany(),
    db.transaction.findMany(),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    version: 1,
    data: {
      tasks,
      habits,
      habitLogs,
      goals,
      keyResults,
      moods,
      journal,
      workouts,
      personalRecords,
      courses,
      careerEvents,
      transactions,
    },
  });
}
