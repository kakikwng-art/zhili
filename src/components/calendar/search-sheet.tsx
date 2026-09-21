import { useMemo, useState } from "react";
import { PaperDrawer } from "@/components/ui/drawer";
import { TextField } from "@/components/ui/field";
import { useCalendar } from "@/lib/calendar/context";
import { formatStamp } from "@/lib/calendar/dates";

export function SearchSheet() {
  const { searchOpen, setSearchOpen, events, revealDate } = useCalendar();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return events
      .filter((event) => {
        const blob = `${event.title} ${event.note ?? ""} ${event.category ?? ""} ${event.date}`.toLowerCase();
        return blob.includes(needle);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.createdAt - b.createdAt);
  }, [events, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const event of results) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return [...map.entries()];
  }, [results]);

  return (
    <PaperDrawer open={searchOpen} onOpenChange={setSearchOpen} title="搜索" height="full">
      <div className="px-4 pb-3">
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜过往格子里写的字"
          autoFocus={searchOpen}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {query.trim() === "" ? (
          <p className="py-6 text-sm text-muted">输入关键字，按标题、备注、分类查找。</p>
        ) : grouped.length === 0 ? (
          <p className="py-6 text-sm text-muted">没有找到。</p>
        ) : (
          grouped.map(([date, list]) => (
            <section key={date} className="mb-4">
              <h3 className="mb-1 font-display text-sm font-semibold text-ink">{formatStamp(date)}</h3>
              <ul className="divide-y divide-rule">
                {list.map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-0.5 py-2.5 text-left"
                      onClick={() => {
                        revealDate(event.date);
                        setSearchOpen(false);
                      }}
                    >
                      <span className="text-base text-ink">{event.title}</span>
                      {event.note ? <span className="text-sm text-muted">{event.note}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </PaperDrawer>
  );
}
