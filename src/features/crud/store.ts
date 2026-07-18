"use client";

import { create } from "zustand";

import type { EntityKey } from "./registry";

interface EntityDialogState {
  /** Currently open entity form, or null */
  entity: EntityKey | null;
  /** Editing an existing row when set */
  id: string | null;
  /** Form-shaped initial values (overrides registry defaults) */
  initial: Record<string, unknown> | null;
  paletteOpen: boolean;
  openEntity: (
    entity: EntityKey,
    opts?: { id?: string; initial?: Record<string, unknown> },
  ) => void;
  closeEntity: () => void;
  setPaletteOpen: (open: boolean) => void;
}

/** Global UI store: one entity dialog + one command palette, app-wide. */
export const useCommandStore = create<EntityDialogState>((set) => ({
  entity: null,
  id: null,
  initial: null,
  paletteOpen: false,
  openEntity: (entity, opts) =>
    set({
      entity,
      id: opts?.id ?? null,
      initial: opts?.initial ?? null,
      paletteOpen: false,
    }),
  closeEntity: () => set({ entity: null, id: null, initial: null }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
}));
