import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { chipVars, getSwatch, colorForCategory } from "@/lib/calendar/colors";
import { useCalendar } from "@/lib/calendar/context";
import { cn } from "@/lib/utils";

type CategoryPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const { categories, addCategory, renameCategory, removeCategory } = useCalendar();
  const [managing, setManaging] = useState(false);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleAdd() {
    const ok = await addCategory(newName);
    if (ok) {
      onChange(newName.trim());
      setNewName("");
    }
  }

  async function handleRename(from: string) {
    const ok = await renameCategory(from, editName);
    if (ok) {
      if (value === from) onChange(editName.trim());
      setEditing(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">分类</span>
        <button
          type="button"
          className="text-xs text-muted"
          onClick={() => {
            setManaging((current) => !current);
            setEditing(null);
          }}
        >
          {managing ? "完成" : "管理"}
        </button>
      </div>

      {managing ? (
        <div className="flex flex-col gap-2">
          {categories.map((category) =>
            editing === category ? (
              <div key={category} className="flex gap-2">
                <TextField
                  value={editName}
                  maxLength={12}
                  aria-label="分类名称"
                  className="h-9"
                  onChange={(event) => setEditName(event.target.value)}
                />
                <Button type="button" variant="solid" size="sm" onClick={() => void handleRename(category)}>
                  保存
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
                  取消
                </Button>
              </div>
            ) : (
              <div key={category} className="flex items-center gap-1">
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{category}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  aria-label={`改名 ${category}`}
                  onClick={() => {
                    setEditing(category);
                    setEditName(category);
                  }}
                >
                  <Pencil className="size-3.5" strokeWidth={1.75} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 text-vermilion"
                  aria-label={`删除 ${category}`}
                  onClick={() => {
                    void removeCategory(category);
                    if (value === category) onChange("");
                  }}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </Button>
              </div>
            ),
          )}
          <div className="flex gap-2">
            <TextField
              value={newName}
              maxLength={12}
              placeholder="新分类"
              aria-label="新分类"
              className="h-9"
              onChange={(event) => setNewName(event.target.value)}
            />
            <Button type="button" variant="quiet" size="sm" className="shrink-0" onClick={() => void handleAdd()}>
              <Plus className="size-3.5" strokeWidth={1.75} />
              添加
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => {
            const selected = value === category;
            const swatch = getSwatch(colorForCategory(category));
            return (
              <button
                key={category}
                type="button"
                onClick={() => onChange(selected ? "" : category)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors duration-150",
                  selected ? "bg-vermilion text-vermilion-fg" : "bg-paper text-muted shadow-hairline",
                )}
              >
                {swatch ? <span className="cal-dot size-2 shrink-0 rounded-full" style={chipVars(swatch)} /> : null}
                {category}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
