# LifeOS ❄️

An elite personal operating system — planning, habits, goals, learning,
career, fitness, mood, journaling, finance, and analytics in one place,
wrapped in a **Deep Winter** glassmorphic design language.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion ·
Recharts · TanStack Table · Prisma (SQLite dev / PostgreSQL prod) ·
Zustand · React Hook Form · Zod · next-themes

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project layout

Feature-Sliced Design — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Roadmap and milestone status live in [TODO.md](TODO.md).

| Layer | Purpose |
|---|---|
| `src/app` | Routes only — thin pages that compose widgets |
| `src/widgets` | Shell, dashboard, and other composite blocks |
| `src/features` | User interactions (from M2) |
| `src/entities` | Domain models (from M2) |
| `src/shared` | Design-system primitives, utils, config |
