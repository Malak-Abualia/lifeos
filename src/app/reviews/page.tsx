import type { Metadata } from "next";
import { format } from "date-fns";

import {
  buildRecommendations,
  computeInsights,
  computePeriodSummary,
} from "@/entities/insights/engine";
import { Reviews, type ReviewPeriod } from "@/widgets/reviews/reviews";

export const metadata: Metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Current week (Monday-aligned)
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  // Current month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  // Current year
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const prevYearStart = new Date(today.getFullYear() - 1, 0, 1);

  const [
    week, prevWeek, weekInsights,
    month, prevMonth, monthInsights,
    year, prevYear, yearInsights,
  ] = await Promise.all([
    computePeriodSummary(weekStart, tomorrow, "This week"),
    computePeriodSummary(prevWeekStart, weekStart, "Last week"),
    computeInsights(weekStart, tomorrow),
    computePeriodSummary(monthStart, tomorrow, "This month"),
    computePeriodSummary(prevMonthStart, monthStart, "Last month"),
    computeInsights(monthStart, tomorrow),
    computePeriodSummary(yearStart, tomorrow, "This year"),
    computePeriodSummary(prevYearStart, yearStart, "Last year"),
    computeInsights(yearStart, tomorrow),
  ]);

  const periods: ReviewPeriod[] = [
    {
      key: "weekly",
      label: "Week",
      rangeLabel: `${format(weekStart, "MMM d")} – ${format(today, "MMM d")}`,
      current: week,
      previous: prevWeek,
      insights: weekInsights,
      recommendations: buildRecommendations(week),
    },
    {
      key: "monthly",
      label: "Month",
      rangeLabel: format(monthStart, "MMMM yyyy"),
      current: month,
      previous: prevMonth,
      insights: monthInsights,
      recommendations: buildRecommendations(month),
    },
    {
      key: "yearly",
      label: "Year",
      rangeLabel: format(yearStart, "yyyy"),
      current: year,
      previous: prevYear,
      insights: yearInsights,
      recommendations: buildRecommendations(year),
    },
  ];

  return <Reviews periods={periods} />;
}
