import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import { colorForCategory } from "@/lib/calendar/colors";
import type { CalEvent } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";
import { CategoryPicker } from "./category-picker";
import { ColorPicker } from "./color-picker";
import { TimeWheel, nowTime } from "./time-wheel";

export type Draft = {
  title: string;
  time: string;
  category: string;
  color: string;
  note: string;
};

const EMPTY_DRAFT: Draft = { title: "", time: "", category: "", color: "default", note: "" };

type EventComposerProps = {
  editing: CalEvent | null;
  autoFocus: boolean;
  onSubmit: (draft: Draft) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancelEdit?: () => void;
};

export function EventComposer({ editing, autoFocus, onSubmit, onDelete, onCancelEdit }: EventComposerProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [extra, setExtra] = useState(false);
  const [timed, setTimed] = useState(false);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft({
        title: editing.title,
        time: editing.time ?? "",
        category: editing.category ?? "",
        color: editing.color ?? (editing.category ? colorForCategory(editing.category) : "default"),
        note: editing.note ?? "",
      });
      setExtra(Boolean(editing.time || editing.category || editing.color || editing.note));
      setTimed(Boolean(editing.time));
    } else {
      setDraft(EMPTY_DRAFT);
      setExtra(false);
      setTimed(false);
    }
  }, [editing]);

  useEffect(() => {
    if (autoFocus && !editing) inputRef.current?.focus();
  }, [autoFocus, editing]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || pending) return;
    setPending(true);
    try {
      await onSubmit({
        ...draft,
        time: timed ? draft.time : "",
        color: draft.color || "default",
      });
      if (!editing) {
        setDraft(EMPTY_DRAFT);
        setExtra(false);
        setTimed(false);
        inputRef.current?.focus();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-rule bg-sheet px-4 py-3">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          placeholder={editing ? "改一改这件事" : "写一句今天的事"}
          maxLength={200}
          aria-label="事件"
          className="h-11 w-full rounded-lg bg-paper px-3 text-base text-ink shadow-hairline placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion"
        />
        <Button type="submit" variant="solid" className="shrink-0 px-4" disabled={!draft.title.trim() || pending}>
          {editing ? "保存" : "记下"}
        </Button>
      </div>

      {editing ? (
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" className="h-9 px-2 text-muted" onClick={onCancelEdit}>
            取消编辑
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-2 text-vermilion"
            onClick={() => {
              void onDelete?.();
            }}
          >
            删除这条
          </Button>
        </div>
      ) : null}

      <button
        type="button"
        className="flex items-center gap-1 self-start text-xs text-muted"
        onClick={() => setExtra((value) => !value)}
      >
        时间、分类、底色、备注
        <ChevronDown className={cn("size-3.5 transition-transform duration-150", extra && "rotate-180")} />
      </button>

      {extra ? (
        <div className="flex max-h-[36vh] flex-col gap-3 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted">时间</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                className={cn(
                  "h-8 rounded-full px-3 text-xs font-medium",
                  !timed ? "bg-vermilion text-vermilion-fg" : "bg-paper text-muted shadow-hairline",
                )}
                onClick={() => {
                  setTimed(false);
                  setDraft((current) => ({ ...current, time: "" }));
                }}
              >
                全天
              </button>
              <button
                type="button"
                className={cn(
                  "h-8 rounded-full px-3 text-xs font-medium",
                  timed ? "bg-vermilion text-vermilion-fg" : "bg-paper text-muted shadow-hairline",
                )}
                onClick={() => {
                  setTimed(true);
                  setDraft((current) => ({ ...current, time: current.time || nowTime() }));
                }}
              >
                定时
              </button>
            </div>
            {timed ? (
              <TimeWheel
                value={draft.time || nowTime()}
                onChange={(time) => setDraft((current) => ({ ...current, time }))}
              />
            ) : null}
          </div>
          <CategoryPicker
            value={draft.category}
            onChange={(category) =>
              setDraft((current) => ({
                ...current,
                category,
                color: category ? colorForCategory(category) : current.color,
              }))
            }
          />
          <ColorPicker
            value={draft.color}
            onChange={(color) => setDraft((current) => ({ ...current, color }))}
          />
          <TextArea
            value={draft.note}
            onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
            placeholder="备注"
            maxLength={2000}
            rows={3}
          />
        </div>
      ) : null}
    </form>
  );
}
