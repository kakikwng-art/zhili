import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.zhili.calendar",
  appName: "纸历",
  webDir: "dist-native",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#f3ece0",
    },
  },
};

export default config;
