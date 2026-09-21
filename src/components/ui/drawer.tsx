import type { ReactNode } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type PaperDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  height?: "day" | "full";
};

export function PaperDrawer({ open, onOpenChange, title, children, height = "day" }: PaperDrawerProps) {
  return (
    <VaulDrawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false} handleOnly>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-40 bg-ink/35" />
        <VaulDrawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-3xl flex-col bg-sheet text-ink shadow-sheet",
            "rounded-t-3xl outline-none",
            height === "full" ? "h-drawer-full" : "h-drawer-day",
          )}
        >
          <VaulDrawer.Handle className="mx-auto mt-2 h-1 w-10 bg-rule" />
          <header className="flex items-center gap-2 px-4 pb-2 pt-3">
            <VaulDrawer.Title className="min-w-0 flex-1 font-display text-lg font-semibold tracking-tight text-balance">
              {title}
            </VaulDrawer.Title>
            <Button size="icon" variant="ghost" className="size-10 shrink-0" aria-label="关闭" onClick={() => onOpenChange(false)}>
              <X className="size-5" strokeWidth={1.75} />
            </Button>
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-safe">{children}</div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
