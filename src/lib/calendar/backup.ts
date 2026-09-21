import { z } from "zod";
import type { CalendarBackup, CalEvent } from "./types";

const EventSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1),
  time: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

const BackupSchema = z.object({
  app: z.literal("zhili").optional(),
  version: z.number().optional(),
  exportedAt: z.string().optional(),
  events: z.array(EventSchema),
  categories: z.array(z.string()).optional(),
});

export type ParsedBackup = {
  events: CalEvent[];
  categories?: string[];
};

export function serializeBackup(events: CalEvent[], categories: string[]): string {
  const payload: CalendarBackup = {
    app: "zhili",
    version: 1,
    exportedAt: new Date().toISOString(),
    events,
    categories,
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function parseBackup(raw: string): ParsedBackup {
  const parsed: unknown = JSON.parse(raw);
  const data = BackupSchema.parse(parsed);
  const now = Date.now();
  return {
    events: data.events.map((event) => ({
      id: event.id,
      date: event.date,
      title: event.title.trim(),
      time: event.time?.trim() || undefined,
      category: event.category?.trim() || undefined,
      color: event.color?.trim() || undefined,
      note: event.note?.trim() || undefined,
      createdAt: event.createdAt ?? now,
      updatedAt: event.updatedAt ?? now,
    })),
    categories: data.categories?.map((name) => name.trim()).filter(Boolean),
  };
}
