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

/** YYYY-MM-DD key for grouping DB rows by day. */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
