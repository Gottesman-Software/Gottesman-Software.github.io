import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const limits = {
  javascriptGzip: 130 * 1024,
  cssGzip: 40 * 1024,
  imageBytes: 4 * 1024 * 1024,
};

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

const failures = [];
let checkedAssets = 0;

for (const file of filesUnder(dist)) {
  const path = relative(dist, file);
  const extension = path.split(".").pop()?.toLowerCase();
  const bytes = statSync(file).size;

  if (extension === "js" || extension === "css") {
    checkedAssets += 1;
    const gzipBytes = gzipSync(readFileSync(file)).length;
    const limit = extension === "js" ? limits.javascriptGzip : limits.cssGzip;
    if (gzipBytes > limit) failures.push(`${path} exceeds ${(limit / 1024).toFixed(0)} KiB gzip`);
  }

  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension) && bytes > limits.imageBytes) {
    failures.push(`${path} exceeds ${(limits.imageBytes / 1024).toFixed(0)} KiB`);
  }
}

console.log(`Performance budget checked ${checkedAssets} JavaScript/CSS assets.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
