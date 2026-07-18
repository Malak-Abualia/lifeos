import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { Goals } from "@/widgets/goals/goals";

export const metadata: Metadata = { title: "Goals" };
export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await db.goal.findMany({
    orderBy: [{ quarter: "asc" }, { createdAt: "asc" }],
    include: { keyResults: true },
  });

  return <Goals goals={goals} />;
}
