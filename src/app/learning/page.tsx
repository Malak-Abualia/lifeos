import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { Learning } from "@/widgets/learning/learning";

export const metadata: Metadata = { title: "Learning Hub" };
export const dynamic = "force-dynamic";

export default async function LearningPage() {
  const courses = await db.course.findMany({
    orderBy: [{ status: "asc" }, { progress: "desc" }],
  });
  return <Learning courses={courses} />;
}
