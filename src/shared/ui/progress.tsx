"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/shared/lib/utils";

const ACCENT_GRADIENTS = {
  ice: "from-ice/70 to-ice",
  sapphire: "from-sapphire/70 to-sapphire",
  emerald: "from-emerald/70 to-emerald",
  ruby: "from-ruby/70 to-ruby",
} as const;

function Progress({
  className,
  value,
  accent = "ice",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  accent?: keyof typeof ACCENT_GRADIENTS;
}) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-white/6",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 rounded-full bg-linear-to-r",
          "transition-transform duration-700 ease-(--ease-swift)",
          ACCENT_GRADIENTS[accent],
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
