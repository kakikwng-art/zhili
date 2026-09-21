import { useState } from "react";
import { PaperDrawer } from "@/components/ui/drawer";
import { useCalendar } from "@/lib/calendar/context";
import { chipVars, resolveSwatch } from "@/lib/calendar/colors";
import { dayHeading } from "@/lib/calendar/dates";
import type { CalEvent } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";
import { EventComposer, type Draft } from "./event-composer";

export function DaySheet() {
  const { selectedDate, selectDate, eventsByDate, createEvent, saveEvent, removeEvent } = useCalendar();
  const [editing, setEditing] = useState<CalEvent | null>(null);
  const open = selectedDate !== null;
  const events = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];

  function close() {
    setEditing(null);
    selectDate(null);
  }

  async function handleDelete(id: string) {
    await removeEvent(id);
    if (editing?.id === id) setEditing(null);
  }

  async function handleSubmit(draft: Draft) {
    if (!selectedDate) return;
    if (editing) {
      await saveEvent(editing.id, {
        title: draft.title,
        time: draft.time,
        category: draft.category,
        color: draft.color,
        note: draft.note,
      });
      setEditing(null);
      return;
    }
    await createEvent(selectedDate, {
      title: draft.title,
      time: draft.time,
      category: draft.category,
      color: draft.color,
      note: draft.note,
    });
  }

  return (
    <PaperDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      title={selectedDate ? dayHeading(selectedDate) : ""}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        {events.length === 0 ? (
          <p className="py-6 text-sm leading-normal text-muted">这一天还是空白。写一句就好。</p>
        ) : (
          <ul className="flex flex-col divide-y divide-rule">
            {events.map((event) => {
              const active = editing?.id === event.id;
              const swatch = resolveSwatch(event.color, event.category);
              return (
                <li key={event.id} className="flex items-stretch">
                  <button
                    type="button"
                    onClick={() => setEditing(event)}
                    className={cn(
                      "flex min-w-0 flex-1 items-start gap-3 py-3 text-left transition-colors duration-150",
                      active ? "bg-today-wash" : "bg-transparent",
                    )}
                  >
                    <span className="cal-dot mt-1.5 size-2.5 shrink-0 rounded-full" style={chipVars(swatch)} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-baseline gap-2">
                        {event.time ? (
                          <span className="shrink-0 text-xs tabular-nums text-muted">{event.time}</span>
                        ) : null}
                        <span className="text-base font-medium text-ink">{event.title}</span>
                      </span>
                      {event.category || event.note ? (
                        <span className="text-sm leading-normal text-muted">
                          {event.category}
                          {event.category && event.note ? " · " : ""}
                          {event.note}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="shrink-0 px-2 text-xs text-vermilion"
                    aria-label={`删除 ${event.title}`}
                    onClick={() => void handleDelete(event.id)}
                  >
                    删除
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {selectedDate ? (
        <EventComposer
          key={`${selectedDate}-${editing?.id ?? "new"}`}
          editing={editing}
          autoFocus={events.length === 0}
          onSubmit={handleSubmit}
          onDelete={
            editing
              ? async () => {
                  await handleDelete(editing.id);
                }
              : undefined
          }
          onCancelEdit={() => setEditing(null)}
        />
      ) : null}
    </PaperDrawer>
  );
}
