# 纸历

本地纸感月历。打开就是一张铺开的月份：每天一个小格子，格子里直接写这一天发生了什么。

- 不登录、不联网、不同步
- 数据只存在本机 IndexedDB
- 支持 JSON 完整备份/恢复，以及 ICS 导出

当前版本：**1.1**（`app.zhili.calendar`）

| | 链接 |
| --- | --- |
| 源码 | [github.com/kakikwng-art/zhili](https://github.com/kakikwng-art/zhili) |
| 安装包 Releases | [github.com/kakikwng-art/zhili/releases](https://github.com/kakikwng-art/zhili/releases) |
| v1.1 APK（jsDelivr） | [zhili.apk](https://cdn.jsdelivr.net/gh/kakikwng-art/zhili-apk@v1.1/zhili.apk) |

## 产品原则

纸历不是 Google Calendar。月视图是绝对主角：少卡片、少留白，每个日期格像一张能写几行字的小纸片。文字摘要比彩色圆点更重要。

**第一版有：**

1. 月历首页（固定 6 行）
2. 点日期查看 / 新增 / 编辑 / 删除
3. 搜索
4. JSON 备份恢复
5. ICS 导出

**明确不做：** 周视图、日视图、云同步、提醒、复杂重复事件、会议、地图、AI 总结。

新增一条：点格子 → 写一句话 → 记下。时间、分类、底色、备注都是选填。

## 本地运行（网页）

需要 Node.js 20+。

```bash
npm install
npx vite --config vite.native.config.ts --host --port 5173
```

浏览器打开提示的地址即可。这是和 Android 包同一套界面（`native/main.tsx`）。

## 打 Android 安装包

需要 JDK 21、Android SDK（`ANDROID_HOME`）。

```bash
npm install
npm run apk
```

产物：`android/app/build/outputs/apk/debug/app-debug.apk`

这是 debug 签名，侧载安装即可。上架应用商店需要自己的 keystore，见 [docs/BUILD.md](docs/BUILD.md)。

改版本号：`android/app/build.gradle` 里的 `versionCode` / `versionName`。

## 文档

- [交接说明](docs/HANDOVER.md) — 给后来的人：目录、数据、决策、已知问题
- [架构](docs/ARCHITECTURE.md) — 模块怎么拆、数据怎么存
- [打包](docs/BUILD.md) — Web / APK / 发布

## 许可

[MIT](LICENSE)
