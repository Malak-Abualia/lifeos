import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { Career } from "@/widgets/career/career";

export const metadata: Metadata = { title: "Career" };
export const dynamic = "force-dynamic";

export default async function CareerPage() {
  const events = await db.careerEvent.findMany({
    orderBy: { date: "desc" },
  });
  return <Career events={events} />;
}
