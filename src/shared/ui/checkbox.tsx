"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer size-4.5 shrink-0 rounded-md border border-white/15 bg-white/4",
        "transition-all duration-200 ease-(--ease-swift)",
        "hover:border-ice/40",
        "data-[state=checked]:border-emerald data-[state=checked]:bg-emerald data-[state=checked]:shadow-[0_0_12px_rgba(16,185,129,0.4)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-midnight">
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
