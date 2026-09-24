import { Toaster } from "sonner";
import { CalendarProvider } from "@/lib/calendar/context";
import { ApkDownload } from "./apk-download";
import { BackupSheet } from "./backup-sheet";
import { DaySheet } from "./day-sheet";
import { Dock } from "./dock";
import { MonthGrid } from "./month-grid";
import { SearchSheet } from "./search-sheet";
import { TagSheet } from "./tag-sheet";

export function AppShell() {
  return (
    <CalendarProvider>
      <div className="flex min-h-dvh justify-center bg-board">
        <div className="app-frame flex w-full max-w-3xl flex-col overflow-hidden bg-paper text-ink">
          <MonthGrid />
          <ApkDownload className="flex h-11 shrink-0 items-center justify-center border-t border-rule bg-sheet text-sm font-medium text-vermilion">
            下载 Android 安装包
          </ApkDownload>
          <Dock />
        </div>
      </div>
      <DaySheet />
      <SearchSheet />
      <TagSheet />
      <BackupSheet />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-sans! bg-sheet! text-ink! shadow-hairline! border-0!",
        }}
      />
    </CalendarProvider>
  );
}
