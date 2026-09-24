import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addEvent,
  deleteEvent,
  listCategories,
  listEvents,
  listTags,
  renameCategoryOnEvents,
  replaceAllEvents,
  saveCategories,
  saveTags,
  updateEvent,
} from "./db";
import { addMonths, parseDateKey, toDateKey } from "./dates";
import { seedIfEmpty } from "./seed";
import { DEFAULT_CATEGORIES, type CalEvent, type CalTag } from "./types";

type EventDraft = {
  title: string;
  time?: string;
  category?: string;
  color?: string;
  note?: string;
};

type CalendarContextValue = {
  ready: boolean;
  year: number;
  month: number;
  todayKey: string | null;
  selectedDate: string | null;
  searchOpen: boolean;
  backupOpen: boolean;
  events: CalEvent[];
  eventsByDate: Map<string, CalEvent[]>;
  categories: string[];
  jumpToToday: () => void;
  openToday: () => void;
  revealDate: (key: string) => void;
  shiftMonth: (delta: number) => void;
  selectDate: (key: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  setBackupOpen: (open: boolean) => void;
  createEvent: (date: string, draft: EventDraft) => Promise<void>;
  saveEvent: (id: string, draft: EventDraft & { date?: string }) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  restoreEvents: (events: CalEvent[], categories?: string[], tags?: CalTag[]) => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  renameCategory: (from: string, to: string) => Promise<boolean>;
  removeCategory: (name: string) => Promise<void>;
  tags: CalTag[];
  tagsOpen: boolean;
  setTagsOpen: (open: boolean) => void;
  saveTag: (input: { id?: string; title: string; color: string }) => Promise<boolean>;
  removeTag: (id: string) => Promise<void>;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

function sortDay(events: CalEvent[]): CalEvent[] {
  return [...events].sort((a, b) => {
    if (a.time && b.time && a.time !== b.time) return a.time.localeCompare(b.time);
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return a.createdAt - b.createdAt;
  });
}

function localToday() {
  const local = new Date();
  return {
    year: local.getFullYear(),
    month: local.getMonth(),
    key: toDateKey(local),
  };
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  const now = new Date();
  const [ready, setReady] = useState(false);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [tags, setTags] = useState<CalTag[]>([]);

  const reload = useCallback(async () => {
    const [rows, names, stamps] = await Promise.all([listEvents(), listCategories(), listTags()]);
    setEvents(rows);
    setCategories(names);
    setTags(stamps);
  }, []);

  useEffect(() => {
    const today = localToday();
    setCursor({ year: today.year, month: today.month });
    setTodayKey(today.key);
    let cancelled = false;
    void (async () => {
      try {
        await seedIfEmpty();
        const [rows, names, stamps] = await Promise.all([listEvents(), listCategories(), listTags()]);
        if (cancelled) return;
        setEvents(rows);
        setCategories(names);
        setTags(stamps);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    for (const [key, list] of map) map.set(key, sortDay(list));
    return map;
  }, [events]);

  const jumpToToday = useCallback(() => {
    const today = localToday();
    setCursor({ year: today.year, month: today.month });
    setTodayKey(today.key);
  }, []);

  const openToday = useCallback(() => {
    const today = localToday();
    setCursor({ year: today.year, month: today.month });
    setTodayKey(today.key);
    setSelectedDate(today.key);
  }, []);

  const revealDate = useCallback((key: string) => {
    const date = parseDateKey(key);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
    setSelectedDate(key);
  }, []);

  const shiftMonth = useCallback((delta: number) => {
    setCursor((current) => addMonths(current.year, current.month, delta));
  }, []);

  const createEvent = useCallback(
    async (date: string, draft: EventDraft) => {
      await addEvent({ date, ...draft });
      await reload();
    },
    [reload],
  );

  const saveEvent = useCallback(
    async (id: string, draft: EventDraft & { date?: string }) => {
      await updateEvent(id, draft);
      await reload();
    },
    [reload],
  );

  const removeEvent = useCallback(
    async (id: string) => {
      await deleteEvent(id);
      await reload();
    },
    [reload],
  );

  const restoreEvents = useCallback(
    async (next: CalEvent[], nextCategories?: string[], nextTags?: CalTag[]) => {
      await replaceAllEvents(next);
      if (nextCategories && nextCategories.length > 0) {
        await saveCategories(nextCategories);
      }
      if (nextTags) await saveTags(nextTags);
      await reload();
    },
    [reload],
  );

  const addCategory = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return false;
      const current = await listCategories();
      if (current.includes(trimmed)) return false;
      if (current.length >= 20) return false;
      await saveCategories([...current, trimmed]);
      await reload();
      return true;
    },
    [reload],
  );

  const renameCategory = useCallback(
    async (from: string, to: string) => {
      const trimmed = to.trim();
      if (!trimmed || trimmed === from) return false;
      const current = await listCategories();
      if (current.includes(trimmed)) return false;
      await saveCategories(current.map((item) => (item === from ? trimmed : item)));
      await renameCategoryOnEvents(from, trimmed);
      await reload();
      return true;
    },
    [reload],
  );

  const removeCategory = useCallback(
    async (name: string) => {
      const current = await listCategories();
      await saveCategories(current.filter((item) => item !== name));
      await reload();
    },
    [reload],
  );

  const saveTag = useCallback(
    async (input: { id?: string; title: string; color: string }) => {
      const title = input.title.trim();
      const color = input.color.trim();
      if (!title || !color) return false;
      const current = await listTags();
      const duplicate = current.some((tag) => tag.title === title && tag.id !== input.id);
      if (duplicate) return false;
      if (!input.id && current.length >= 24) return false;
      const next = input.id
        ? current.map((tag) => (tag.id === input.id ? { ...tag, title, color } : tag))
        : [...current, { id: crypto.randomUUID(), title, color }];
      if (input.id && !current.some((tag) => tag.id === input.id)) return false;
      await saveTags(next);
      await reload();
      return true;
    },
    [reload],
  );

  const removeTag = useCallback(
    async (id: string) => {
      const current = await listTags();
      await saveTags(current.filter((tag) => tag.id !== id));
      await reload();
    },
    [reload],
  );

  const value = useMemo<CalendarContextValue>(
    () => ({
      ready,
      year: cursor.year,
      month: cursor.month,
      todayKey,
      selectedDate,
      searchOpen,
      backupOpen,
      events,
      eventsByDate,
      categories,
      tags,
      tagsOpen,
      jumpToToday,
      openToday,
      revealDate,
      shiftMonth,
      selectDate: setSelectedDate,
      setSearchOpen,
      setBackupOpen,
      setTagsOpen,
      createEvent,
      saveEvent,
      removeEvent,
      restoreEvents,
      addCategory,
      renameCategory,
      removeCategory,
      saveTag,
      removeTag,
    }),
    [
      ready,
      cursor.year,
      cursor.month,
      todayKey,
      selectedDate,
      searchOpen,
      backupOpen,
      tagsOpen,
      events,
      eventsByDate,
      categories,
      tags,
      jumpToToday,
      openToday,
      revealDate,
      shiftMonth,
      createEvent,
      saveEvent,
      removeEvent,
      restoreEvents,
      addCategory,
      renameCategory,
      removeCategory,
      saveTag,
      removeTag,
    ],
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar(): CalendarContextValue {
  const value = useContext(CalendarContext);
  if (!value) throw new Error("useCalendar must be used within CalendarProvider");
  return value;
}
