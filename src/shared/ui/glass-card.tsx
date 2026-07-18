import * as React from "react";

import { cn } from "@/shared/lib/utils";

/**
 * The foundational surface of LifeOS. Every floating panel is a GlassCard.
 * `interactive` adds hover lift for clickable cards.
 */
function GlassCard({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl",
        interactive &&
          "transition-all duration-300 ease-(--ease-swift) hover:-translate-y-0.5 hover:border-white/14 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_16px_48px_rgba(3,8,18,0.55)]",
        className,
      )}
      {...props}
    />
  );
}

function GlassCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-6 pb-2", className)}
      {...props}
    />
  );
}

function GlassCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function GlassCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function GlassCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-4", className)} {...props} />;
}

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
};
