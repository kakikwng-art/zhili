# 架构

纸历是单页应用。网页和 Android 共用同一套 React 界面，Android 用 Capacitor WebView 包一层。

```
native/main.tsx
        │
        ▼
  AppShell（月网格 + 底栏）
        │
        ├── DaySheet / EventComposer
        ├── SearchSheet
        └── BackupSheet
        │
        ▼
 CalendarProvider  (src/lib/calendar/context.tsx)
        │
        ▼
     Dexie IndexedDB  (zhili-calendar)
        ├── events
        └── meta   (categories, seeded)
```

## 两条打包线

| | 网页预览（Grok Build） | 独立网页 / APK |
| --- | --- | --- |
| 入口 | `src/routes/index.tsx` → `AppShell` | `native/main.tsx` → `AppShell` |
| 打包 | TanStack Start + Vite | `vite.native.config.ts`，`base: './'` |
| 输出 | 开发服务器 | `dist-native/` → Capacitor `webDir` |

产品代码只应写在 `src/components/calendar` 和 `src/lib/calendar`。不要把日历逻辑写进 `src/lib/auth` 或服务端路由。

## 存储

Dexie 库名：`zhili-calendar`

**events**

| 字段 | 类型 | |
| --- | --- | --- |
| id | string | UUID，主键 |
| date | `YYYY-MM-DD` | 按本地日历，不是 UTC 日界 |
| title | string | 必填 |
| time | `HH:mm` 可选 | 有则按时间排序，无则视为全天 |
| category | string 可选 | 名称，不是外键 |
| color | string 可选 | 色盘 id，缺省跟分类走 |
| note | string 可选 | |
| createdAt / updatedAt | number | epoch ms |

索引：`id, date, createdAt, title`

**meta**

- `categories`：JSON 字符串数组
- `seeded`：`"1"` 表示已写入示例数据

没有后端、没有同步协议。备份就是把这两张表序列化成 JSON。

## 月网格

`dates.ts` 生成当月 42 格（6×7），包含上月末和下月初。这样每月高度固定，翻页不会跳。

格子最多画 3 条标题，超出显示 `+N`。底色来自 `resolveSwatch(event.color, event.category)`。

## 颜色

`src/lib/calendar/colors.ts` 里是一组命名色（接近 Google 日历色盘）。分类有默认色，单条事件可以覆盖。CSS 变量 `--chip-bg` / `--chip-ink` 画色块。

## 原生桥

`src/lib/utils.ts` 的 `downloadText`：

- 网页：Blob + `<a download>`
- Android：动态 `import("@capacitor/filesystem")` + `Share`，把 JSON/ICS 交给系统分享页

Capacitor 插件：App、Filesystem、Share、StatusBar。

## 样式

`src/styles.css`，Tailwind v4。纸色：

- 纸 `#f3ece0`
- 朱砂 `#c4452b`
- 字 Noto Serif SC / Noto Sans SC

`.cal-chip` / `.cal-dot` 是格子里的色条和圆点。
