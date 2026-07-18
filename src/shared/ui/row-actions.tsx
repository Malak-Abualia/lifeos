"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * Hover-revealed edit/delete affordance for list rows.
 * Wrap the row in a `group` class; these fade in on hover/focus.
 */
export function RowActions({
  onEdit,
  onDelete,
  label,
  className,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  /** Accessible name of the row, e.g. the task title */
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150",
        "group-hover:opacity-100 focus-within:opacity-100",
        className,
      )}
    >
      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={`Edit ${label}`}
          className="rounded-md p-1.5 text-steel transition-colors hover:bg-white/8 hover:text-ice"
        >
          <Pencil className="size-3.5" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${label}`}
          className="rounded-md p-1.5 text-steel transition-colors hover:bg-ruby/15 hover:text-ruby"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </span>
  );
}
