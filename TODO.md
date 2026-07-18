# LifeOS — Roadmap

Milestones ship independently; each ends with a commit and a working app.

## ✅ M1 — Foundation (shipped)

- [x] Next.js 15 + React 19 + TypeScript + Tailwind v4 scaffold
- [x] Deep Winter design tokens (palette, glass, radii, shadows, motion easing)
- [x] Core UI primitives: Button, GlassCard, Badge, Progress, Tooltip, Kbd, Separator
- [x] App shell: frosted sidebar with animated active pill, floating topbar
- [x] Navigation registry (single source of truth for all 13 modules)
- [x] Validated chart palette (CVD-safe against #08111F surface)

## ✅ M2 — Data layer (shipped)

- [x] Prisma 7 schema: 12 domain models across all modules
- [x] SQLite via better-sqlite3 driver adapter; dev-singleton client
- [x] Deterministic seed: 120 days of correlated demo data
- [x] Server actions + Zod validation (tasks, habits, mood, journal)

## ✅ M3 — Execution modules (shipped)

- [x] Daily Planner: time-block timeline with now-line, quick add, optimistic toggle
- [x] Habit Tracker: 16-week heatmap, streak engine, one-tap check-in
- [x] Goal System: OKR cards, progress rings, inverted-metric support

## ✅ M4 — Wellbeing modules (shipped)

- [x] Mood Tracker: 30-day mood/energy chart, slider check-in, tag frequency
- [x] Journal: RHF + Zod compose card, rotating prompts, gratitude blocks
- [x] Fitness: weekly training load chart, PR board, recent sessions

## ✅ M5 — Growth & resources (shipped)

- [x] Learning Hub: three-stage pipeline, hours invested, progress bars
- [x] Career: trajectory timeline, application pipeline with stage dots
- [x] Finance: cashflow chart, category breakdown, sortable TanStack table

## ✅ M6 — Intelligence (shipped)

- [x] Executive Dashboard: live momentum composite, streaks, real stats
- [x] Analytics: weekly indexed series + Pearson correlations + table view
- [x] AI Insights: 6-rule pattern engine (mood×training, streaks, spending…)
- [x] Settings: profile form (RHF+Zod), theme switch, JSON export API

## M7 — Polish backlog (next)

- [ ] Command palette (⌘K) wired to the navigation registry
- [ ] Light theme full pass (tokens exist; glass utilities are dark-tuned)
- [ ] Drag-to-reschedule blocks in Planner
- [ ] Habit/goal/transaction CRUD dialogs (create & edit from the UI)
- [ ] PostgreSQL production config + deployment notes
- [ ] E2E smoke tests (Playwright)
