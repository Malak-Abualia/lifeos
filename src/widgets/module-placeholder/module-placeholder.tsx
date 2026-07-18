"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

import { ALL_MODULES } from "@/shared/config/navigation";
import { Badge } from "@/shared/ui/badge";
import { GlassCard } from "@/shared/ui/glass-card";

/**
 * Elegant construction state shown while a module is on the roadmap.
 * Reads title/description from the navigation registry so copy stays
 * consistent with the sidebar.
 */
export function ModulePlaceholder({ href }: { href: string }) {
  const mod = ALL_MODULES.find((m) => m.href === href);
  if (!mod) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
    >
      <GlassCard className="relative overflow-hidden">
        {/* Soft accent bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-125 -translate-x-1/2 rounded-full bg-ice/6 blur-3xl"
        />
        <div className="relative flex flex-col items-center px-8 py-24 text-center">
          <span className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-ice/20 bg-ice/8 shadow-[0_0_32px_rgba(110,198,255,0.15)]">
            <mod.icon className="size-6 text-ice" aria-hidden />
          </span>
          <Badge variant="ice" className="mb-4">
            <Hammer aria-hidden /> In the workshop
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-gradient-ice">
            {mod.label}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {mod.description}. This module is being crafted — the design
            system and shell landed first, and features arrive in the next
            milestones.
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
