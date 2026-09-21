import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: path.resolve("native"),
  base: "./",
  publicDir: false,
  plugins: [tailwindcss(), viteReact()],
  resolve: {
    alias: { "@": path.resolve("src") },
  },
  build: {
    outDir: path.resolve("dist-native"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
