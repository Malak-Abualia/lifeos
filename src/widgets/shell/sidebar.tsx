"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Snowflake } from "lucide-react";

import { NAV_SECTIONS } from "@/shared/config/navigation";
import { cn } from "@/shared/lib/utils";

/**
 * Fixed frosted-glass navigation rail. The active item carries a shared
 * layout "pill" that glides between routes.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col p-4 lg:flex"
      aria-label="Primary navigation"
    >
      <div className="glass flex h-full flex-col rounded-2xl">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3 px-5 pb-4 pt-5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-sapphire to-[#0d47a1] shadow-[0_0_20px_rgba(30,136,229,0.4)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(110,198,255,0.5)]">
            <Snowflake className="size-4.5 text-arctic" aria-hidden />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[0.9375rem] font-semibold tracking-tight text-foreground">
              LifeOS
            </span>
            <span className="mt-0.5 text-[0.6875rem] text-muted-foreground">
              Personal operating system
            </span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-2.5 pb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-steel">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.modules.map((mod) => {
                  const active =
                    mod.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(mod.href);
                  return (
                    <li key={mod.href}>
                      <Link
                        href={mod.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[0.8125rem]",
                          "transition-colors duration-200",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:bg-white/4 hover:text-foreground",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-xl border border-ice/20 bg-ice/8 shadow-[0_0_16px_rgba(110,198,255,0.12)_inset]"
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 34,
                            }}
                          />
                        )}
                        <mod.icon
                          className={cn(
                            "relative size-4 shrink-0",
                            active ? "text-ice" : "text-steel",
                          )}
                          aria-hidden
                        />
                        <span className="relative">{mod.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/6 px-5 py-3.5">
          <p className="text-[0.6875rem] text-steel">
            v0.1 · Deep Winter
          </p>
        </div>
      </div>
    </aside>
  );
}
