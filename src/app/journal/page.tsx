import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { Journal } from "@/widgets/journal/journal";

export const metadata: Metadata = { title: "Journal" };
export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const entries = await db.journalEntry.findMany({
    orderBy: { date: "desc" },
    take: 30,
    select: {
      id: true,
      date: true,
      title: true,
      content: true,
      gratitude: true,
    },
  });
  return <Journal entries={entries} />;
}
