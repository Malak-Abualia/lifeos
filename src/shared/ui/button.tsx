import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl",
    "text-sm font-medium cursor-pointer select-none",
    "transition-all duration-200 ease-(--ease-swift)",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-linear-to-b from-sapphire to-[#1565C0] text-arctic",
          "shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_16px_rgba(30,136,229,0.35)]",
          "hover:brightness-110 hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_24px_rgba(30,136,229,0.45)]",
        ],
        glass: [
          "glass-subtle text-foreground",
          "hover:bg-white/8 hover:border-white/12",
        ],
        ghost: ["text-muted-foreground", "hover:bg-white/6 hover:text-foreground"],
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-white/5 hover:border-white/16",
        ],
        destructive: [
          "bg-ruby/12 text-ruby border border-ruby/25",
          "hover:bg-ruby/20",
        ],
        link: "text-ice underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-9.5 px-4",
        lg: "h-11 px-6 text-[0.9375rem] rounded-2xl",
        icon: "size-9.5 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonProps };
