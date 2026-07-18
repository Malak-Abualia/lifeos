import type { Metadata } from "next";

import { computeInsights } from "@/entities/insights/engine";
import { daysAgo } from "@/shared/lib/dates";
import { Insights } from "@/widgets/insights/insights";

export const metadata: Metadata = { title: "AI Insights" };
export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const insights = await computeInsights(daysAgo(60), new Date());
  return <Insights insights={insights} />;
}
