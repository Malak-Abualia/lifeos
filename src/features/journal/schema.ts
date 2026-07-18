import { z } from "zod";

export const journalEntrySchema = z.object({
  title: z.string().min(1, "Give it a title").max(120),
  content: z.string().min(1, "Write something — even one line counts").max(20000),
  gratitude: z.string().max(300).optional(),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
