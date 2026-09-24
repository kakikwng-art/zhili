# 纸历交接说明

这份文档面向「接下来要改这个 App 的人」。读完应能独立跑起来、改功能、打包装。

## 这是什么

纸历是一个 **完全本地** 的中文月历。视觉上模仿传统挂历：一个月铺开，每天一个格子，格子里直接显示 1～3 条短文字，多了显示 `+N`。点某一天再展开完整内容和编辑。

应用 ID：`app.zhili.calendar`  
包名 / 显示名：纸历  
当前版本：1.2（versionCode 3）

仓库：

- 源码：`https://github.com/kakikwng-art/zhili`
- 早期只放安装包的仓库（可忽略）：`https://github.com/kakikwng-art/zhili-apk`

## 谁在用、数据在哪

- 不登录。没有账号、没有后端、没有云。
- 事件存在浏览器 / WebView 的 **IndexedDB**，库名 `zhili-calendar`。
- Android 上数据跟系统 WebView 走。卸装会丢数据，所以备份很重要。
- Web 预览和手机 APK **不共享** 同一份数据。换设备用 JSON 备份恢复。

## 目录（真正有用的部分）

```
native/                         Android / 独立网页入口
  main.tsx                      真正的 App 入口
  index.html
src/components/calendar/        全部界面
src/lib/calendar/               日期、数据库、备份、ICS、颜色
src/styles.css                  纸色、字号、格子样式
capacitor.config.ts
vite.native.config.ts           给 APK 用的静态打包
android/                        Capacitor 原生壳
docs/
```

仓库里还有一批 Grok Build 脚手架（`src/lib/auth`、`src/routes`、`scripts/` 等）。**产品不依赖它们。** 交接后如果要清理，以 `native/main.tsx` 为入口即可，不要从脚手架里找日历逻辑。

## 功能对照

| 功能 | 位置 | 备注 |
| --- | --- | --- |
| 月网格（永远 6 行） | `src/components/calendar/month-grid.tsx` `day-cell.tsx` | 格子里直接渲染标题 |
| 点日期 | `day-sheet.tsx` | 列表右侧可删 |
| 写一句就保存 | `event-composer.tsx` | 时间/分类/底色/备注折叠 |
| 拨盘时间 | `time-wheel.tsx` | iOS 滚轮，不是 `<input type=time>` |
| 分类增删改 | `category-picker.tsx` | 存在 meta.categories |
| 标签（文字 + 底色，一点就贴） | `tag-sheet.tsx` 底栏「标签」；当天横条在 `day-sheet.tsx` | 存在 meta.tags。再点同一标签揭下 |
| 搜索 | `search-sheet.tsx` | 标题/备注/分类/日期 |
| JSON 备份恢复 | `backup-sheet.tsx` `src/lib/calendar/backup.ts` | schema version 1 |
| ICS 导出 | `src/lib/calendar/ics.ts` | 方便迁到别的日历 |
| 首次空库示例 | `src/lib/calendar/seed.ts` | meta.seeded=1 后不再写入 |

## 关键产品决策（不要随便改）

1. **月视图是首页，也是唯一视图。** 不要加周/日时间轴。
2. **格子里必须能直接读字**，不要改成只有彩点。日期数字保持接近 Google 日历的小字号（`--text-date: 0.625rem`）。
3. **新增默认三步：** 点格子 → 输入 → 记下。
4. **默认全天小事。** 定时是选填。
5. **不做提醒、不做重复规则、不做同步。**
6. 分类和每条事件的底色可分开设；格子用底色色块显示。

## 数据迁移

JSON 备份长这样：

```json
{
  "app": "zhili",
  "version": 1,
  "exportedAt": "2026-09-21T00:00:00.000Z",
  "categories": ["生活", "工作", "健康", "家人", "随记"],
  "events": [
    {
      "id": "uuid",
      "date": "2026-09-21",
      "title": "买菜",
      "time": "18:30",
      "category": "生活",
      "color": "sage",
      "note": "",
      "createdAt": 0,
      "updatedAt": 0
    }
  ]
}
```

恢复是 **整库替换**，不是合并。导入前请提醒用户先导出一份。

## 已知问题 / 坑

- 删除按钮曾经被时间拨盘挤出屏幕。1.1 起列表右侧有「删除」，编辑态顶部也有「删除这条」。
- 当前 APK 是 **debug 签名**。卸载重装会换签名密钥时，Android 可能要求先卸旧包（数据会没）。
- `INTERNET` 权限还在 Manifest 里（WebView 默认）。应用本身不请求网络。
- Capacitor 8 需要 **JDK 21**。
- jsDelivr 的 `@main` 会缓存。发新包用 tag，例如 `@v1.2`。
- 仓库里的 `apk-download.tsx` 只在网页预览显示「下载安装包」，真机 APK 里会隐藏。

## 建议的下一版（仅在被明确要求时做）

优先级从高到低，都不是现在的范围：

1. Release 签名 + 自己的 keystore 文档
2. 农历 / 节气（用户最早提过纸质挂历感觉，但第一版没做）
3. PWA 添加到主屏幕（网页版）
4. 简单的「每年同一天」纪念，而不是完整 RRULE

不要主动做：云同步、账号、提醒推送、周视图。

## 改完怎么发版

1. 改 `android/app/build.gradle` 的 `versionCode`（+1）和 `versionName`
2. `npm run apk`
3. `git tag vX.Y && git push --tags`
4. 把 apk 传到 GitHub Release
5. 更新 README 里的下载链接（用带 tag 的 jsDelivr，避免缓存）
