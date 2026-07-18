"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  X,
  CalendarCheck,
  Dumbbell,
  Wallet,
  NotebookPen,
  SmilePlus,
  Trophy,
} from "lucide-react";

import { useCommandStore } from "@/features/crud/store";
import type { EntityKey } from "@/features/crud/registry";
import { cn } from "@/shared/lib/utils";

const QUICK_ACTIONS: { key: EntityKey; label: string; icon: React.ElementType }[] = [
  { key: "task", label: "Task", icon: CalendarCheck },
  { key: "workout", label: "Workout", icon: Dumbbell },
  { key: "transaction", label: "Transaction", icon: Wallet },
  { key: "journal", label: "Journal", icon: NotebookPen },
  { key: "mood", label: "Mood", icon: SmilePlus },
  { key: "careerEvent", label: "Career win", icon: Trophy },
];

/** Floating Quick Add — available on every page, bottom-right. */
export function QuickAdd() {
  const [open, setOpen] = React.useState(false);
  const openEntity = useCommandStore((s) => s.openEntity);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      <AnimatePresence>
        {open &&
          QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.key}
              type="button"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  delay: (QUICK_ACTIONS.length - 1 - i) * 0.03,
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
              exit={{
                opacity: 0,
                y: 8,
                scale: 0.9,
                transition: { delay: i * 0.02, duration: 0.15 },
              }}
              onClick={() => {
                setOpen(false);
                openEntity(action.key);
              }}
              className={cn(
                "glass-raised flex items-center gap-2.5 rounded-xl py-2 pl-3 pr-4 text-xs font-medium",
                "transition-colors hover:border-ice/30 hover:text-ice",
              )}
            >
              <action.icon className="size-3.5 text-ice" aria-hidden />
              {action.label}
            </motion.button>
          ))}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close quick add" : "Quick add"}
        aria-expanded={open}
        whileTap={{ scale: 0.92 }}
        className={cn(
          "flex size-13 items-center justify-center rounded-2xl",
          "bg-linear-to-b from-sapphire to-[#1565C0] text-arctic",
          "shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_28px_rgba(30,136,229,0.5)]",
          "transition-all duration-300 ease-(--ease-swift) hover:brightness-110",
        )}
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="flex"
        >
          {open ? <X className="size-5" /> : <Plus className="size-5" />}
        </motion.span>
      </motion.button>
    </div>
  );
}
