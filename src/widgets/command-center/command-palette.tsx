"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, CornerDownLeft } from "lucide-react";

import { ALL_MODULES } from "@/shared/config/navigation";
import { ENTITIES, type EntityKey } from "@/features/crud/registry";
import { useCommandStore } from "@/features/crud/store";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Kbd } from "@/shared/ui/kbd";
import { cn } from "@/shared/lib/utils";

interface Command {
  id: string;
  group: "Go to" | "Create";
  label: string;
  keywords: string;
  run: () => void;
}

/** ⌘K palette: navigation + create actions, keyboard-first. */
export function CommandPalette() {
  const router = useRouter();
  const { paletteOpen, setPaletteOpen, openEntity } = useCommandStore();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);

  const commands = React.useMemo<Command[]>(() => {
    const nav: Command[] = ALL_MODULES.map((m) => ({
      id: `nav:${m.href}`,
      group: "Go to",
      label: m.label,
      keywords: `${m.label} ${m.description}`.toLowerCase(),
      run: () => router.push(m.href),
    }));
    const create: Command[] = (Object.keys(ENTITIES) as EntityKey[]).map(
      (key) => ({
        id: `new:${key}`,
        group: "Create",
        label: `${ENTITIES[key].verb} ${ENTITIES[key].label.toLowerCase()}`,
        keywords: `new add create log ${ENTITIES[key].label}`.toLowerCase(),
        run: () => openEntity(key),
      }),
    );
    return [...nav, ...create];
  }, [router, openEntity]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.keywords.includes(q));
  }, [commands, query]);

  React.useEffect(() => setActive(0), [query, paletteOpen]);

  function close() {
    setPaletteOpen(false);
    setQuery("");
  }

  function runCommand(cmd: Command) {
    close();
    cmd.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      runCommand(filtered[active]);
    }
  }

  if (!paletteOpen) return null;

  let lastGroup = "";

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="top-[20%] max-w-xl -translate-y-0 p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="border-b border-white/8 p-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search modules or create anything…"
            aria-label="Command search"
            className="w-full bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-steel focus:outline-none"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-steel">
              Nothing matches &ldquo;{query}&rdquo;
            </p>
          )}
          {filtered.map((cmd, i) => {
            const showGroup = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            return (
              <React.Fragment key={cmd.id}>
                {showGroup && (
                  <p className="px-3 pb-1 pt-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-steel">
                    {cmd.group}
                  </p>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => runCommand(cmd)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.8125rem]",
                    "transition-colors duration-100",
                    i === active
                      ? "bg-ice/10 text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {cmd.group === "Create" && (
                    <Plus className="size-3.5 text-ice" aria-hidden />
                  )}
                  <span className="flex-1">{cmd.label}</span>
                  {i === active && (
                    <CornerDownLeft
                      className="size-3 text-steel"
                      aria-hidden
                    />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex items-center gap-3 border-t border-white/8 px-4 py-2.5 text-[0.625rem] text-steel">
          <span className="flex items-center gap-1">
            <Kbd>↑↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> select
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd> close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
