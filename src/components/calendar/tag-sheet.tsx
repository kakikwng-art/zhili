import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { PaperDrawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { EVENT_PALETTE, getSwatch } from "@/lib/calendar/colors";
import { useCalendar } from "@/lib/calendar/context";
import type { CalTag } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

function ColorDots({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const current = getSwatch(value);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted">底色{current ? ` · ${current.name}` : ""}</span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {EVENT_PALETTE.map((swatch) => {
          const selected = swatch.id === value;
          return (
            <button
              key={swatch.id}
              type="button"
              aria-label={swatch.name}
              className={cn(
                "size-7 shrink-0 rounded-full",
                selected && "ring-2 ring-ink ring-offset-2 ring-offset-sheet",
              )}
              style={{ background: swatch.bg }}
              onClick={() => onChange(swatch.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function TagSheet() {
  const { tagsOpen, setTagsOpen, tags, saveTag, removeTag } = useCalendar();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("banana");
  const [editing, setEditing] = useState<CalTag | null>(null);

  async function handleCreate() {
    const ok = await saveTag({ title, color });
    if (!ok) {
      toast(title.trim() ? "这个标签已经有了" : "先写上标签的字");
      return;
    }
    setTitle("");
    toast("标签做好了");
  }

  async function handleUpdate() {
    if (!editing) return;
    const ok = await saveTag({ id: editing.id, title: editing.title, color: editing.color });
    if (!ok) {
      toast("改不了，可能和别的标签重名");
      return;
    }
    setEditing(null);
  }

  return (
    <PaperDrawer open={tagsOpen} onOpenChange={setTagsOpen} title="标签" height="full">
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="px-4 pb-3 text-sm leading-normal text-muted">
          先定好字和底色。点开某一天，点一下就贴上，再点一下揭下来。
        </p>
        <ul className="min-h-0 flex-1 overflow-y-auto px-4">
          {tags.length === 0 ? (
            <li className="py-4 text-sm text-muted">还没有标签。</li>
          ) : (
            tags.map((tag) => {
              const swatch = getSwatch(tag.color);
              const open = editing?.id === tag.id;
              return (
                <li key={tag.id} className="border-b border-rule py-2">
                  {open && editing ? (
                    <div className="flex flex-col gap-3 py-1">
                      <TextField
                        value={editing.title}
                        maxLength={16}
                        aria-label="标签文字"
                        className="h-10"
                        onChange={(event) =>
                          setEditing((current) => (current ? { ...current, title: event.target.value } : current))
                        }
                      />
                      <ColorDots
                        value={editing.color}
                        onChange={(next) =>
                          setEditing((current) => (current ? { ...current, color: next } : current))
                        }
                      />
                      <div className="flex gap-2">
                        <Button variant="solid" size="sm" onClick={() => void handleUpdate()}>
                          保存
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className="min-w-0 flex-1 truncate rounded-md px-2 py-1 text-sm"
                        style={swatch ? { background: swatch.bg, color: swatch.ink } : undefined}
                      >
                        {tag.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        aria-label={`改 ${tag.title}`}
                        onClick={() => setEditing({ ...tag })}
                      >
                        <Pencil className="size-4" strokeWidth={1.75} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-vermilion"
                        aria-label={`删 ${tag.title}`}
                        onClick={() => void removeTag(tag.id)}
                      >
                        <Trash2 className="size-4" strokeWidth={1.75} />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
        <form
          className="flex flex-col gap-3 border-t border-rule bg-sheet px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreate();
          }}
        >
          <TextField
            value={title}
            maxLength={16}
            placeholder="新标签，比如：买菜"
            aria-label="新标签"
            className="h-11"
            onChange={(event) => setTitle(event.target.value)}
          />
          <ColorDots value={color} onChange={setColor} />
          <Button type="submit" variant="solid" className="w-full" disabled={!title.trim()}>
            做成标签
          </Button>
        </form>
      </div>
    </PaperDrawer>
  );
}
