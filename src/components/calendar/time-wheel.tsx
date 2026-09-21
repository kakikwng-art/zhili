import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

type WheelColumnProps = {
  values: string[];
  value: string;
  ariaLabel: string;
  onChange: (value: string) => void;
};

function WheelColumn({ values, value, ariaLabel, onChange }: WheelColumnProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef(0);
  const syncingRef = useRef(false);

  function itemHeight(root: HTMLDivElement): number {
    const item = root.querySelector("[data-wheel-item]");
    return item?.getBoundingClientRect().height || 36;
  }

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const height = itemHeight(root);
    const index = Math.max(0, values.indexOf(value));
    syncingRef.current = true;
    root.scrollTop = index * height;
    const timer = window.setTimeout(() => {
      syncingRef.current = false;
    }, 80);
    return () => window.clearTimeout(timer);
  }, [value, values]);

  function settle() {
    const root = scrollerRef.current;
    if (!root) return;
    const height = itemHeight(root);
    const index = Math.min(values.length - 1, Math.max(0, Math.round(root.scrollTop / height)));
    const next = values[index];
    if (next && next !== value) onChange(next);
    syncingRef.current = true;
    root.scrollTo({ top: index * height, behavior: "smooth" });
    window.setTimeout(() => {
      syncingRef.current = false;
    }, 120);
  }

  return (
    <div
      className="relative min-w-0 flex-1"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="time-wheel-highlight" />
      <div
        ref={scrollerRef}
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={`${ariaLabel}-${value}`}
        tabIndex={0}
        className="time-wheel-scroller"
        onScroll={() => {
          if (syncingRef.current) return;
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(settle, 80);
        }}
      >
        <div className="time-wheel-spacer" />
        {values.map((item) => (
          <div
            id={`${ariaLabel}-${item}`}
            key={item}
            role="option"
            aria-selected={item === value}
            data-wheel-item
            className={cn("time-wheel-item", item === value ? "text-ink" : "text-faint")}
          >
            {item}
          </div>
        ))}
        <div className="time-wheel-spacer" />
      </div>
    </div>
  );
}

type TimeWheelProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TimeWheel({ value, onChange }: TimeWheelProps) {
  const [hour = "08", minute = "00"] = value.split(":");

  return (
    <div className="time-wheel relative flex overflow-hidden rounded-xl bg-paper shadow-hairline">
      <WheelColumn
        values={HOURS}
        value={hour}
        ariaLabel="时"
        onChange={(next) => onChange(`${next}:${minute}`)}
      />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 flex items-center text-lg font-medium text-ink">
        :
      </div>
      <WheelColumn
        values={MINUTES}
        value={minute}
        ariaLabel="分"
        onChange={(next) => onChange(`${hour}:${next}`)}
      />
    </div>
  );
}

export function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}
