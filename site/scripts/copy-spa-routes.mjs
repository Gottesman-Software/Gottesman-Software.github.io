import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { routeMeta, siteOrigin } from "../src/route-meta.js";

const liveRouteEnabled =
  process.env.VITE_ENABLE_LIDMAS_LIVE_ROUTE === "1" ||
  process.env.VITE_ENABLE_LIDMAS_LIVE_ROUTE === "true";
const routes = [
  "/",
  "/software",
  "/studio",
  "/studio/lidmas",
  ...(liveRouteEnabled ? ["/studio/lidmas-live"] : []),
  "/lab",
  "/research",
  "/team",
  "/support",
];
const source = join("dist", "index.html");
const baseHtml = readFileSync(source, "utf8");

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, "i");
  const tag = `<meta ${attribute}="${key}" content="${content}">`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n  </head>`);
}

function renderRoute(route) {
  const meta = routeMeta[route] || routeMeta["/"];
  const url = `${siteOrigin}${route === "/" ? "/" : route}`;
  let html = baseHtml
    .replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`)
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}">`);

  html = replaceMeta(html, "name", "description", meta.description);
  html = replaceMeta(html, "property", "og:title", meta.title);
  html = replaceMeta(html, "property", "og:description", meta.description);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "name", "twitter:title", meta.title);
  html = replaceMeta(html, "name", "twitter:description", meta.description);
  return html;
}

for (const route of routes) {
  if (route === "/") continue;
  const target = join("dist", route.slice(1), "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, renderRoute(route));
}

writeFileSync(join("dist", "404.html"), renderRoute("/"));
