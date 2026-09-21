# 打包与发布

## 网页

```bash
npm install
npx vite --config vite.native.config.ts --host --port 5173
```

静态生产包：

```bash
npm run native:build
```

输出目录 `dist-native/`，可丢到任意静态托管。必须用相对路径（配置里已是 `base: './'`）。

## Android APK

环境：

- Node.js 20+
- JDK **21**
- Android SDK，环境变量 `ANDROID_HOME`

```bash
export ANDROID_HOME=/path/to/Android/sdk
export JAVA_HOME=/path/to/jdk-21
npm install
npm run apk
```

`npm run apk` 实际做三步：

1. `vite build --config vite.native.config.ts`
2. `npx cap sync android`
3. `cd android && ./gradlew assembleDebug`

APK：`android/app/build/outputs/apk/debug/app-debug.apk`

### 版本号

改 `android/app/build.gradle`：

```
versionCode 2      // 每次上架 / 覆盖安装 +1
versionName "1.1"  // 给人看的
```

### 签名

现在是 Gradle debug keystore，只能侧载。用户手机若提示「未知来源」，允许即可。

要上架（国内应用商店 / Play）：

1. 自己生成 keystore，**千万备份**
2. 用 `assembleRelease` / `bundleRelease`
3. 不要把 keystore 和密码提交进 git

### 权限

`AndroidManifest.xml` 目前有 `INTERNET`（WebView 常见默认）。应用逻辑不访问网络。日历数据不离开设备。

## 发 GitHub Release

```bash
git tag v1.2
git push origin main --tags
gh release create v1.2 android/app/build/outputs/apk/debug/app-debug.apk \
  --title "纸历 1.2" \
  --notes "写清楚这版改了什么"
```

国内直链建议带 tag，避免 CDN 缓存旧包：

```
https://cdn.jsdelivr.net/gh/kakikwng-art/zhili@v1.2/releases/zhili.apk
```

更稳的是 Release 资源文件地址，而不是把 APK 提交进 git 仓库（APK 约 4 MB）。
