import * as React from "react";

import { cn } from "@/shared/lib/utils";

/** Keyboard shortcut hint, e.g. <Kbd>⌘K</Kbd> */
function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5",
        "border border-white/10 bg-white/5 font-mono text-[0.625rem] font-medium",
        "text-muted-foreground shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]",
        className,
      )}
      {...props}
    />
  );
}

export { Kbd };
