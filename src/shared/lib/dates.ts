/** Date helpers shared by queries and widgets. All "days" are local-midnight. */

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * YYYY-MM-DD key for grouping DB rows by day.
 * Uses local components (not toISOString) because all stored dates are
 * local-midnight — UTC slicing would shift the day in non-UTC timezones.
 */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
