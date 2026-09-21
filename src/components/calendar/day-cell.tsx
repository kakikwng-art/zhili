import { cn } from "@/lib/utils";
import { chipVars, resolveSwatch } from "@/lib/calendar/colors";
import { isSameMonth, toDateKey } from "@/lib/calendar/dates";
import type { CalEvent } from "@/lib/calendar/types";

const VISIBLE_LIMIT = 3;

type DayCellProps = {
  date: Date;
  year: number;
  month: number;
  todayKey: string | null;
  events: CalEvent[];
  onSelect: (key: string) => void;
};

export function DayCell({ date, year, month, todayKey, events, onSelect }: DayCellProps) {
  const key = toDateKey(date);
  const inMonth = isSameMonth(date, year, month);
  const isToday = key === todayKey;
  const isSunday = date.getDay() === 0;
  const extra = Math.max(0, events.length - VISIBLE_LIMIT);
  const visible = extra > 0 ? events.slice(0, VISIBLE_LIMIT) : events;

  return (
    <button
      type="button"
      onClick={() => onSelect(key)}
      aria-label={`${date.getMonth() + 1}月${date.getDate()}日${events.length > 0 ? `，${events.length}件事` : ""}`}
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 flex-col items-stretch overflow-hidden border-r border-b border-rule px-1 pb-0.5 pt-0.5 text-left select-none",
        "transition-colors duration-150 ease-out",
        inMonth ? "bg-paper" : "bg-paper-deep/60",
        isSunday && inMonth && "bg-sunday-wash",
        isToday && "bg-today-wash",
      )}
    >
      <span
        className={cn(
          "cal-date mb-px flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-0.5",
          isToday && "bg-vermilion font-medium text-vermilion-fg",
          !isToday && isSunday && inMonth && "text-vermilion",
          !isToday && !isSunday && inMonth && "text-ink",
          !inMonth && "text-faint",
        )}
      >
        {date.getDate()}
      </span>
      <span className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-px overflow-hidden">
        {visible.map((event) => {
          const swatch = resolveSwatch(event.color, event.category);
          return (
            <span
              key={event.id}
              className={cn("cal-chip", !inMonth && "opacity-50")}
              style={chipVars(swatch)}
            >
              {event.title}
            </span>
          );
        })}
        {extra > 0 ? <span className="cal-event-line font-medium text-muted">+{extra}</span> : null}
      </span>
    </button>
  );
}
