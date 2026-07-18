# ❄️ LifeOS

**A local-first personal operating system — plan, track, reflect, and review, all in one app.**

LifeOS brings the scattered parts of a life under one roof: a time-blocked planner, habit
streaks, quarterly OKRs, mood and journaling, fitness, learning, career, and finance — plus
an analytics layer that reads across all of them.

Every byte lives in a local SQLite file on your machine. There is no account, no sync, and
no telemetry. The data is yours, and a single click exports all of it as JSON.

Built with Next.js 15 (App Router), React 19, Prisma 7, and a **Deep Winter** glassmorphic
design system.

---

## ✨ Features

Fifteen routes across five sections, all backed by real data — no mock screens.

### Overview

| Module | What it does |
|---|---|
| **Dashboard** | Weekly momentum composite chart, active habit streaks with target rings, today's task counts, and a first-run onboarding state when the database is empty. |
| **Daily Check-in** | Habits, mood, energy, tags, a journal entry, and tomorrow's top 3 — one form, one submit, under three minutes. Shows per-section completion as you go. |
| **Reviews** | Weekly, monthly, and yearly retrospectives. Each period renders a summary, deltas against the previous period, insights scoped to that window, and generated recommendations. |
| **Analytics** | Cross-module weekly series normalized to a shared 0–100 axis, Pearson correlations between domains, and a table view of the underlying numbers. |
| **AI Insights** | A deterministic six-rule pattern engine — no LLM involved. Surfaces workout↔mood links, your strongest streak, lagging habits, spending trends, consistency direction, and a journaling nudge. |

*Why it exists:* the point of tracking is the readout. These five pages are where the data
from every other module turns into something you can act on.

### Execution

- **Daily Planner** — time-block timeline with a live now-line, quick add, optimistic task
  toggling, and an unscheduled backlog for tasks without a start time.
- **Habits** — 16-week contribution heatmap, streak engine, and one-tap check-in for today.
- **Goals** — quarterly OKR cards with progress rings and support for inverted metrics
  (where lower is better).

### Wellbeing

- **Mood** — 30-day mood and energy chart, slider-based daily check-in, and tag frequency.
- **Journal** — React Hook Form + Zod compose card, rotating prompts, and gratitude blocks.
- **Fitness** — weekly training-load chart, personal-record board, and recent sessions.

### Growth & Resources

- **Learning Hub** — three-stage pipeline (active / queued / done), hours invested, progress bars.
- **Career** — trajectory timeline plus an application pipeline with per-stage status dots.
- **Finance** — cashflow chart, category breakdown, and a sortable TanStack table of transactions.

### System-wide

- **Universal CRUD engine** — one entity registry declares a Zod schema and field layout for
  each of the 11 editable entities. From that single entry, the app generates the form, the
  dialog, the command-palette action, and the validated save/delete server actions. Adding a
  table means one Prisma model plus one registry entry.
- **⌘K command palette** — navigate to any module or create any entity, driven by the same
  navigation and entity registries.
- **Quick Add** — a floating action on every page for task, workout, transaction, journal,
  mood, and career win.
- **Row actions** — hover-to-edit and delete affordances wired into every module's lists.
- **Settings** — profile form (RHF + Zod, persisted to `localStorage`), theme switch, JSON
  export via `/api/export`, and a type-to-confirm danger zone that erases all data.

---

## 📸 Screenshots

> Screenshots are not yet captured. Drop PNGs at the paths below and they will render here.

| | |
|---|---|
| **Dashboard**<br>`docs/screenshots/dashboard.png` | **Planner**<br>`docs/screenshots/planner.png` |
| **Habits**<br>`docs/screenshots/habits.png` | **Daily Check-in**<br>`docs/screenshots/checkin.png` |
| **Goals**<br>`docs/screenshots/goals.png` | **Finance**<br>`docs/screenshots/finance.png` |
| **Analytics**<br>`docs/screenshots/analytics.png` | **Reviews**<br>`docs/screenshots/reviews.png` |
| **Settings**<br>`docs/screenshots/settings.png` | |

---

## 🎨 Design Philosophy

**Deep Winter** — a cold, quiet, high-contrast palette that stays out of the way of the data.
All tokens live in [`src/app/globals.css`](src/app/globals.css).

**Palette.** Midnight Navy `#08111F` for the page, Obsidian `#0B0F19` for depth, Ice Blue
`#6EC6FF` as the primary accent, Sapphire `#1E88E5` for actions, Emerald `#10B981` for
success, Ruby `#EF4444` for danger, Arctic White `#F5F7FA` for text, Steel Gray `#6E7B8B`
for muted.

**Glassmorphism.** Three surface tiers — `glass-subtle` → `glass` → `glass-raised` — with
increasing blur, border weight, and shadow. Every floating panel is a `GlassCard`, so
elevation reads consistently rather than being hand-tuned per screen.

**Motion.** One easing curve everywhere: `--ease-swift`, `cubic-bezier(0.32, 0.72, 0, 1)`.
Entrances stagger at 60 ms. The sidebar's active pill uses a Framer Motion shared-layout
spring. A `prefers-reduced-motion` block collapses all of it.

**Typography.** Geist Sans and Geist Mono, with tabular numerals on every metric so figures
don't jitter as they update.

**Spacing.** A single radius and shadow scale drives all surfaces; module pages share one
header and grid rhythm.

**Accessibility.** Global `:focus-visible` rings, `aria-current` on active navigation,
`aria-label` on icon-only buttons, `aria-hidden` on decorative icons. Chart colors are not
the raw brand hues — `--chart-1…4` are darkened steps validated for lightness band, chroma,
colorblind separation, and 3:1 contrast against the midnight surface.

**Consistency.** Navigation is data. `shared/config/navigation.ts` is the single source of
truth for all 15 modules and feeds the sidebar, the topbar context, and the command palette.

---

## 🏗 Architecture

[Feature-Sliced Design](https://feature-sliced.design/). Layers import strictly downward:

```
app → widgets → features → entities → shared
```

| Layer | Responsibility |
|---|---|
| `src/app` | Next.js App Router. Thin route files only — pages fetch data and compose widgets. No business logic. |
| `src/widgets` | Large composite blocks, one folder per widget: the shell, each module's UI, the command center. |
| `src/features` | User interactions and their server actions: CRUD engine, planner, habits, mood, journal. |
| `src/entities` | Domain logic independent of UI — currently the range-parameterized insight engine. |
| `src/shared` | Zero-dependency foundation: design-system primitives, `cn`/date utils, Prisma singleton, navigation registry. |

**Server components by default.** `"use client"` appears only where interaction or Framer
Motion requires it. Mutations go through server actions that validate with Zod and
revalidate the tree.

**The insight engine** (`entities/insights/engine.ts`) operates on an arbitrary `[from, to)`
window, so the same rules power the 60-day AI Insights page and the weekly/monthly/yearly
Reviews without duplication.

Full detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🛠 Tech Stack

Generated from [`package.json`](package.json).

**Frontend** — Next.js 15.5 (App Router) · React 19.1 · TypeScript 5

**UI** — Tailwind CSS v4 · Radix UI primitives (dialog, select, tabs, popover, tooltip,
switch, slider, checkbox, dropdown, scroll-area, progress, avatar, label, separator, slot) ·
Framer Motion 12 · Lucide React · `class-variance-authority` · `clsx` · `tailwind-merge` ·
`tw-animate-css` · `next-themes`

**State management** — Zustand 5 (one global UI store for the entity dialog and command palette)

**Forms** — React Hook Form 7 · `@hookform/resolvers`

**Validation** — Zod 4 (shared between client forms and server actions)

**Charts & tables** — Recharts 3 · TanStack Table 8

**Database** — Prisma 7 · SQLite via `@prisma/adapter-better-sqlite3` · 12 domain models

**Utilities** — `date-fns` 4

**Tooling** — ESLint 9 with `eslint-config-next` · `tsx` · `dotenv` · PostCSS

---

## 🚀 Getting Started

**Requirements:** Node.js 20+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Configure the database URL
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env

# 3. Generate the Prisma client (output: src/generated/prisma)
npx prisma generate

# 4. Create the SQLite schema
npx prisma db push

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000>. The app starts empty and shows a first-run onboarding state.

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite connection string. `.env` is gitignored, so create it locally. |
| `SEED_DEMO` | No | Must equal `1` to allow seeding. |

### Optional: demo data

The seed inserts ~120 days of deterministic, correlated data so Analytics and Insights have
patterns to work with.

> ⚠️ **The seed wipes every table before inserting.** It refuses to run without the guard flag.

```bash
SEED_DEMO=1 npx prisma db seed
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## 📂 Project Structure

```
.
├── docs/
│   └── ARCHITECTURE.md
├── prisma/
│   ├── schema.prisma          # 12 models: Task, Habit, HabitLog, Goal, KeyResult,
│   │                          # MoodEntry, JournalEntry, Workout, PersonalRecord,
│   │                          # Course, CareerEvent, Transaction
│   └── seed.ts                # Guarded demo seed (SEED_DEMO=1)
├── public/
├── src/
│   ├── app/                   # Routes — thin pages that compose widgets
│   │   ├── analytics/  career/  checkin/  finance/  fitness/
│   │   ├── goals/  habits/  insights/  journal/  learning/
│   │   ├── mood/  planner/  reviews/  settings/
│   │   ├── api/export/        # GET — full JSON data export
│   │   ├── globals.css        # Deep Winter tokens
│   │   ├── layout.tsx         # Fonts, providers, AppShell
│   │   ├── page.tsx           # Dashboard
│   │   └── providers.tsx      # next-themes + Radix Tooltip
│   │
│   ├── widgets/               # Composite blocks
│   │   ├── shell/             # AppShell, Sidebar, Topbar
│   │   ├── command-center/    # Command palette, entity dialog, quick add
│   │   ├── dashboard/         # Overview composition
│   │   └── analytics/ career/ checkin/ finance/ fitness/ goals/
│   │       habits/ insights/ journal/ learning/ mood/ planner/
│   │       reviews/ settings/ module-placeholder/
│   │
│   ├── features/              # Interactions + server actions
│   │   ├── crud/              # registry.ts · actions.ts · store.ts · to-form.ts
│   │   └── habits/ journal/ mood/ planner/
│   │
│   ├── entities/
│   │   └── insights/engine.ts # Range-parameterized analytics rules
│   │
│   └── shared/
│       ├── config/navigation.ts
│       ├── lib/               # db.ts (Prisma singleton) · dates.ts · utils.ts
│       └── ui/                # button, glass-card, badge, progress, tooltip,
│                              # dialog, input, select, checkbox, separator,
│                              # kbd, row-actions, animate
├── TODO.md
├── next.config.ts
├── prisma.config.ts
└── package.json
```

---

## 📈 Current Status

Milestones M1–M7 are complete. The app is usable end to end.

- ✅ **Foundation** — Deep Winter tokens, UI primitives, app shell with animated sidebar,
  navigation registry, CVD-validated chart palette.
- ✅ **Data layer** — Prisma 7 schema with 12 models, SQLite driver adapter, dev-singleton
  client, guarded seed, Zod-validated server actions.
- ✅ **All 15 module routes** — every navigation entry resolves to a real page rendering real
  data from the database.
- ✅ **Full CRUD** — create, edit, and delete for all 11 editable entities from anywhere in
  the UI, generated from one registry.
- ✅ **Command palette and Quick Add** — keyboard-first navigation and capture.
- ✅ **Daily Check-in and Reviews** — daily capture loop plus weekly/monthly/yearly retrospectives.
- ✅ **Insight engine** — six deterministic rules shared between AI Insights and Reviews.
- ✅ **Data ownership** — JSON export endpoint and a type-to-confirm erase in Settings.

---

## 🛣 Roadmap

Tracked in [TODO.md](TODO.md).

**Short-term**

- Full light-theme pass — tokens exist, but the glass utilities are still dark-tuned and the
  root element is pinned to `dark`.
- Drag-to-reschedule time blocks in the Planner.

**Mid-term**

- Recurring tasks and habit reminders.
- End-to-end smoke tests (Playwright).

**Long-term**

- PostgreSQL production configuration and deployment notes. The current datasource is SQLite
  only; a production setup would swap the Prisma driver adapter.

---

## 🤝 Contributing

Issues and pull requests are welcome.

- Keep the layer rule intact: `app → widgets → features → entities → shared`, never upward.
- New data surfaces should go through the CRUD registry rather than bespoke forms — one
  Prisma model, one registry entry, one `toForm` mapper.
- Prefer server components; reach for `"use client"` only when interaction or motion demands it.
- Reuse the design tokens in `globals.css`; avoid one-off colors, easings, and radii.
- Run `npm run lint` and `npm run build` before opening a PR.

---

## 📄 License

MIT
