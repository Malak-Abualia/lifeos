"use client";

import * as React from "react";

import { useCommandStore } from "@/features/crud/store";
import { CommandPalette } from "./command-palette";
import { EntityDialog } from "./entity-dialog";
import { QuickAdd } from "./quick-add";

/**
 * Mounted once in the app shell: global keyboard shortcuts, the ⌘K
 * palette, the floating Quick Add, and the universal entity dialog.
 */
export function CommandCenter() {
  const { setPaletteOpen, paletteOpen } = useCommandStore();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, setPaletteOpen]);

  return (
    <>
      <CommandPalette />
      <EntityDialog />
      <QuickAdd />
    </>
  );
}
