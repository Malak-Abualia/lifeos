"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";

import { ENTITIES, type EntityDef } from "@/features/crud/registry";
import { saveEntity, deleteEntity } from "@/features/crud/actions";
import { useCommandStore } from "@/features/crud/store";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input, Textarea, Label } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

/**
 * One dialog, every entity. Reads the field layout from the registry and
 * renders a validated two-column form; editing adds a delete affordance.
 */
export function EntityDialog() {
  const router = useRouter();
  const { entity, id, initial, closeEntity } = useCommandStore();
  const [isPending, startTransition] = React.useTransition();
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const def: EntityDef | null = entity ? ENTITIES[entity] : null;

  const form = useForm<Record<string, unknown>>({
    // Resolver switches per entity; remount via `key` below keeps RHF clean
    resolver: def ? zodResolver(def.schema as never) : undefined,
    defaultValues: { ...(def?.defaults ?? {}), ...(initial ?? {}) },
  });

  // Reset when a different entity/row opens
  React.useEffect(() => {
    if (def) {
      form.reset({ ...def.defaults, ...(initial ?? {}) });
      setConfirmDelete(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, id]);

  if (!entity || !def) return null;

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      await saveEntity(entity, id, data);
      closeEntity();
      router.refresh();
    });
  });

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      await deleteEntity(entity!, id!);
      closeEntity();
      router.refresh();
    });
  }

  const errors = form.formState.errors;

  return (
    <Dialog open onOpenChange={(open) => !open && closeEntity()}>
      <DialogContent key={`${entity}:${id ?? "new"}`}>
        <DialogTitle>
          {id ? `Edit ${def.label.toLowerCase()}` : `${def.verb} ${def.label.toLowerCase()}`}
        </DialogTitle>
        <DialogDescription>
          {id ? "Changes save to your local database." : "Saved instantly to your local database."}
        </DialogDescription>

        <form onSubmit={onSubmit} className="mt-5" noValidate>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            {def.fields.map((field) => {
              if (field.kind === "hidden") {
                return (
                  <input
                    key={field.name}
                    type="hidden"
                    {...form.register(field.name)}
                  />
                );
              }
              const error = errors[field.name]?.message as string | undefined;
              const inputId = `ef-${field.name}`;
              return (
                <div
                  key={field.name}
                  className={cn("space-y-1.5", field.wide && "col-span-2")}
                >
                  <Label htmlFor={inputId}>
                    {field.label}
                    {field.hint && (
                      <span className="ml-1.5 font-normal text-steel">
                        · {field.hint}
                      </span>
                    )}
                  </Label>
                  {field.kind === "textarea" ? (
                    <Textarea
                      id={inputId}
                      rows={4}
                      placeholder={field.placeholder}
                      aria-invalid={!!error}
                      {...form.register(field.name)}
                    />
                  ) : field.kind === "select" ? (
                    <Select
                      id={inputId}
                      aria-invalid={!!error}
                      {...form.register(field.name)}
                    >
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      id={inputId}
                      type={
                        field.kind === "number"
                          ? "number"
                          : field.kind === "date"
                            ? "date"
                            : field.kind === "time"
                              ? "time"
                              : "text"
                      }
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      placeholder={field.placeholder}
                      aria-invalid={!!error}
                      className={cn(
                        (field.kind === "date" || field.kind === "time") &&
                          "[color-scheme:dark]",
                      )}
                      {...form.register(field.name, {
                        valueAsNumber: field.kind === "number",
                      })}
                    />
                  )}
                  {error && (
                    <p role="alert" className="text-[0.6875rem] text-ruby">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-2.5">
            {id && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 />
                {confirmDelete ? "Really delete?" : "Delete"}
              </Button>
            )}
            <span className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              onClick={closeEntity}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : id ? "Save changes" : def.verb}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
