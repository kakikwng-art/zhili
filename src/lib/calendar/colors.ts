import type { CSSProperties } from "react";

export type Swatch = {
  id: string;
  name: string;
  bg: string;
  ink: string;
};

export const EVENT_PALETTE: Swatch[] = [
  { id: "chicory", name: "菊苣红", bg: "#AD1457", ink: "#FFF6F8" },
  { id: "sakura", name: "樱花粉红", bg: "#F48FB1", ink: "#3B1C27" },
  { id: "flamingo", name: "红鹤色", bg: "#E67C73", ink: "#3B1A16" },
  { id: "tomato", name: "番茄红", bg: "#D50000", ink: "#FFF6F5" },
  { id: "tangerine", name: "橘红", bg: "#F4511E", ink: "#FFF6F2" },
  { id: "pumpkin", name: "南瓜色", bg: "#EF6C00", ink: "#FFF6EE" },
  { id: "mango", name: "芒果黄", bg: "#F09300", ink: "#3A2A10" },
  { id: "banana", name: "香蕉黄", bg: "#F6BF26", ink: "#3A2F0C" },
  { id: "citron", name: "香橼黄", bg: "#E4C441", ink: "#3A3210" },
  { id: "avocado", name: "牛油果色", bg: "#C0CA33", ink: "#2F3510" },
  { id: "pistachio", name: "开心果绿", bg: "#7CB342", ink: "#1E2D12" },
  { id: "basil", name: "罗勒绿", bg: "#0B8043", ink: "#F3FFF6" },
  { id: "sage", name: "鼠尾草绿", bg: "#33B679", ink: "#123025" },
  { id: "eucalyptus", name: "桉树绿", bg: "#009688", ink: "#F2FFFC" },
  { id: "peacock", name: "孔雀蓝", bg: "#039BE5", ink: "#F3FBFF" },
  { id: "cobalt", name: "钴蓝", bg: "#4285F4", ink: "#F5F8FF" },
  { id: "lavender", name: "薰衣草色", bg: "#7986CB", ink: "#F5F6FF" },
  { id: "blueberry", name: "蓝莓色", bg: "#3F51B5", ink: "#F4F6FF" },
  { id: "wisteria", name: "紫藤色", bg: "#B39DDB", ink: "#2C2140" },
  { id: "amethyst", name: "水晶紫", bg: "#9C27B0", ink: "#FCF5FF" },
  { id: "grape", name: "葡萄紫", bg: "#8E24AA", ink: "#FCF5FF" },
  { id: "cocoa", name: "可可棕", bg: "#8D6E63", ink: "#FFF8F5" },
  { id: "graphite", name: "石墨黑", bg: "#616161", ink: "#F6F6F6" },
  { id: "birch", name: "桦木灰", bg: "#A1887F", ink: "#2C211C" },
  { id: "default", name: "默认颜色", bg: "#D4C4A8", ink: "#2A241C" },
];

const BY_ID = new Map(EVENT_PALETTE.map((swatch) => [swatch.id, swatch]));

const CATEGORY_COLORS: Record<string, string> = {
  生活: "banana",
  工作: "cobalt",
  健康: "sage",
  家人: "flamingo",
  随记: "graphite",
};

export const DEFAULT_SWATCH = BY_ID.get("default")!;

export function getSwatch(id: string | undefined): Swatch | undefined {
  if (!id) return undefined;
  return BY_ID.get(id);
}

export function colorForCategory(name: string): string {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  const pool = EVENT_PALETTE.filter((swatch) => swatch.id !== "default");
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0) * 13) % pool.length;
  return pool[hash]?.id ?? "default";
}

export function resolveSwatch(color?: string, category?: string): Swatch {
  return getSwatch(color) ?? getSwatch(category ? colorForCategory(category) : undefined) ?? DEFAULT_SWATCH;
}

export function chipVars(swatch: Swatch): CSSProperties {
  return { "--chip-bg": swatch.bg, "--chip-ink": swatch.ink } as CSSProperties;
}
