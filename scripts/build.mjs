// LandRecord static build + quality gates (BUILD_RULES §A). Zero dependencies.
// Usage: node scripts/build.mjs   (env: BASE_PATH, SITE_URL, INDEXABLE=true|false)
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BASE = process.env.BASE_PATH ?? "/Landrecordes/";
const SITE = (process.env.SITE_URL ?? "https://akhairkar.github.io/Landrecordes").replace(/\/$/, "");
const INDEXABLE = process.env.INDEXABLE === "true"; // stays false until launch approval (Rulebook §26)

const SIMILARITY_MAX = 0.35;
const MIN_WORDS = { content: 400, hub: 120, legal: 80, tool: 0 };
const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]
  );

// ---------- data gate (A1) ----------
const sources = readJson("data/sources.json");
for (const [id, s] of Object.entries(sources)) {
  if (!s.org) err(`sources/${id}`, "missing org");
  if (!s.url && s.kind !== "definition") err(`sources/${id}`, "missing url (only kind=definition may omit it)");
  if (s.kind === "definition" && !s.basis) err(`sources/${id}`, "definition needs basis");
}
const unitData = readJson("data/units.json");
for (const u of unitData.units) {
  if (u.kind !== "local" && !(u.sqft > 0)) err(`units/${u.id}`, "non-local unit needs positive sqft");
  if (u.kind !== "local" && !sources[u.source]) err(`units/${u.id}`, `unknown source "${u.source}"`);
}

// ---------- clean + static copy ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, "assets"), join(DIST, "assets"), { recursive: true });
cpSync(join(ROOT, "data"), join(DIST, "data"), { recursive: true });
if (existsSync(join(ROOT, "CNAME"))) cpSync(join(ROOT, "CNAME"), join(DIST, "CNAME"));
// Legacy hand-written homepage (rebuilt in M3c): keep, but align <base> with the build target.
writeFileSync(
  join(DIST, "index.html"),
  readFileSync(join(ROOT, "index.html"), "utf8").replace(/<base href="[^"]*">/, `<base href="${BASE}">`)
);

// ---------- pages ----------
const layout = readFileSync(join(ROOT, "src/layout.html"), "utf8");
const pagesDir = join(ROOT, "src/pages");
const pages = [];

for (const file of walk(pagesDir).filter((f) => f.endsWith(".html"))) {
  const rel = relative(pagesDir, file).split(sep).join("/");
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) { err(rel, "missing <!--meta {...}--> header"); continue; }
  let meta;
  try { meta = JSON.parse(m[1]); } catch (e) { err(rel, `meta JSON invalid: ${e.message}`); continue; }
  const body = raw.slice(m[0].length);
  const slug = rel.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "");
  pages.push({ rel, slug, meta, body, url: slug ? `${slug}/` : "" });
}

const text = (html) =>
  html.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const trigrams = (t) => {
  const w = t.split(" ");
  const s = new Set();
  for (let i = 0; i + 2 < w.length; i++) s.add(w[i] + " " + w[i + 1] + " " + w[i + 2]);
  return s;
};

const seenTitles = new Map();
const seenDescs = new Map();
const outPages = [];

for (const p of pages) {
  const { meta, body, rel } = p;
  for (const k of ["title", "description", "type", "status", "reviewed_on", "intent", "unique_value"])
    if (!meta[k]) err(rel, `meta.${k} required`);
  if (!["draft", "published"].includes(meta.status)) err(rel, "meta.status must be draft|published");
  if (!(meta.type in MIN_WORDS)) err(rel, `meta.type must be one of ${Object.keys(MIN_WORDS).join("|")}`);
  if (meta.title && meta.title.length > 60) err(rel, `title ${meta.title.length} chars (max 60)`);
  if (meta.description && (meta.description.length < 110 || meta.description.length > 160))
    err(rel, `description ${meta.description.length} chars (110–160)`);
  if (seenTitles.has(meta.title)) err(rel, `duplicate title with ${seenTitles.get(meta.title)}`);
  seenTitles.set(meta.title, rel);
  if (seenDescs.has(meta.description)) err(rel, `duplicate description with ${seenDescs.get(meta.description)}`);
  seenDescs.set(meta.description, rel);
  if ((body.match(/<h1[\s>]/g) || []).length !== 1) err(rel, "exactly one <h1> required");
  if (meta.type !== "legal" && (!Array.isArray(meta.sources) || meta.sources.length === 0)) err(rel, "meta.sources required");
  for (const sid of meta.sources || []) if (!sources[sid]) err(rel, `unknown source id "${sid}"`);
  const words = text(body).split(" ").filter(Boolean).length;
  const min = meta.tool ? 0 : MIN_WORDS[meta.type] ?? 0;
  if (words < min) err(rel, `thin content: ${words} words < ${min} (type=${meta.type})`);
  p.words = words;
  p.tri = trigrams(text(body));
}

// thin/duplicate gate (A4): pairwise trigram Jaccard among same-type pages
for (let i = 0; i < pages.length; i++)
  for (let j = i + 1; j < pages.length; j++) {
    const a = pages[i], b = pages[j];
    if (a.meta.type !== b.meta.type || a.meta.type === "legal") continue;
    const inter = [...a.tri].filter((x) => b.tri.has(x)).length;
    const jac = inter / Math.max(1, a.tri.size + b.tri.size - inter);
    if (jac >= SIMILARITY_MAX) err(`${a.rel} ~ ${b.rel}`, `near-duplicate (trigram Jaccard ${jac.toFixed(2)} ≥ ${SIMILARITY_MAX})`);
  }

// ---------- generated fragments ----------
const KIND_LABEL = { exact: "परिभाषा", customary: "प्रचलित", local: "स्थानीय — आप भरें" };
const unitsTable = `<div class="lr-table-wrap"><table class="lr-table"><thead><tr><th scope="col">इकाई</th><th scope="col">वर्ग फुट</th><th scope="col">प्रकार</th><th scope="col">टिप्पणी</th></tr></thead><tbody>${unitData.units
  .map(
    (u) =>
      `<tr><th scope="row">${esc(u.hi)} <span class="lr-en">/ ${esc(u.en)}</span></th><td class="num">${u.sqft != null ? esc(new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 }).format(u.sqft)) : '<span class="lr-muted-cell">क्षेत्र के अनुसार</span>'}</td><td>${KIND_LABEL[u.kind]}</td><td>${esc(u.note_hi || "")}</td></tr>`
  )
  .join("")}</tbody></table></div>`;

// ---------- render ----------
const depthPrefix = ""; // <base> makes all hrefs base-relative
for (const p of pages) {
  const { meta } = p;
  const canonical = `${SITE}/${p.url}`;
  const robots = INDEXABLE && meta.status === "published" ? "index,follow" : "noindex,nofollow";
  const crumbs = [{ name: "Home", path: "" }, ...(meta.breadcrumbs || [])];
  const crumbHtml = `<nav class="lr-crumbs" aria-label="Breadcrumb">${crumbs
    .map((c, i) => (i === crumbs.length - 1 && c.path === p.url ? esc(c.name) : `<a href="${c.path}">${esc(c.name)}</a>`))
    .join(" › ")}</nav>`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE}/${c.path}` })),
    },
  ];
  if (meta.tool)
    ld.push({ "@context": "https://schema.org", "@type": "WebApplication", name: meta.title, url: canonical, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", inLanguage: ["hi", "en"], isAccessibleForFree: true });
  let faqHtml = "";
  if (meta.faq?.length) {
    faqHtml = `<section class="lr-faq lr-prose" aria-labelledby="faq-h"><h2 id="faq-h">अक्सर पूछे जाने वाले प्रश्न <span class="lr-en">/ FAQ</span></h2>${meta.faq
      .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
      .join("")}</section>`;
    ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: meta.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  }
  let srcHtml = "";
  if (meta.sources?.length)
    srcHtml = `<section class="lr-source lr-prose" aria-labelledby="src-h"><h2 id="src-h">स्रोत व समीक्षा <span class="lr-en">/ Sources &amp; review</span></h2><ul>${meta.sources
      .map((id) => {
        const s = sources[id];
        return `<li>${s.url ? `<a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.org)}</a>` : esc(s.org)} — ${esc(s.basis || "")}</li>`;
      })
      .join("")}</ul><p>अंतिम समीक्षा / Last reviewed: <time datetime="${esc(meta.reviewed_on)}">${esc(meta.reviewed_on)}</time>. यह मार्गदर्शन शैक्षिक जानकारी है, कानूनी सलाह या आधिकारिक रिकॉर्ड नहीं। / Educational guidance, not legal advice or an official record.</p></section>`;
  const scripts = (meta.scripts || []).map((s) => `<script type="module" src="${esc(s)}"></script>`).join("\n");
  const html = layout
    .replace("{{base}}", esc(BASE))
    .replace("{{robots}}", robots)
    .replace("{{title}}", esc(meta.title))
    .replace("{{description}}", esc(meta.description))
    .replace("{{canonical}}", esc(canonical))
    .replace("{{schema}}", ld.map((o) => `  <script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n"))
    .replace("{{breadcrumbs}}", crumbHtml)
    .replace("{{self}}", esc(p.url))
    .replace("{{pathprefix}}", depthPrefix)
    .replace("{{active}}", esc(meta.active || ""))
    .replace("{{body}}", () => p.body.replace("{{units_table}}", unitsTable))
    .replace("{{faq}}", () => faqHtml)
    .replace("{{sources}}", () => srcHtml)
    .replace("{{scripts}}", () => scripts);
  const outPath = join(DIST, p.url, "index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  outPages.push({ ...p, html, canonical });
}

// ---------- link gate (A2, internal) ----------
const exists = (path) => {
  const clean = path.split("#")[0].split("?")[0];
  if (clean === "") return true;
  const target = join(DIST, clean);
  return existsSync(target) && (clean.endsWith("/") ? existsSync(join(target, "index.html")) : true);
};
for (const p of outPages) {
  for (const m of p.html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const link = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/.test(link)) continue;
    const path = link.startsWith(BASE) ? link.slice(BASE.length) : link.replace(/^\//, "");
    if (!exists(path)) err(p.rel, `broken internal link: ${link}`);
  }
}

// ---------- robots + sitemap (A5) ----------
const published = outPages.filter((p) => p.meta.status === "published");
if (INDEXABLE) {
  writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  writeFileSync(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${published
      .map((p) => `  <url><loc>${esc(p.canonical)}</loc><lastmod>${esc(p.meta.reviewed_on)}</lastmod></url>`)
      .join("\n")}\n</urlset>\n`
  );
} else {
  writeFileSync(join(DIST, "robots.txt"), "User-agent: *\nDisallow: /\n");
}

// ---------- report ----------
const byType = {};
for (const p of outPages) byType[p.meta.type] = (byType[p.meta.type] || 0) + 1;
console.log(`pages: ${outPages.length} (${Object.entries(byType).map(([k, v]) => `${k}:${v}`).join(", ")}) · published: ${published.length} · indexable: ${INDEXABLE}`);
for (const w of warnings) console.warn("WARN ", w);
if (errors.length) {
  console.error(`\n${errors.length} gate failure(s):`);
  for (const e of errors) console.error(" ✗", e);
  process.exit(1);
}
console.log("all gates passed");
