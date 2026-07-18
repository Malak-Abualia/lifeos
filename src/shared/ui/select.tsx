import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/** Styled native select — keyboard-friendly and dependency-free. */
function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select
        className={cn(
          "h-9.5 w-full appearance-none rounded-xl border border-input bg-white/3 px-3.5 pr-8 text-sm",
          "text-foreground transition-colors duration-200",
          "hover:border-white/16 focus:border-ice/40 focus:bg-white/5 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&>option]:bg-obsidian [&>option]:text-foreground",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-steel"
        aria-hidden
      />
    </span>
  );
}

export { Select };
