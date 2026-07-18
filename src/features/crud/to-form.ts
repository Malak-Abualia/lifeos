/**
 * Row → form-shaped initial values for the EntityDialog.
 * Client-safe: pure date/number formatting, no server imports.
 */

export function dateToStr(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function minuteToTime(min: number | null): string {
  if (min === null || min === undefined) return "";
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export const toForm = {
  task: (t: {
    title: string;
    date: Date;
    startMinute: number | null;
    durationMin: number;
    priority: string;
    area: string;
    notes?: string | null;
  }) => ({
    title: t.title,
    date: dateToStr(t.date),
    time: minuteToTime(t.startMinute),
    durationMin: t.durationMin,
    priority: t.priority,
    area: t.area,
    notes: t.notes ?? "",
  }),

  habit: (h: { name: string; emoji: string; targetPerWeek: number; accent?: string }) => ({
    name: h.name,
    emoji: h.emoji,
    targetPerWeek: h.targetPerWeek,
    accent: h.accent ?? "ice",
  }),

  goal: (g: { title: string; quarter: string; area: string }) => ({
    title: g.title,
    quarter: g.quarter,
    area: g.area,
  }),

  keyResult: (kr: {
    goalId: string;
    title: string;
    current: number;
    target: number;
    unit: string;
  }) => ({ ...kr }),

  journal: (j: {
    date: Date;
    title: string;
    content: string;
    gratitude: string | null;
  }) => ({
    date: dateToStr(j.date),
    title: j.title,
    content: j.content,
    gratitude: j.gratitude ?? "",
  }),

  workout: (w: {
    date: Date;
    type: string;
    durationMin: number;
    load: number;
    notes?: string | null;
  }) => ({
    date: dateToStr(w.date),
    type: w.type,
    durationMin: w.durationMin,
    load: w.load,
    notes: w.notes ?? "",
  }),

  personalRecord: (pr: {
    exercise: string;
    value: number;
    unit: string;
    date: Date;
  }) => ({
    exercise: pr.exercise,
    value: pr.value,
    unit: pr.unit,
    date: dateToStr(pr.date),
  }),

  course: (c: {
    title: string;
    provider: string;
    kind: string;
    progress: number;
    hours: number;
    status: string;
  }) => ({ ...c }),

  careerEvent: (e: {
    date: Date;
    type: string;
    title: string;
    detail: string | null;
    status: string | null;
  }) => ({
    date: dateToStr(e.date),
    type: e.type,
    title: e.title,
    detail: e.detail ?? "",
    status: e.status ?? "",
  }),

  transaction: (t: {
    date: Date;
    description: string;
    category: string;
    amount: number;
    account: string;
  }) => ({
    date: dateToStr(t.date),
    description: t.description,
    direction: t.amount < 0 ? "expense" : "income",
    amount: Math.abs(t.amount),
    category: t.category,
    account: t.account,
  }),
};
