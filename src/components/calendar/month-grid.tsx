import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendar } from "@/lib/calendar/context";
import { getMonthGrid, monthTitle, toDateKey } from "@/lib/calendar/dates";
import { WEEKDAYS } from "@/lib/calendar/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DayCell } from "./day-cell";

const SWIPE_THRESHOLD = 48;

export function MonthGrid() {
  const { year, month, todayKey, eventsByDate, shiftMonth, selectDate, jumpToToday, selectedDate, searchOpen, backupOpen } =
    useCalendar();
  const days = getMonthGrid(year, month);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (selectedDate || searchOpen || backupOpen) return;
      if (event.key === "ArrowLeft") shiftMonth(-1);
      if (event.key === "ArrowRight") shiftMonth(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backupOpen, searchOpen, selectedDate, shiftMonth]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-1 px-1 pb-1 pt-header">
        <Button size="icon" variant="ghost" className="size-11" aria-label="上个月" onClick={() => shiftMonth(-1)}>
          <ChevronLeft className="size-6" strokeWidth={1.6} />
        </Button>
        <h1 className="min-w-0 flex-1 text-center font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {monthTitle(year, month)}
        </h1>
        <Button size="icon" variant="ghost" className="size-11" aria-label="下个月" onClick={() => shiftMonth(1)}>
          <ChevronRight className="size-6" strokeWidth={1.6} />
        </Button>
        <Button variant="ghost" className="h-11 px-2.5 text-sm text-vermilion" onClick={jumpToToday}>
          今天
        </Button>
      </header>

      <div className="grid shrink-0 grid-cols-7 border-y border-rule">
        {WEEKDAYS.map((label, index) => (
          <div
            key={label}
            className={cn(
              "py-1 text-center text-xs font-medium tracking-wide",
              index === 0 ? "text-vermilion" : "text-muted",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 border-l border-rule"
        onTouchStart={(event) => {
          const touch = event.changedTouches[0];
          if (!touch) return;
          touchStart.current = { x: touch.clientX, y: touch.clientY };
          swiping.current = false;
        }}
        onTouchMove={(event) => {
          const start = touchStart.current;
          const touch = event.changedTouches[0];
          if (!start || !touch) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) swiping.current = true;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const touch = event.changedTouches[0];
          touchStart.current = null;
          if (!start || !touch) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.4) return;
          shiftMonth(dx < 0 ? 1 : -1);
        }}
      >
        {days.map((date) => {
          const key = toDateKey(date);
          return (
            <DayCell
              key={key}
              date={date}
              year={year}
              month={month}
              todayKey={todayKey}
              events={eventsByDate.get(key) ?? []}
              onSelect={(next) => {
                if (swiping.current) return;
                selectDate(next);
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
