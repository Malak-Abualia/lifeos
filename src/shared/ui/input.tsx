import * as React from "react";

import { cn } from "@/shared/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-9.5 w-full rounded-xl border border-input bg-white/3 px-3.5 text-sm",
        "placeholder:text-steel transition-colors duration-200",
        "hover:border-white/16 focus:border-ice/40 focus:bg-white/5 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-input bg-white/3 px-3.5 py-2.5 text-sm leading-relaxed",
        "placeholder:text-steel transition-colors duration-200 resize-none",
        "hover:border-white/16 focus:border-ice/40 focus:bg-white/5 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input, Textarea, Label };
