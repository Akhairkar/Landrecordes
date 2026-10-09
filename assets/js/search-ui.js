import { $ } from "./tools/shared-ui.js";

const TYPE = { tool: "टूल", record: "रिकॉर्ड", state: "राज्य", guide: "गाइड", hub: "सूची", home: "होम", legal: "जानकारी" };
const STOP = new Set(["kaise", "kya", "hai", "ka", "ki", "ke", "se", "me", "mein", "को", "का", "की", "के", "में", "से", "है", "कैसे", "क्या", "how", "to", "the", "a", "of", "in", "for", "and"]);
const norm = (s) => String(s).toLowerCase().normalize("NFC");
const tokens = (s) => norm(s).split(/[^\p{L}\p{N}\/]+/u).filter((t) => t && !STOP.has(t));

async function init() {
  const index = await (await fetch(new URL("search-index.json", document.baseURI))).json();
  const q = $("s-q"), out = $("s-out"), status = $("s-status");
  function score(item, toks) {
    const title = norm(item.t), desc = norm(item.d), keys = norm(item.k.join(" "));
    let s = 0;
    for (const t of toks) {
      if (title.includes(t)) s += 5;
      if (keys.includes(t)) s += 4;
      if (desc.includes(t)) s += 1;
    }
    return s;
  }
  function render() {
    const toks = tokens(q.value);
    out.textContent = "";
    if (!toks.length) { status.textContent = ""; return; }
    const hits = index.map((i) => ({ i, s: score(i, toks) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 20);
    status.textContent = hits.length ? `${hits.length} परिणाम / ${hits.length} result(s)` : "कोई परिणाम नहीं मिला। दूसरे शब्द आज़माएँ या नीचे की सूची देखें. / No results.";
    for (const { i } of hits) {
      const box = document.createElement("div");
      box.className = "lr-result";
      const a = document.createElement("a");
      a.href = i.u;
      a.textContent = i.t;
      const kind = document.createElement("span");
      kind.className = "lr-badge ok";
      kind.style.marginLeft = "8px";
      kind.textContent = TYPE[i.y] || i.y;
      const p = document.createElement("p");
      p.textContent = i.d;
      box.append(a, kind, p);
      out.append(box);
    }
    if (!hits.length) {
      for (const [href, label] of [["records/", "रिकॉर्ड की जानकारी"], ["states/", "राज्य-वार पोर्टल"], ["tools/", "टूल्स"], ["guides/", "गाइड"]]) {
        const a = document.createElement("a"); a.href = href; a.textContent = label; a.className = "lr-btn secondary"; a.style.cssText = "display:inline-flex;align-items:center;text-decoration:none;margin:4px 6px 4px 0";
        out.append(a);
      }
    }
  }
  $("s-form").addEventListener("submit", (e) => { e.preventDefault(); render(); });
  q.addEventListener("input", render);
  const init = new URLSearchParams(location.search).get("q");
  if (init) { q.value = init; render(); }
}
init().catch(() => { $("s-status").textContent = "खोज लोड नहीं हो सकी. / Search failed to load."; });
