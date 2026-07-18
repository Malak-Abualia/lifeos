# LifeOS Architecture

## Feature-Sliced Design

```
src/
├── app/          # Next.js App Router — thin route files only.
│   │             # Pages compose widgets; no business logic here.
│   ├── layout.tsx        # Root: fonts, providers, AppShell
│   ├── providers.tsx     # next-themes + Radix Tooltip provider
│   └── <module>/page.tsx # One folder per module route
│
├── widgets/      # Large composite blocks, one folder per widget.
│   ├── shell/            # Sidebar, Topbar, AppShell
│   ├── dashboard/        # Dashboard overview composition
│   └── module-placeholder/
│
├── features/     # (M2+) User interactions: add-task, check-habit…
├── entities/     # (M2+) Domain models + their UI: Task, Habit, Goal…
│
└── shared/       # Zero-dependency foundation, imported by everyone.
    ├── ui/               # Design-system primitives (shadcn-style)
    ├── lib/              # utils (cn), helpers
    └── config/           # navigation registry, constants
```

**Import rule (top may import bottom, never the reverse):**
`app → widgets → features → entities → shared`

## Design system — Deep Winter

All tokens live in `src/app/globals.css`:

- **Palette** — Midnight Navy `#08111F` (page), Obsidian `#0B0F19`, Ice Blue
  `#6EC6FF` (primary accent), Sapphire `#1E88E5` (actions), Emerald
  `#10B981` (success), Ruby `#EF4444` (danger), Arctic White `#F5F7FA`
  (text), Steel Gray `#6E7B8B` (muted).
- **Surfaces** — three glass tiers: `glass-subtle` → `glass` → `glass-raised`
  (increasing blur, border, and shadow). Every floating panel is a
  `GlassCard`.
- **Chart colors** — `--chart-1…4` are *not* the raw brand hues; they are
  darkened steps validated for lightness band, chroma, colorblind
  separation, and 3:1 contrast against the midnight surface.
- **Motion** — one easing curve everywhere: `cubic-bezier(0.32, 0.72, 0, 1)`
  (`--ease-swift`). Entrances stagger 60 ms; the sidebar active pill uses a
  Framer Motion shared layout spring. `prefers-reduced-motion` collapses all
  animation.
- **Type** — Geist Sans / Geist Mono, tabular numerals on all metrics.

## Conventions

- Navigation is data: `shared/config/navigation.ts` drives the sidebar,
  topbar context, placeholders, and (later) the command palette. Adding a
  module = one registry entry + one route folder.
- Server components by default; `"use client"` only where interaction or
  Framer Motion requires it.
- Accessibility: visible `:focus-visible` rings globally, `aria-current` on
  active nav, `aria-label` on icon-only buttons, decorative icons are
  `aria-hidden`.

## CRUD engine (M7)

Every table gets its UI from one pipeline:

```
shared registry (features/crud/registry.ts)
  └─ Zod schema + field layout per entity
       ├─ EntityDialog (widgets/command-center) — auto-generated RHF form
       ├─ saveEntity / deleteEntity server actions — validate with the
       │    same schema, map to Prisma via TO_DB, revalidate the tree
       └─ Command palette "Create" actions
```

Adding a table to the app = 1 Prisma model + 1 registry entry + a
`toForm` mapper. The dialog, palette entry, validation, and server
actions come for free. Module widgets opt in to editing by calling
`useCommandStore().openEntity(key, { id, initial: toForm.x(row) })`.

The insight engine (`entities/insights/engine.ts`) is range-parameterized:
AI Insights runs it over 60 days; Reviews runs it per week/month/year and
adds summaries (`computePeriodSummary`) and recommendations.
