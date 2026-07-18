import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-wide transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        ice: "border-ice/25 bg-ice/10 text-ice",
        sapphire: "border-sapphire/30 bg-sapphire/12 text-[#7db8ea]",
        emerald: "border-emerald/25 bg-emerald/10 text-emerald",
        ruby: "border-ruby/25 bg-ruby/10 text-ruby",
        steel: "border-white/10 bg-white/5 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "steel",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
