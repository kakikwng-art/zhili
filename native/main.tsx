import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { AppShell } from "@/components/calendar/app-shell";
import "@/styles.css";

async function setupNativeChrome() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#f3ece0" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // Status bar plugin is optional on some WebView previews.
  }
}

void setupNativeChrome();

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");

createRoot(root).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
