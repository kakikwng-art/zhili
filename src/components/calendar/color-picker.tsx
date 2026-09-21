import { chipVars, EVENT_PALETTE, getSwatch } from "@/lib/calendar/colors";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const current = getSwatch(value) ?? EVENT_PALETTE[EVENT_PALETTE.length - 1];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">底色</span>
        <span className="text-xs text-ink">{current.name}</span>
      </div>
      <div className="color-sheet overflow-y-auto rounded-xl bg-paper shadow-hairline">
        {EVENT_PALETTE.map((swatch) => {
          const selected = swatch.id === current.id;
          return (
            <button
              key={swatch.id}
              type="button"
              onClick={() => onChange(swatch.id)}
              className="flex h-10 w-full items-center gap-3 px-3 text-left"
            >
              <span className="cal-dot size-3 shrink-0 rounded-full" style={chipVars(swatch)} />
              <span className={cn("text-sm", selected ? "font-medium text-vermilion" : "text-ink")}>
                {swatch.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
