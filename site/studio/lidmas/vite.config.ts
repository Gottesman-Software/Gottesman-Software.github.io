import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const base = process.env.VITE_BASE_PATH ?? "/studio/lidmas-app/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
