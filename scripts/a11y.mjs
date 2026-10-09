// Accessibility gate (BUILD_RULES §A7): serves dist/ and runs axe-core on every page in light and dark themes.
// Fails on any violation. Env: BASE_PATH (default /Landrecordes/), PLAYWRIGHT_CHROMIUM_PATH (optional).
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BASE = process.env.BASE_PATH ?? "/Landrecordes/";
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml" };
const axeSrc = readFileSync(join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
const index = JSON.parse(readFileSync(join(DIST, "search-index.json"), "utf8"));

const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!path.startsWith(BASE)) { res.writeHead(404); return res.end("not found"); }
  path = path.slice(BASE.length);
  let file = join(DIST, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const origin = `http://localhost:${server.address().port}${BASE}`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
const problems = [];
for (const [theme, lang] of [["light", "hi"], ["dark", "hi"], ["light", "en"], ["dark", "en"]]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(([t, l]) => { try { localStorage.setItem("landrecord-theme", t); localStorage.setItem("landrecord-language", l); } catch {} }, [theme, lang]);
  const page = await ctx.newPage();
  for (const it of index) {
    await page.goto(origin + it.u, { waitUntil: "load" });
    await page.waitForTimeout(250);
    await page.addScriptTag({ content: axeSrc });
    const r = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }));
    for (const v of r.violations) problems.push(`${theme}/${lang} /${it.u}: ${v.id} [${v.impact}] ${v.help} — ${v.nodes[0].html.slice(0, 120)}`);
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`axe: ${index.length} pages × 2 themes × 2 languages`);
if (problems.length) { console.error(`${problems.length} accessibility violation(s):`); for (const p of problems) console.error(" ✗", p); process.exit(1); }
console.log("no accessibility violations");
