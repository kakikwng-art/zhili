import { addEvent, getMeta, listCategories, setMeta } from "./db";
import { colorForCategory } from "./colors";
import { toDateKey } from "./dates";

function shiftDate(base: Date, days: number): string {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return toDateKey(next);
}

export async function seedIfEmpty(): Promise<void> {
  await listCategories();
  const seeded = await getMeta("seeded");
  if (seeded === "1") return;

  const today = new Date();
  const samples: Array<{
    date: string;
    title: string;
    time?: string;
    category?: string;
    color?: string;
    note?: string;
  }> = [
    { date: shiftDate(today, 0), title: "把月历草稿写完", category: "工作" },
    { date: shiftDate(today, 0), title: "晚上去散步", time: "19:30", category: "健康" },
    { date: shiftDate(today, 0), title: "给妈妈打电话", category: "家人" },
    { date: shiftDate(today, -2), title: "体检抽血", time: "08:30", category: "健康", note: "空腹" },
    { date: shiftDate(today, -2), title: "取快递", category: "生活" },
    { date: shiftDate(today, -2), title: "交电费" },
    { date: shiftDate(today, -2), title: "买菜：豆腐青菜", category: "生活" },
    { date: shiftDate(today, -2), title: "换牙刷" },
    { date: shiftDate(today, -2), title: "看完那章小说", category: "随记" },
    { date: shiftDate(today, -5), title: "下雨，在家熨衣服", category: "生活" },
    { date: shiftDate(today, 1), title: "图书馆还书", category: "生活" },
    { date: shiftDate(today, 3), title: "开会纪要", category: "工作" },
    { date: shiftDate(today, 3), title: "修好台灯" },
  ];

  for (const sample of samples) {
    await addEvent({
      ...sample,
      color: sample.category ? colorForCategory(sample.category) : "default",
    });
  }
  await setMeta("seeded", "1");
}
