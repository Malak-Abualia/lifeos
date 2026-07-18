import {
  LayoutDashboard,
  CalendarCheck,
  Repeat,
  Target,
  GraduationCap,
  Briefcase,
  Dumbbell,
  SmilePlus,
  NotebookPen,
  Wallet,
  BarChart3,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavModule {
  /** Route segment, e.g. "/planner" */
  href: string;
  label: string;
  icon: LucideIcon;
  /** One-line purpose shown in tooltips and module headers */
  description: string;
  /** Accent used for active states and module theming */
  accent: "ice" | "sapphire" | "emerald" | "ruby" | "steel";
}

export interface NavSection {
  title: string;
  modules: NavModule[];
}

/**
 * Single source of truth for LifeOS modules.
 * The sidebar, command menu, and module headers all read from here.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    modules: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Your entire life at a glance",
        accent: "ice",
      },
      {
        href: "/analytics",
        label: "Analytics",
        icon: BarChart3,
        description: "Cross-module trends and correlations",
        accent: "sapphire",
      },
      {
        href: "/insights",
        label: "AI Insights",
        icon: Sparkles,
        description: "Patterns and suggestions surfaced for you",
        accent: "ice",
      },
    ],
  },
  {
    title: "Execution",
    modules: [
      {
        href: "/planner",
        label: "Daily Planner",
        icon: CalendarCheck,
        description: "Time-blocked schedule and task triage",
        accent: "sapphire",
      },
      {
        href: "/habits",
        label: "Habits",
        icon: Repeat,
        description: "Streaks, consistency, and identity",
        accent: "emerald",
      },
      {
        href: "/goals",
        label: "Goals",
        icon: Target,
        description: "Quarterly objectives and key results",
        accent: "ice",
      },
    ],
  },
  {
    title: "Growth",
    modules: [
      {
        href: "/learning",
        label: "Learning Hub",
        icon: GraduationCap,
        description: "Courses, books, and skill trees",
        accent: "sapphire",
      },
      {
        href: "/career",
        label: "Career",
        icon: Briefcase,
        description: "Trajectory, wins, and applications",
        accent: "steel",
      },
    ],
  },
  {
    title: "Wellbeing",
    modules: [
      {
        href: "/fitness",
        label: "Fitness",
        icon: Dumbbell,
        description: "Training load, body metrics, recovery",
        accent: "emerald",
      },
      {
        href: "/mood",
        label: "Mood",
        icon: SmilePlus,
        description: "Emotional weather over time",
        accent: "ice",
      },
      {
        href: "/journal",
        label: "Journal",
        icon: NotebookPen,
        description: "Daily reflection and gratitude",
        accent: "steel",
      },
    ],
  },
  {
    title: "Resources",
    modules: [
      {
        href: "/finance",
        label: "Finance",
        icon: Wallet,
        description: "Cashflow, budgets, and runway",
        accent: "emerald",
      },
      {
        href: "/settings",
        label: "Settings",
        icon: Settings,
        description: "Preferences, data, and appearance",
        accent: "steel",
      },
    ],
  },
];

export const ALL_MODULES: NavModule[] = NAV_SECTIONS.flatMap(
  (s) => s.modules,
);
