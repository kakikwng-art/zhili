const MONTHS = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
] as const;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDateKey(value).getTime());
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const next = new Date(year, month + delta, 1);
  return { year: next.getFullYear(), month: next.getMonth() };
}

export function monthTitle(year: number, month: number): string {
  return `${year}年${month + 1}月`;
}

export function monthName(month: number): string {
  return MONTHS[month] ?? "";
}

export function weekdayLabel(date: Date): string {
  return ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][date.getDay()] ?? "";
}

export function dayHeading(key: string): string {
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}月${date.getDate()}日  ${weekdayLabel(date)}`;
}

export function getMonthGrid(year: number, month: number): Date[] {
  const first = startOfMonth(year, month);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + i);
    days.push(cell);
  }
  return days;
}

export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

export function formatStamp(isoDate: string): string {
  const date = parseDateKey(isoDate);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
