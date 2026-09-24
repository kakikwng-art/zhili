export interface CalEvent {
  id: string;
  date: string;
  title: string;
  time?: string;
  category?: string;
  color?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalendarBackup {
  app: "zhili";
  version: 1;
  exportedAt: string;
  events: CalEvent[];
  categories?: string[];
  tags?: CalTag[];
}

export interface CalTag {
  id: string;
  title: string;
  color: string;
}

export const DEFAULT_TAGS: CalTag[] = [
  { id: "tag-grocery", title: "买菜", color: "banana" },
  { id: "tag-walk", title: "散步", color: "sage" },
  { id: "tag-work", title: "工作", color: "cobalt" },
  { id: "tag-family", title: "家人", color: "flamingo" },
];

export const DEFAULT_CATEGORIES = ["生活", "工作", "健康", "家人", "随记"];

export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"] as const;
