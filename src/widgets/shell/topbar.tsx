"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { Search, Bell } from "lucide-react";

import { ALL_MODULES } from "@/shared/config/navigation";
import { Button } from "@/shared/ui/button";
import { Kbd } from "@/shared/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

/**
 * Floating glass header: current module context on the left,
 * search / notifications / date on the right.
 */
export function Topbar() {
  const pathname = usePathname();
  const current =
    ALL_MODULES.find((m) =>
      m.href === "/" ? pathname === "/" : pathname.startsWith(m.href),
    ) ?? ALL_MODULES[0];

  // Rendered client-side only to avoid a server/client date mismatch
  const [today, setToday] = React.useState<string>("");
  React.useEffect(() => {
    setToday(format(new Date(), "EEEE, MMM d"));
  }, []);

  return (
    <header className="sticky top-0 z-30 px-6 pt-4 lg:px-10">
      <div className="glass flex h-14 items-center justify-between rounded-2xl px-4">
        <div className="flex min-w-0 items-center gap-3">
          <current.icon className="size-4 shrink-0 text-ice" aria-hidden />
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-sm font-semibold tracking-tight">
              {current.label}
            </h1>
            <p className="hidden truncate text-[0.6875rem] text-muted-foreground sm:block">
              {current.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="glass-subtle hidden h-9 w-56 items-center gap-2.5 rounded-xl px-3 text-left text-xs text-muted-foreground transition-colors duration-200 hover:border-white/12 hover:text-foreground md:flex"
            aria-label="Search LifeOS"
          >
            <Search className="size-3.5" aria-hidden />
            <span className="flex-1">Search anything…</span>
            <Kbd>⌘K</Kbd>
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="glass" size="icon" aria-label="Notifications">
                <Bell />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <span
            className="hidden pl-1 text-xs tabular text-muted-foreground sm:block"
            suppressHydrationWarning
          >
            {today}
          </span>
        </div>
      </div>
    </header>
  );
}
