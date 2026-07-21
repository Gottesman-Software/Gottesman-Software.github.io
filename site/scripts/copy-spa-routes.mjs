import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const liveRouteEnabled =
  process.env.VITE_ENABLE_LIDMAS_LIVE_ROUTE === "1" ||
  process.env.VITE_ENABLE_LIDMAS_LIVE_ROUTE === "true";
const routes = [
  "404.html",
  "studio/index.html",
  "studio/lidmas/index.html",
  ...(liveRouteEnabled ? ["studio/lidmas-live/index.html"] : []),
];
const source = join("dist", "index.html");

for (const route of routes) {
  const target = join("dist", route);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}
