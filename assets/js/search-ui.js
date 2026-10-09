import { $, L, pick } from "./tools/shared-ui.js";

const TYPE = { tool: ["टूल", "Tool"], record: ["रिकॉर्ड", "Record"], state: ["राज्य", "State"], guide: ["गाइड", "Guide"], hub: ["सूची", "Index"], home: ["होम", "Home"], legal: ["जानकारी", "Info"] };
const STOP = new Set(["kaise", "kya", "hai", "ka", "ki", "ke", "se", "me", "mein", "को", "का", "की", "के", "में", "से", "है", "कैसे", "क्या", "how", "to", "the", "a", "of", "in", "for", "and"]);
const norm = (s) => String(s).toLowerCase().normalize("NFC");
const tokens = (s) => norm(s).split(/[^\p{L}\p{N}\/]+/u).filter((t) => t && !STOP.has(t));

async function init() {
  const index = await (await fetch(new URL("search-index.json", document.baseURI))).json();
  const q = $("s-q"), out = $("s-out"), status = $("s-status");
  function score(item, toks) {
    const title = norm(`${item.t} ${item.te || ""}`), desc = norm(item.d), keys = norm(item.k.join(" "));
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
    status.textContent = pick(hits.length ? `${hits.length} परिणाम / ${hits.length} result(s)` : "कोई परिणाम नहीं मिला। दूसरे शब्द आज़माएँ या नीचे की सूची देखें. / No results.");
    for (const { i } of hits) {
      const box = document.createElement("div");
      box.className = "lr-result";
      const a = document.createElement("a");
      a.href = i.u;
      a.textContent = L(i.t, i.te || i.t);
      const kind = document.createElement("span");
      kind.className = "lr-badge ok";
      kind.style.marginLeft = "8px";
      kind.textContent = TYPE[i.y] ? L(...TYPE[i.y]) : i.y;
      const p = document.createElement("p");
      p.textContent = i.d;
      box.append(a, kind, p);
      out.append(box);
    }
    if (!hits.length) {
      for (const [href, label] of [["records/", L("रिकॉर्ड की जानकारी", "Records")], ["states/", L("राज्य-वार पोर्टल", "State portals")], ["tools/", L("टूल्स", "Tools")], ["guides/", L("गाइड", "Guides")]]) {
        const a = document.createElement("a"); a.href = href; a.textContent = label; a.className = "lr-btn secondary"; a.style.cssText = "display:inline-flex;align-items:center;text-decoration:none;margin:4px 6px 4px 0";
        out.append(a);
      }
    }
  }
  $("s-form").addEventListener("submit", (e) => { e.preventDefault(); render(); });
  q.addEventListener("input", () => { render(); history.replaceState(null, "", q.value.trim() ? `${location.pathname}?q=${encodeURIComponent(q.value.trim())}` : location.pathname); });
  const init = new URLSearchParams(location.search).get("q");
  if (init) { q.value = init; render(); }
}
init().catch(() => { $("s-status").textContent = pick("खोज लोड नहीं हो सकी. / Search failed to load."); });
