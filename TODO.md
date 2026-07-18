# LifeOS — Roadmap

Milestones ship independently; each ends with a commit and a working app.

## ✅ M1 — Foundation (shipped)

- [x] Next.js 15 + React 19 + TypeScript + Tailwind v4 scaffold
- [x] Deep Winter design tokens (palette, glass, radii, shadows, motion easing)
- [x] Core UI primitives: Button, GlassCard, Badge, Progress, Tooltip, Kbd, Separator
- [x] App shell: frosted sidebar with animated active pill, floating topbar
- [x] Navigation registry (single source of truth for all 13 modules)
- [x] Dashboard overview preview: stat tiles, momentum area chart, streaks
- [x] Route stubs for all modules with premium placeholder state
- [x] Validated chart palette (CVD-safe against #08111F surface)

## M2 — Data layer

- [ ] Prisma schema: Task, Habit, HabitLog, Goal, KeyResult, MoodEntry,
      JournalEntry, Transaction, Workout, Course, CareerEvent
- [ ] SQLite dev database + seed script with realistic demo data
- [ ] Server actions + Zod validation per entity
- [ ] Zustand stores for optimistic client state

## M3 — Execution modules

- [ ] Daily Planner: time-block timeline, task triage, drag to reschedule
- [ ] Habit Tracker: heatmap year view, streak engine, quick check-in
- [ ] Goal System: OKR tree, progress roll-up, quarterly view

## M4 — Wellbeing modules

- [ ] Mood Tracker: emotional weather map, tagging, correlations
- [ ] Journal: distraction-free editor, prompts, gratitude log
- [ ] Fitness: training load chart, body metrics, PR board

## M5 — Growth & resources

- [ ] Learning Hub: course/book pipeline, skill tree
- [ ] Career: timeline of wins, application kanban
- [ ] Finance: cashflow sankey, budget envelopes, runway stat

## M6 — Intelligence & polish

- [ ] Executive Dashboard: live data from all modules
- [ ] Analytics: cross-module correlations (TanStack Table + Recharts)
- [ ] AI Insights: rule-based pattern surfacing
- [ ] Settings: theme, data export, keyboard shortcuts reference
- [ ] Command palette (⌘K) wired to navigation registry
- [ ] Light theme pass; a11y audit (focus order, contrast, reduced motion)
- [ ] PostgreSQL production config + deployment notes
