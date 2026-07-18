/**
 * Entity registry — the single source of truth for every CRUD surface.
 * Each entry declares its Zod schema and field layout; the EntityDialog
 * auto-generates a polished form from it, and the server actions validate
 * against the same schema. Adding a table to the app = one entry here.
 */
import { z } from "zod";

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "date"
  | "time"
  | "hidden";

export interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  options?: { value: string; label: string }[];
  placeholder?: string;
  step?: number;
  min?: number;
  max?: number;
  /** Span both columns of the form grid */
  wide?: boolean;
  hint?: string;
}

export interface EntityDef {
  label: string;
  /** Verb shown on the create button, e.g. "Log" or "Add" */
  verb: string;
  schema: z.ZodTypeAny;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const timeStr = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .or(z.literal(""))
  .optional();

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const opts = (...pairs: [string, string][]) =>
  pairs.map(([value, label]) => ({ value, label }));

export const ENTITIES = {
  task: {
    label: "Task",
    verb: "Add",
    schema: z.object({
      title: z.string().min(1, "Give the task a name").max(120),
      date: dateStr,
      time: timeStr,
      durationMin: z.number().int().min(5).max(600),
      priority: z.enum(["low", "medium", "high"]),
      area: z.enum(["work", "personal", "health", "growth", "career"]),
      notes: z.string().max(2000).optional(),
    }),
    fields: [
      { name: "title", label: "Title", kind: "text", wide: true, placeholder: "What needs doing?" },
      { name: "date", label: "Date", kind: "date" },
      { name: "time", label: "Start time", kind: "time", hint: "Empty = backlog" },
      { name: "durationMin", label: "Duration (min)", kind: "number", min: 5, max: 600, step: 5 },
      { name: "priority", label: "Priority", kind: "select", options: opts(["low", "Low"], ["medium", "Medium"], ["high", "High"]) },
      { name: "area", label: "Area", kind: "select", wide: true, options: opts(["work", "Work"], ["personal", "Personal"], ["health", "Health"], ["growth", "Growth"], ["career", "Career"]) },
      { name: "notes", label: "Notes", kind: "textarea", wide: true, placeholder: "Optional context" },
    ],
    defaults: { title: "", date: todayStr(), time: "", durationMin: 30, priority: "medium", area: "personal", notes: "" },
  },

  habit: {
    label: "Habit",
    verb: "Create",
    schema: z.object({
      name: z.string().min(1, "Name the habit").max(60),
      emoji: z.string().min(1).max(4),
      targetPerWeek: z.number().int().min(1).max(7),
      accent: z.enum(["ice", "sapphire", "emerald", "ruby", "steel"]),
    }),
    fields: [
      { name: "name", label: "Name", kind: "text", wide: true, placeholder: "e.g. Read 30 min" },
      { name: "emoji", label: "Emoji", kind: "text", placeholder: "📖" },
      { name: "targetPerWeek", label: "Target / week", kind: "number", min: 1, max: 7 },
      { name: "accent", label: "Accent", kind: "select", wide: true, options: opts(["ice", "Ice"], ["sapphire", "Sapphire"], ["emerald", "Emerald"], ["ruby", "Ruby"], ["steel", "Steel"]) },
    ],
    defaults: { name: "", emoji: "✦", targetPerWeek: 7, accent: "ice" },
  },

  goal: {
    label: "Goal",
    verb: "Set",
    schema: z.object({
      title: z.string().min(1, "Name the goal").max(120),
      quarter: z.string().regex(/^\d{4}-Q[1-4]$/, "Format: 2026-Q3"),
      area: z.enum(["work", "personal", "health", "growth", "career", "finance"]),
    }),
    fields: [
      { name: "title", label: "Goal", kind: "text", wide: true, placeholder: "e.g. Run a half marathon" },
      { name: "quarter", label: "Quarter", kind: "text", placeholder: "2026-Q3" },
      { name: "area", label: "Area", kind: "select", options: opts(["work", "Work"], ["personal", "Personal"], ["health", "Health"], ["growth", "Growth"], ["career", "Career"], ["finance", "Finance"]) },
    ],
    defaults: { title: "", quarter: "", area: "personal" },
  },

  keyResult: {
    label: "Key result",
    verb: "Add",
    schema: z.object({
      goalId: z.string().min(1),
      title: z.string().min(1, "Name the key result").max(120),
      current: z.number(),
      target: z.number(),
      unit: z.string().max(12).optional(),
    }),
    fields: [
      { name: "goalId", label: "", kind: "hidden" },
      { name: "title", label: "Key result", kind: "text", wide: true, placeholder: "e.g. Weekly distance" },
      { name: "current", label: "Current", kind: "number", step: 0.1 },
      { name: "target", label: "Target", kind: "number", step: 0.1 },
      { name: "unit", label: "Unit", kind: "text", wide: true, placeholder: "km, books, % …" },
    ],
    defaults: { goalId: "", title: "", current: 0, target: 10, unit: "" },
  },

  mood: {
    label: "Mood entry",
    verb: "Log",
    schema: z.object({
      date: dateStr,
      mood: z.number().int().min(1).max(10),
      energy: z.number().int().min(1).max(10),
      tags: z.string().max(200).optional(),
      note: z.string().max(1000).optional(),
    }),
    fields: [
      { name: "date", label: "Date", kind: "date", wide: true },
      { name: "mood", label: "Mood (1–10)", kind: "number", min: 1, max: 10 },
      { name: "energy", label: "Energy (1–10)", kind: "number", min: 1, max: 10 },
      { name: "tags", label: "Tags", kind: "text", wide: true, placeholder: "focused, calm (comma-separated)" },
      { name: "note", label: "Note", kind: "textarea", wide: true },
    ],
    defaults: { date: todayStr(), mood: 7, energy: 6, tags: "", note: "" },
  },

  journal: {
    label: "Journal entry",
    verb: "Write",
    schema: z.object({
      date: dateStr,
      title: z.string().min(1, "Give it a title").max(120),
      content: z.string().min(1, "One honest line counts").max(20000),
      gratitude: z.string().max(300).optional(),
    }),
    fields: [
      { name: "title", label: "Title", kind: "text", wide: true, placeholder: "Name today" },
      { name: "date", label: "Date", kind: "date", wide: true },
      { name: "content", label: "Reflection", kind: "textarea", wide: true, placeholder: "Write freely — nobody's watching." },
      { name: "gratitude", label: "Grateful for", kind: "text", wide: true, placeholder: "Small counts." },
    ],
    defaults: { date: todayStr(), title: "", content: "", gratitude: "" },
  },

  workout: {
    label: "Workout",
    verb: "Log",
    schema: z.object({
      date: dateStr,
      type: z.enum(["run", "strength", "cycle", "swim", "yoga", "climb", "walk", "other"]),
      durationMin: z.number().int().min(5).max(600),
      load: z.number().int().min(1).max(100),
      notes: z.string().max(1000).optional(),
    }),
    fields: [
      { name: "date", label: "Date", kind: "date" },
      { name: "type", label: "Type", kind: "select", options: opts(["run", "Run"], ["strength", "Strength"], ["cycle", "Cycle"], ["swim", "Swim"], ["yoga", "Yoga"], ["climb", "Climb"], ["walk", "Walk"], ["other", "Other"]) },
      { name: "durationMin", label: "Duration (min)", kind: "number", min: 5, max: 600, step: 5 },
      { name: "load", label: "Effort (1–100)", kind: "number", min: 1, max: 100, hint: "How hard it felt" },
      { name: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
    defaults: { date: todayStr(), type: "run", durationMin: 45, load: 50, notes: "" },
  },

  personalRecord: {
    label: "Personal record",
    verb: "Log",
    schema: z.object({
      exercise: z.string().min(1, "Name the exercise").max(60),
      value: z.number(),
      unit: z.string().min(1).max(12),
      date: dateStr,
    }),
    fields: [
      { name: "exercise", label: "Exercise", kind: "text", wide: true, placeholder: "e.g. Deadlift" },
      { name: "value", label: "Value", kind: "number", step: 0.1 },
      { name: "unit", label: "Unit", kind: "text", placeholder: "kg, min, km" },
      { name: "date", label: "Date", kind: "date", wide: true },
    ],
    defaults: { exercise: "", value: 0, unit: "kg", date: todayStr() },
  },

  course: {
    label: "Learning item",
    verb: "Add",
    schema: z.object({
      title: z.string().min(1, "Name it").max(120),
      provider: z.string().max(60).optional(),
      kind: z.enum(["course", "book", "project"]),
      progress: z.number().int().min(0).max(100),
      hours: z.number().min(0).max(10000),
      status: z.enum(["active", "queued", "done"]),
    }),
    fields: [
      { name: "title", label: "Title", kind: "text", wide: true },
      { name: "provider", label: "Provider / author", kind: "text" },
      { name: "kind", label: "Kind", kind: "select", options: opts(["course", "Course"], ["book", "Book"], ["project", "Project"]) },
      { name: "status", label: "Status", kind: "select", options: opts(["active", "In progress"], ["queued", "Up next"], ["done", "Completed"]) },
      { name: "progress", label: "Progress %", kind: "number", min: 0, max: 100, step: 5 },
      { name: "hours", label: "Hours invested", kind: "number", min: 0, step: 0.5, wide: true },
    ],
    defaults: { title: "", provider: "", kind: "course", progress: 0, hours: 0, status: "active" },
  },

  careerEvent: {
    label: "Career event",
    verb: "Log",
    schema: z.object({
      date: dateStr,
      type: z.enum(["win", "application", "interview", "offer", "milestone"]),
      title: z.string().min(1, "Describe it").max(140),
      detail: z.string().max(1000).optional(),
      status: z.enum(["", "applied", "screening", "interview", "offer", "rejected"]).optional(),
    }),
    fields: [
      { name: "title", label: "Title", kind: "text", wide: true, placeholder: "e.g. Led the incident review" },
      { name: "date", label: "Date", kind: "date" },
      { name: "type", label: "Type", kind: "select", options: opts(["win", "Win"], ["application", "Application"], ["interview", "Interview"], ["offer", "Offer"], ["milestone", "Milestone"]) },
      { name: "status", label: "Stage", kind: "select", wide: true, hint: "For applications", options: opts(["", "—"], ["applied", "Applied"], ["screening", "Screening"], ["interview", "Interview"], ["offer", "Offer"], ["rejected", "Rejected"]) },
      { name: "detail", label: "Detail", kind: "textarea", wide: true },
    ],
    defaults: { date: todayStr(), type: "win", title: "", detail: "", status: "" },
  },

  transaction: {
    label: "Transaction",
    verb: "Add",
    schema: z.object({
      date: dateStr,
      description: z.string().min(1, "Describe it").max(120),
      direction: z.enum(["expense", "income"]),
      amount: z.number().positive("Amount must be positive"),
      category: z.enum(["income", "housing", "food", "transport", "leisure", "health", "tools", "savings", "other"]),
      account: z.enum(["checking", "savings", "credit"]),
    }),
    fields: [
      { name: "description", label: "Description", kind: "text", wide: true, placeholder: "e.g. Groceries" },
      { name: "direction", label: "Direction", kind: "select", options: opts(["expense", "Expense"], ["income", "Income"]) },
      { name: "amount", label: "Amount", kind: "number", min: 0, step: 0.01 },
      { name: "category", label: "Category", kind: "select", options: opts(["food", "Food"], ["housing", "Housing"], ["transport", "Transport"], ["leisure", "Leisure"], ["health", "Health"], ["tools", "Tools"], ["savings", "Savings"], ["income", "Income"], ["other", "Other"]) },
      { name: "account", label: "Account", kind: "select", options: opts(["checking", "Checking"], ["savings", "Savings"], ["credit", "Credit card"]) },
      { name: "date", label: "Date", kind: "date", wide: true },
    ],
    defaults: { date: todayStr(), description: "", direction: "expense", amount: 0, category: "food", account: "checking" },
  },
} as const satisfies Record<string, EntityDef>;

export type EntityKey = keyof typeof ENTITIES;

export const ENTITY_KEYS = Object.keys(ENTITIES) as EntityKey[];
