// Official-link health report (BUILD_RULES §A2, external). Non-blocking: always exits 0.
// Checks every portal/source URL in data/states.json and data/sources.json and writes a Markdown table to
// $GITHUB_STEP_SUMMARY (or stdout). Government sites may block cloud IPs; treat a failure as "check manually", not "dead".
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const urls = new Map(); // url -> label
for (const s of read("data/states.json").states) {
  if (s.url) urls.set(s.url, `${s.name_en} portal`);
  for (const u of s.alt_urls) urls.set(u, `${s.name_en} alt address`);
}
for (const [id, s] of Object.entries(read("data/sources.json"))) if (s.url) urls.set(s.url, urls.get(s.url) || `source ${id}`);

async function probe(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctl.signal, headers: { "user-agent": "LandRecord-link-check/1.0 (+https://github.com/Akhairkar/Landrecordes)" } });
    if (r.status === 405 || r.status === 403) r = await fetch(url, { method: "GET", redirect: "follow", signal: ctl.signal, headers: { "user-agent": "LandRecord-link-check/1.0" } });
    return { status: r.status, final: r.url };
  } catch (e) {
    return { status: 0, error: e.cause?.code || e.name || "error" };
  } finally { clearTimeout(t); }
}

const rows = [];
const list = [...urls];
const CONC = 6;
for (let i = 0; i < list.length; i += CONC)
  rows.push(...(await Promise.all(list.slice(i, i + CONC).map(async ([url, label]) => ({ url, label, ...(await probe(url)) })))));

const ok = rows.filter((r) => r.status >= 200 && r.status < 400).length;
let md = `## Official link check — ${new Date().toISOString().slice(0, 10)}\n\n${ok}/${rows.length} reachable. Failures may be IP blocks; verify manually before changing data.\n\n| Result | Link | What |\n|---|---|---|\n`;
for (const r of rows.sort((a, b) => (a.status >= 200 && a.status < 400) - (b.status >= 200 && b.status < 400)))
  md += `| ${r.status ? r.status : "✗ " + r.error} | ${r.url}${r.final && r.final !== r.url ? ` → ${r.final}` : ""} | ${r.label} |\n`;
// --write stores the latest result per URL in data/link-status.json (read by the build to show "automatic check" notes).
if (process.argv.includes("--write")) {
  const out = {};
  const day = new Date().toISOString().slice(0, 10);
  for (const r of rows) out[r.url] = { checked: day, status: r.status, error: r.error || null };
  writeFileSync(join(ROOT, "data/link-status.json"), JSON.stringify(out, null, 2) + "\n");
}
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
console.log(md);
