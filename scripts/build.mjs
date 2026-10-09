// LandRecord static build + quality gates (BUILD_RULES §A). Zero dependencies.
// Usage: node scripts/build.mjs   (env: BASE_PATH, SITE_URL, INDEXABLE=true|false)
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "./generators.mjs";
import { icon } from "./icons.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BASE = process.env.BASE_PATH ?? "/Landrecordes/";
const SITE = (process.env.SITE_URL ?? "https://akhairkar.github.io/Landrecordes").replace(/\/$/, "");
const INDEXABLE = process.env.INDEXABLE === "true"; // stays false until launch approval (Rulebook §26)

const SIMILARITY_MAX = 0.35;
const MIN_WORDS = { home: 120, content: 400, record: 320, guide: 320, state: 300, hub: 120, legal: 80, tool: 0 };
const NEEDS_RELATED = new Set(["record", "guide", "state"]); // BUILD_RULES §A9 / Rulebook §13
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
  if (!s.url && !["definition", "editorial"].includes(s.kind)) err(`sources/${id}`, "missing url (only kind=definition may omit it)");
  if (["definition", "editorial"].includes(s.kind) && !s.basis) err(`sources/${id}`, `${s.kind} needs basis`);
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

// ---------- pages ----------
const layout = readFileSync(join(ROOT, "src/layout.html"), "utf8");
const pagesDir = join(ROOT, "src/pages");
const pages = [];

// English versions: src/pages/**/index.en.html holds the English body. The H1 stays shared (it carries both languages).
function withEnglish(hiBody, enBody) {
  const h1 = hiBody.match(/<h1[\s\S]*?<\/h1>/);
  const rest = h1 ? hiBody.replace(h1[0], "") : hiBody;
  return `${h1 ? h1[0] : ""}\n<div data-l="hi">${rest}</div>\n<div data-l="en">${enBody}</div>`;
}
// "हिंदी <span class="lr-en">/ English</span>" → language pair shown one at a time.
const pairLang = (html) => html.replace(/>([^<>]*?[^\s<>][^<>]*?)\s*<span class="lr-en">\/\s*([^<]+)<\/span>/g, (_, hi, en) => `><span data-l="hi">${hi.trim()}</span><span data-l="en">${en.trim()}</span>`);

for (const file of walk(pagesDir).filter((f) => f.endsWith(".html") && !f.endsWith(".en.html"))) {
  const rel = relative(pagesDir, file).split(sep).join("/");
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) { err(rel, "missing <!--meta {...}--> header"); continue; }
  let meta;
  try { meta = JSON.parse(m[1]); } catch (e) { err(rel, `meta JSON invalid: ${e.message}`); continue; }
  let body = raw.slice(m[0].length);
  const enFile = file.replace(/\.html$/, ".en.html");
  if (existsSync(enFile)) body = withEnglish(body, readFileSync(enFile, "utf8"));
  else if (!/data-l="en"/.test(body)) warnings.push(`${rel}: no English version`);
  const slug = rel.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "");
  pages.push({ rel, slug, meta, body, url: slug ? `${slug}/` : "" });
}

for (const g of generate({ sources, readJson, esc })) {
  const slug = g.rel.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "");
  pages.push({ rel: `[gen] ${g.rel}`, slug, meta: g.meta, body: g.body, url: slug ? `${slug}/` : "" });
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
  if (!["legal", "home"].includes(meta.type) && (!Array.isArray(meta.sources) || meta.sources.length === 0)) err(rel, "meta.sources required");
  for (const sid of meta.sources || []) if (!sources[sid]) err(rel, `unknown source id "${sid}"`);
  const faqText = (meta.faq || []).map((f) => `${f.q} ${f.a}`).join(" ");
  const words = `${text(body)} ${faqText}`.split(" ").filter(Boolean).length;
  const min = meta.tool || meta.output ? 0 : MIN_WORDS[meta.type] ?? 0;
  if (words < min) err(rel, `thin content: ${words} words < ${min} (type=${meta.type})`);
  if (NEEDS_RELATED.has(meta.type)) {
    const rel2 = meta.related || [];
    if (rel2.length < 2) err(rel, "needs ≥2 meta.related links (Rulebook §13)");
    const hasTool = rel2.some((r) => r.path.startsWith("tools/")) || /href="tools\//.test(body);
    if (!hasTool) err(rel, "needs ≥1 link to a tool (Rulebook §13)");
  }
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

const stateChips = readJson("data/states.json").states.map((st) => `<a href="states/${st.id}/">${esc(st.name_hi)}</a>`).join(" ");
const stateChipsEn = readJson("data/states.json").states.map((st) => `<a href="states/${st.id}/">${esc(st.name_en)}</a>`).join(" ");
const recentList = `<ul class="lr-recent">${[...pages]
  .filter((p) => !["legal", "home"].includes(p.meta.type))
  .sort((a, b) => (b.meta.reviewed_on > a.meta.reviewed_on ? 1 : b.meta.reviewed_on < a.meta.reviewed_on ? -1 : a.meta.title.localeCompare(b.meta.title)))
  .slice(0, 8)
  .map((p) => {
    const en = (p.body.match(/<h1[^>]*>[\s\S]*?<span class="lr-en">\/\s*([^<]+)<\/span>/) || [])[1];
    const label = en ? `<span data-l="hi">${esc(p.meta.title)}</span><span data-l="en">${esc(en.trim())}</span>` : esc(p.meta.title);
    return `<li><a href="${esc(p.url)}">${label}</a> <span class="lr-muted-cell">· ${esc(p.meta.reviewed_on)}</span></li>`;
  })
  .join("")}</ul>`;

const KIND_LABEL_EN = { exact: "Definition", customary: "Customary", local: "Local — you enter" };
const unitsTableEn = `<div class="lr-table-wrap"><table class="lr-table"><thead><tr><th scope="col">Unit</th><th scope="col">Square feet</th><th scope="col">Type</th><th scope="col">Note</th></tr></thead><tbody>${unitData.units
  .map(
    (u) =>
      `<tr><th scope="row">${esc(u.en)} <span class="lr-muted-cell">(${esc(u.hi)})</span></th><td class="num">${u.sqft != null ? esc(new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 }).format(u.sqft)) : '<span class="lr-muted-cell">Varies by area</span>'}</td><td>${KIND_LABEL_EN[u.kind]}</td><td>${esc(u.note_en || "")}</td></tr>`
  )
  .join("")}</tbody></table></div>`;

// ---------- render ----------
const depthPrefix = ""; // <base> makes all hrefs base-relative
for (const p of pages) {
  const { meta } = p;
  const canonical = `${SITE}/${p.url}`;
  const robots = INDEXABLE && meta.status === "published" ? "index,follow" : "noindex,nofollow";
  const crumbs = [{ name: "होम", name_en: "Home", path: "" }, ...(meta.breadcrumbs || [])];
  const crumbHtml = crumbs.length < 2 ? "" : `<nav class="lr-crumbs" aria-label="Breadcrumb">${crumbs
    .map((c, i) => ((label) => (i === crumbs.length - 1 && c.path === p.url ? label : `<a href="${c.path}">${label}</a>`))(c.name_en ? `<span data-l="hi">${esc(c.name)}</span><span data-l="en">${esc(c.name_en)}</span>` : esc(c.name)))
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
    if (meta.faq_en?.length)
      faqHtml = faqHtml.replace(/<\/section>$/, `<div data-l="en">${meta.faq_en.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></section>`).replace(/(<\/h2>)(<details>)/, `$1<div data-l="hi">$2`).replace(/(<\/details>)(<div data-l="en">)/, `$1</div>$2`);
    ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: meta.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  }
  let srcHtml = "";
  if (meta.sources?.length)
    srcHtml = `<section class="lr-source lr-prose" aria-labelledby="src-h"><h2 id="src-h">स्रोत व समीक्षा <span class="lr-en">/ Sources &amp; review</span></h2><ul>${meta.sources
      .map((id) => {
        const s = sources[id];
        return `<li>${s.url ? `<a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.org)}</a>` : esc(s.org)} — ${esc(s.basis || "")}</li>`;
      })
      .join("")}</ul><p data-l="hi">अंतिम समीक्षा: <time datetime="${esc(meta.reviewed_on)}">${esc(meta.reviewed_on)}</time>. यह मार्गदर्शन शैक्षिक जानकारी है, कानूनी सलाह या आधिकारिक रिकॉर्ड नहीं।</p><p data-l="en">Last reviewed: <time datetime="${esc(meta.reviewed_on)}">${esc(meta.reviewed_on)}</time>. Educational guidance, not legal advice or an official record.</p></section>`;
  const relatedHtml = meta.related?.length
    ? `<section class="lr-related lr-prose" aria-labelledby="rel-h"><h2 id="rel-h">यह भी देखें <span class="lr-en">/ Related</span></h2><ul>${meta.related
        .map((r) => `<li><a href="${esc(r.path)}">${r.label_en ? `<span data-l="hi">${esc(r.label)}</span><span data-l="en">${esc(r.label_en)}</span>` : esc(r.label)}</a></li>`)
        .join("")}</ul></section>`
    : "";
  const scripts = (meta.scripts || []).map((s) => `<script type="module" src="${esc(s)}"></script>`).join("\n");
  let html = layout
    .replace("{{base}}", esc(BASE))
    .replace("{{robots}}", robots)
    .replace("{{title}}", esc(meta.title))
    .replace("{{description}}", esc(meta.description))
    .replace("{{canonical}}", esc(canonical))
    .replace("{{schema}}", ld.map((o) => `  <script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n"))
    .replace("{{breadcrumbs}}", crumbHtml)
    .replace("{{self}}", meta.output ? "" : esc(p.url))
    .replace("{{pathprefix}}", depthPrefix)
    .replace("{{active}}", esc(meta.active || ""))
    .replace("{{body}}", () => p.body.replace("{{units_table_en}}", unitsTableEn).replace("{{units_table}}", unitsTable).replace("{{recent_pages}}", () => recentList).replace("{{state_chips_en}}", () => stateChipsEn).replace("{{state_chips}}", () => stateChips).replace(/\{\{icon:([a-z]+)\}\}/g, (_, n) => icon(n)))
    .replace("{{faq}}", () => relatedHtml + faqHtml)
    .replace("{{sources}}", () => srcHtml)
    .replace("{{scripts}}", () => scripts);
  html = html.replace(/<body>[\s\S]*<\/body>/, (b) => pairLang(b));
  let tableNo = 0;
  html = html.replace(/<div class="lr-table-wrap">/g, () => `<div class="lr-table-wrap" tabindex="0" role="region" aria-label="तालिका ${++tableNo}: खिसकाकर पढ़ें">`);
  const outPath = meta.output ? join(DIST, meta.output) : join(DIST, p.url, "index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  outPages.push({ ...p, html, canonical });
}

// ---------- search index ----------
writeFileSync(
  join(DIST, "search-index.json"),
  JSON.stringify(
    outPages
      .filter((p) => !p.meta.output)
      .map((p) => {
        const h1 = p.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        const te = h1 && h1[1].match(/<span data-l="en">([^<]*)<\/span>/);
        return { t: p.meta.title, te: te ? te[1] : "", d: p.meta.description, u: p.url, y: p.meta.type, k: p.meta.keywords || [] };
      })
  )
);

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
