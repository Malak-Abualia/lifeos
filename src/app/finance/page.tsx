import type { Metadata } from "next";

import { db } from "@/shared/lib/db";
import { Finance } from "@/widgets/finance/finance";

export const metadata: Metadata = { title: "Finance" };
export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const transactions = await db.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return <Finance transactions={transactions} />;
}
