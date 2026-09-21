import { useRef, useState } from "react";
import { toast } from "sonner";
import { PaperDrawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/lib/calendar/context";
import { parseBackup, serializeBackup, type ParsedBackup } from "@/lib/calendar/backup";
import { eventsToIcs } from "@/lib/calendar/ics";
import { downloadText } from "@/lib/utils";
import { ApkDownload } from "./apk-download";

export function BackupSheet() {
  const { backupOpen, setBackupOpen, events, categories, restoreEvents } = useCalendar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<ParsedBackup | null>(null);

  async function exportJson() {
    const stamp = new Date().toISOString().slice(0, 10);
    await downloadText(`zhili-${stamp}.json`, serializeBackup(events, categories), "application/json");
    toast("已导出 JSON 备份");
  }

  async function exportIcs() {
    const stamp = new Date().toISOString().slice(0, 10);
    await downloadText(`zhili-${stamp}.ics`, eventsToIcs(events), "text/calendar");
    toast("已导出 ICS");
  }

  async function onPickFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      setPending(parseBackup(text));
    } catch {
      toast("这份文件读不出来，请确认是纸历导出的 JSON");
      setPending(null);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function confirmRestore() {
    if (!pending) return;
    setBusy(true);
    try {
      await restoreEvents(pending.events, pending.categories);
      toast(`已恢复 ${pending.events.length} 条`);
      setPending(null);
      setBackupOpen(false);
    } catch {
      toast("恢复失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PaperDrawer open={backupOpen} onOpenChange={setBackupOpen} title="备份与导出">
      <div className="flex flex-col gap-3 px-4 pb-6">
        <ApkDownload className="flex h-11 w-full items-center justify-center rounded-lg bg-vermilion text-base font-medium text-vermilion-fg">
          下载 Android 安装包
        </ApkDownload>
        <p className="text-sm leading-normal text-muted">
          全部写在这台设备上，不登录，不同步。换手机前先导出一份 JSON。
        </p>
        <Button variant="quiet" size="lg" className="w-full justify-start" onClick={() => void exportJson()}>
          导出 JSON 备份
        </Button>
        <Button
          variant="quiet"
          size="lg"
          className="w-full justify-start"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          从 JSON 恢复
        </Button>
        {pending ? (
          <div className="rounded-xl bg-paper p-3 shadow-hairline">
            <p className="text-sm leading-normal text-ink">
              将用 {pending.events.length} 条替换当前全部格子。这一步不能撤销。
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="solid" className="flex-1" disabled={busy} onClick={() => void confirmRestore()}>
                确认恢复
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setPending(null)}>
                取消
              </Button>
            </div>
          </div>
        ) : null}
        <Button variant="quiet" size="lg" className="w-full justify-start" onClick={() => void exportIcs()}>
          导出 ICS
        </Button>
        <p className="text-xs leading-normal text-faint">ICS 方便以后迁到别的日历。恢复会覆盖当前数据。</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            void onPickFile(event.target.files);
          }}
        />
      </div>
    </PaperDrawer>
  );
}
