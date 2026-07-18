"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/ui/glass-card";
import { Stagger, Rise } from "@/shared/ui/animate";
import { cn } from "@/shared/lib/utils";

export interface TransactionData {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  account: string;
}

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const CATEGORY_BADGE: Record<string, "emerald" | "sapphire" | "ice" | "ruby" | "steel"> = {
  income: "emerald",
  savings: "sapphire",
  housing: "steel",
  food: "ice",
  transport: "ice",
  leisure: "ice",
  health: "ice",
  tools: "ice",
};

function CashflowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-raised rounded-xl px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-0.5 flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ background: p.fill }}
            aria-hidden
          />
          <span className="capitalize text-muted-foreground">{p.dataKey}</span>
          <span className="font-semibold tabular">{fmtMoney(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

const columnHelper = createColumnHelper<TransactionData>();

export function Finance({ transactions }: { transactions: TransactionData[] }) {
  /* Monthly aggregates */
  const byMonth = new Map<string, { income: number; spending: number }>();
  for (const t of transactions) {
    const key = format(t.date, "MMM");
    const m = byMonth.get(key) ?? { income: 0, spending: 0 };
    if (t.amount > 0) m.income += t.amount;
    else if (t.category !== "savings") m.spending += -t.amount;
    byMonth.set(key, m);
  }
  const months = [...byMonth.entries()]
    .map(([label, v]) => ({ label, ...v }))
    .reverse();

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalSpend = transactions
    .filter((t) => t.amount < 0 && t.category !== "savings")
    .reduce((s, t) => s - t.amount, 0);
  const totalSaved = transactions
    .filter((t) => t.category === "savings")
    .reduce((s, t) => s - t.amount, 0);
  const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;

  /* Category breakdown (outflows) */
  const byCat = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount < 0 && t.category !== "savings") {
      byCat.set(t.category, (byCat.get(t.category) ?? 0) - t.amount);
    }
  }
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] ?? 1;

  /* Table */
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <span className="tabular text-muted-foreground">
            {format(info.getValue(), "MMM d")}
          </span>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <span className="font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <Badge variant={CATEGORY_BADGE[info.getValue()] ?? "steel"}>
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span
              className={cn(
                "tabular font-medium",
                v > 0 ? "text-emerald" : "text-foreground",
              )}
            >
              {v > 0 ? "+" : ""}
              {fmtMoney(v)}
            </span>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Stagger className="space-y-4">
      {/* Headline stats */}
      <Rise className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Income (4 mo)", value: fmtMoney(totalIncome) },
          { label: "Spending (4 mo)", value: fmtMoney(totalSpend) },
          { label: "Saved", value: fmtMoney(totalSaved) },
          { label: "Savings rate", value: `${savingsRate.toFixed(0)}%` },
        ].map((s) => (
          <GlassCard key={s.label} className="p-5">
            <p className="text-[1.375rem] font-semibold tabular leading-none">
              {s.value}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">{s.label}</p>
          </GlassCard>
        ))}
      </Rise>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Cashflow */}
        <Rise className="xl:col-span-2">
          <GlassCard className="h-full">
            <GlassCardHeader className="flex-row items-baseline justify-between">
              <div>
                <GlassCardTitle>Cashflow</GlassCardTitle>
                <GlassCardDescription>
                  Income vs spending by month (savings excluded)
                </GlassCardDescription>
              </div>
              <div className="flex gap-4">
                {[
                  { label: "Income", color: "var(--chart-2)" },
                  { label: "Spending", color: "var(--chart-1)" },
                ].map((s) => (
                  <span
                    key={s.label}
                    className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground"
                  >
                    <span
                      className="size-2 rounded-[3px]"
                      style={{ background: s.color }}
                      aria-hidden
                    />
                    {s.label}
                  </span>
                ))}
              </div>
            </GlassCardHeader>
            <GlassCardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={months}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                  barCategoryGap="30%"
                  barGap={3}
                >
                  <CartesianGrid
                    strokeDasharray="3 6"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b98a9", fontSize: 11 }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b98a9", fontSize: 11 }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip
                    content={<CashflowTooltip />}
                    cursor={{ fill: "rgba(110,198,255,0.05)" }}
                  />
                  <Bar
                    dataKey="income"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="spending"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </GlassCardContent>
          </GlassCard>
        </Rise>

        {/* Category breakdown */}
        <Rise>
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Where it goes</GlassCardTitle>
              <GlassCardDescription>Outflows by category</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-3.5">
              {cats.map(([cat, total]) => (
                <div key={cat}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="capitalize text-muted-foreground">
                      {cat}
                    </span>
                    <span className="tabular font-medium">
                      {fmtMoney(total)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-sapphire/70 to-(--chart-1) transition-[width] duration-700 ease-(--ease-swift)"
                      style={{ width: `${(total / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </GlassCardContent>
          </GlassCard>
        </Rise>
      </div>

      {/* Transactions table */}
      <Rise>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Transactions</GlassCardTitle>
            <GlassCardDescription>
              {transactions.length} records · click headers to sort
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="overflow-x-auto">
            <table className="w-full min-w-125 border-separate border-spacing-0 text-[0.8125rem]">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="border-b border-white/8 pb-2.5 pr-4 text-left"
                      >
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-steel transition-colors hover:text-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <ArrowUpDown
                            className={cn(
                              "size-3",
                              header.column.getIsSorted() && "text-ice",
                            )}
                            aria-hidden
                          />
                        </button>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.slice(0, 15).map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-white/3"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-b border-white/4 py-2.5 pr-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCardContent>
        </GlassCard>
      </Rise>
    </Stagger>
  );
}
