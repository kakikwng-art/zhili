import { Download, Plus, Search, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/lib/calendar/context";

export function Dock() {
  const { setSearchOpen, setBackupOpen, setTagsOpen, openToday } = useCalendar();

  return (
    <nav className="flex shrink-0 items-stretch justify-around border-t border-rule bg-sheet px-2 pb-dock pt-1">
      <Button size="dock" variant="ghost" className="text-muted" onClick={() => setSearchOpen(true)}>
        <Search className="size-5" strokeWidth={1.7} />
        搜索
      </Button>
      <Button size="dock" variant="ghost" className="text-vermilion" onClick={openToday}>
        <Plus className="size-5" strokeWidth={1.7} />
        记今天
      </Button>
      <Button size="dock" variant="ghost" className="text-muted" onClick={() => setTagsOpen(true)}>
        <Tags className="size-5" strokeWidth={1.7} />
        标签
      </Button>
      <Button size="dock" variant="ghost" className="text-muted" onClick={() => setBackupOpen(true)}>
        <Download className="size-5" strokeWidth={1.7} />
        备份
      </Button>
    </nav>
  );
}
