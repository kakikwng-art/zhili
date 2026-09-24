import Dexie, { type EntityTable } from "dexie";
import { DEFAULT_CATEGORIES, DEFAULT_TAGS, type CalEvent, type CalTag } from "./types";

type MetaRow = { key: string; value: string };

type CalendarDatabase = Dexie & {
  events: EntityTable<CalEvent, "id">;
  meta: EntityTable<MetaRow, "key">;
};

let database: CalendarDatabase | null = null;

function getDatabase(): CalendarDatabase | null {
  if (typeof indexedDB === "undefined") return null;
  if (database) return database;
  const instance = new Dexie("zhili-calendar") as CalendarDatabase;
  instance.version(1).stores({
    events: "id, date, createdAt, title",
    meta: "key",
  });
  database = instance;
  return instance;
}

function cleanOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function listEvents(): Promise<CalEvent[]> {
  const db = getDatabase();
  if (!db) return [];
  return db.events.orderBy("date").toArray();
}

export async function getMeta(key: string): Promise<string | undefined> {
  const db = getDatabase();
  if (!db) return undefined;
  const row = await db.meta.get(key);
  return row?.value;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = getDatabase();
  if (!db) return;
  await db.meta.put({ key, value });
}

export async function listCategories(): Promise<string[]> {
  const raw = await getMeta("categories");
  if (!raw) {
    await setMeta("categories", JSON.stringify(DEFAULT_CATEGORIES));
    return [...DEFAULT_CATEGORIES];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      const names = parsed.map((item) => item.trim()).filter(Boolean);
      if (names.length > 0) return names;
    }
  } catch {
    // ignore malformed meta and reset
  }
  await setMeta("categories", JSON.stringify(DEFAULT_CATEGORIES));
  return [...DEFAULT_CATEGORIES];
}

export async function saveCategories(names: string[]): Promise<void> {
  const next = names.map((name) => name.trim()).filter(Boolean);
  await setMeta("categories", JSON.stringify(next.length > 0 ? next : DEFAULT_CATEGORIES));
}

function cleanTags(value: unknown): CalTag[] | null {
  if (!Array.isArray(value)) return null;
  const tags: CalTag[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<CalTag>;
    const title = row.title?.trim();
    const color = row.color?.trim();
    const id = row.id?.trim();
    if (!title || !color || !id) continue;
    tags.push({ id, title, color });
  }
  return tags;
}

export async function listTags(): Promise<CalTag[]> {
  const raw = await getMeta("tags");
  if (!raw) {
    await setMeta("tags", JSON.stringify(DEFAULT_TAGS));
    return DEFAULT_TAGS.map((tag) => ({ ...tag }));
  }
  try {
    const parsed = cleanTags(JSON.parse(raw));
    if (parsed) return parsed;
  } catch {
    // ignore malformed meta and reset
  }
  await setMeta("tags", JSON.stringify(DEFAULT_TAGS));
  return DEFAULT_TAGS.map((tag) => ({ ...tag }));
}

export async function saveTags(tags: CalTag[]): Promise<void> {
  const next = tags
    .map((tag) => ({ id: tag.id.trim(), title: tag.title.trim(), color: tag.color.trim() }))
    .filter((tag) => tag.id && tag.title && tag.color);
  await setMeta("tags", JSON.stringify(next));
}

export async function renameCategoryOnEvents(from: string, to: string): Promise<void> {
  const db = getDatabase();
  if (!db) return;
  const rows = await db.events.toArray();
  const nextName = to.trim();
  for (const row of rows) {
    if (row.category !== from) continue;
    const updated: CalEvent = {
      id: row.id,
      date: row.date,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: Date.now(),
    };
    if (row.time) updated.time = row.time;
    if (nextName) updated.category = nextName;
    if (row.color) updated.color = row.color;
    if (row.note) updated.note = row.note;
    await db.events.put(updated);
  }
}

export async function addEvent(input: Omit<CalEvent, "id" | "createdAt" | "updatedAt">): Promise<CalEvent> {
  const db = getDatabase();
  const now = Date.now();
  const event: CalEvent = {
    id: crypto.randomUUID(),
    date: input.date,
    title: input.title.trim(),
    createdAt: now,
    updatedAt: now,
  };
  const time = cleanOptional(input.time);
  const category = cleanOptional(input.category);
  const color = cleanOptional(input.color);
  const note = cleanOptional(input.note);
  if (time) event.time = time;
  if (category) event.category = category;
  if (color) event.color = color;
  if (note) event.note = note;
  if (db) await db.events.add(event);
  return event;
}

export async function updateEvent(
  id: string,
  patch: Partial<Pick<CalEvent, "title" | "time" | "category" | "color" | "note" | "date">>,
): Promise<void> {
  const db = getDatabase();
  if (!db) return;
  const existing = await db.events.get(id);
  if (!existing) return;
  const next: CalEvent = {
    id: existing.id,
    date: patch.date ?? existing.date,
    title: patch.title !== undefined ? patch.title.trim() : existing.title,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
  };
  const time = patch.time !== undefined ? cleanOptional(patch.time) : existing.time;
  const category = patch.category !== undefined ? cleanOptional(patch.category) : existing.category;
  const color = patch.color !== undefined ? cleanOptional(patch.color) : existing.color;
  const note = patch.note !== undefined ? cleanOptional(patch.note) : existing.note;
  if (time) next.time = time;
  if (category) next.category = category;
  if (color) next.color = color;
  if (note) next.note = note;
  await db.events.put(next);
}

export async function deleteEvent(id: string): Promise<void> {
  const db = getDatabase();
  if (!db) return;
  await db.events.delete(id);
}

export async function replaceAllEvents(events: CalEvent[]): Promise<void> {
  const db = getDatabase();
  if (!db) return;
  await db.transaction("rw", db.events, async () => {
    await db.events.clear();
    if (events.length > 0) await db.events.bulkAdd(events);
  });
}
