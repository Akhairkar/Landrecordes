import { $, L, pick } from "./shared-ui.js";

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, "");
async function init() {
  const [{ terms }, { states }] = await Promise.all([
    fetch(new URL("data/terms.json", document.baseURI)).then((r) => r.json()),
    fetch(new URL("data/states.json", document.baseURI)).then((r) => r.json()),
  ]);
  const name = Object.fromEntries(states.map((s) => [s.id, L(s.name_hi, s.name_en)]));
  const q = $("tt-q"), out = $("tt-out"), status = $("tt-status");

  function render() {
    const needle = norm(q.value);
    out.textContent = "";
    let shown = 0;
    for (const t of terms) {
      const hay = norm([t.hi, t.en, t.meaning_hi, t.meaning_en, ...t.usage.flatMap((u) => [u.term_hi, u.term_en || "", name[u.state]])].join(" "));
      if (needle && !hay.includes(needle)) continue;
      shown++;
      const card = document.createElement("div");
      card.className = "lr-result";
      const h = document.createElement("h3");
      h.style.margin = "0 0 4px";
      h.textContent = L(`${t.hi} (${t.en})`, `${t.en} (${t.hi})`);
      const p = document.createElement("p");
      p.textContent = L(t.meaning_hi, t.meaning_en);
      card.append(h, p);
      if (t.usage.length) {
        const wrap = document.createElement("div");
        wrap.className = "lr-table-wrap";
        wrap.tabIndex = 0;
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", L(`${t.hi}: राज्य-वार नाम`, `${t.en}: names by state`));
        const table = document.createElement("table");
        table.className = "lr-table";
        table.style.minWidth = "0";
        const tb = document.createElement("tbody");
        for (const u of t.usage) {
          const tr = document.createElement("tr");
          const th = document.createElement("th");
          th.scope = "row";
          th.textContent = name[u.state] || u.state;
          const td = document.createElement("td");
          td.textContent = L(u.term_hi, u.term_en || u.term_hi);
          tr.append(th, td);
          tb.append(tr);
        }
        table.append(tb);
        wrap.append(table);
        card.append(wrap);
      } else {
        const n = document.createElement("p");
        n.className = "lr-en";
        n.textContent = pick("राज्य-वार नाम अभी जोड़े नहीं गए / No state mapping yet.");
        card.append(n);
      }
      out.append(card);
    }
    status.textContent = pick(shown ? `${shown} शब्द मिले / ${shown} result(s)` : "कोई शब्द नहीं मिला। दूसरी स्पेलिंग आज़माएँ. / No match.");
  }
  q.addEventListener("input", render);
  const init = new URLSearchParams(location.search).get("q");
  if (init) q.value = init;
  render();
}
init().catch(() => { $("tt-status").textContent = pick("शब्दकोश लोड नहीं हो सका. / Failed to load."); });
