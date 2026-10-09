import { parseNumber, convert, formatNumber } from "./land-units.js";
import { $, loadUnits, fillUnitSelect, mountLocalFields, copyLink } from "./shared-ui.js";
import { parseShare, splitEqual, splitByShares } from "./partition.js";

async function init() {
  const units = await loadUnits();
  const total = $("pt-total"), unit = $("pt-unit"), mode = $("pt-mode"), count = $("pt-count"), body = $("pt-body"), table = $("pt-table"), status = $("pt-status"), list = $("pt-shares");
  fillUnitSelect(unit, units);
  const local = mountLocalFields($("pt-local-fields"), units, () => calc());
  const rows = []; // { name, share }

  function renderRows() {
    list.textContent = "";
    rows.forEach((r, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "lr-row";
      wrap.style.marginBottom = "8px";
      const name = document.createElement("input");
      name.className = "lr-input"; name.placeholder = `नाम / Name ${idx + 1}`; name.value = r.name; name.setAttribute("aria-label", `हिस्सेदार ${idx + 1} का नाम`);
      name.addEventListener("input", () => { r.name = name.value; calc(); });
      const share = document.createElement("input");
      share.className = "lr-input"; share.placeholder = "हिस्सा जैसे 1/2, 25%, 0.25"; share.value = r.share; share.inputMode = "text"; share.setAttribute("aria-label", `हिस्सेदार ${idx + 1} का हिस्सा`);
      share.addEventListener("input", () => { r.share = share.value; calc(); });
      wrap.append(name, share);
      list.append(wrap);
    });
  }

  function syncMode() {
    const custom = mode.value === "shares";
    $("pt-equal-box").hidden = custom;
    $("pt-shares-box").hidden = !custom;
    if (custom && rows.length === 0) { rows.push({ name: "", share: "" }, { name: "", share: "" }); renderRows(); }
  }

  function calc() {
    table.hidden = true; body.textContent = "";
    const t = parseNumber(total.value);
    if (!total.value.trim()) { status.textContent = ""; return; }
    if (!Number.isFinite(t) || t <= 0) { status.textContent = "कुल क्षेत्रफल शून्य से बड़ी संख्या में लिखें. / Enter total area greater than zero."; return; }
    const loc = local.read();
    const u = units.find((x) => x.id === unit.value);
    if (u.kind === "local" && !loc[u.id]) { status.textContent = `${u.hi} का स्थानीय मान (वर्ग फुट) भरें. / Enter local value for ${u.en}.`; $("pt-local-box").open = true; return; }

    let names, res;
    if (mode.value === "equal") {
      const n = Number(count.value);
      res = splitEqual(t, n);
      names = Array.from({ length: n }, (_, i) => `हिस्सेदार ${i + 1}`);
      if (!res.ok) { status.textContent = "हिस्सेदारों की संख्या 1 से 100 के बीच लिखें. / Enter 1–100 people."; return; }
    } else {
      const filled = rows.filter((r) => r.share.trim());
      const shares = filled.map((r) => parseShare(r.share));
      if (!filled.length) { status.textContent = ""; return; }
      if (shares.some((s) => Number.isNaN(s))) { status.textContent = "हर हिस्सा 1/2, 25% या 0.25 जैसा लिखें (0 से बड़ा, 1 तक). / Use 1/2, 25% or 0.25."; return; }
      names = filled.map((r, i) => r.name.trim() || `हिस्सेदार ${i + 1}`);
      res = splitByShares(t, shares);
      if (!res.ok) {
        const pct = formatNumber(res.sum * 100, 2);
        status.textContent = res.reason === "shares-under"
          ? `हिस्सों का योग ${pct}% है; ${formatNumber(res.diff * 100, 2)}% बाकी है. योग 100% होना चाहिए. / Shares add to ${pct}%; they must total 100%.`
          : `हिस्सों का योग ${pct}% है, यानी 100% से ज़्यादा. / Shares exceed 100%.`;
        return;
      }
    }
    res.parts.forEach((p, i) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th"); th.scope = "row"; th.textContent = names[i];
      const td = document.createElement("td"); td.className = "num"; td.textContent = `${formatNumber(p)} ${u.hi}`;
      const sq = convert(units, p, unit.value, "sqft", loc);
      const td2 = document.createElement("td"); td2.className = "num"; td2.textContent = sq.ok ? formatNumber(sq.value) : "—";
      tr.append(th, td, td2);
      body.append(tr);
    });
    status.textContent = `कुल ${formatNumber(t)} ${u.hi} का बँटवारा (केवल अंकगणित): / Arithmetic split:`;
    table.hidden = false;
    const p = new URLSearchParams({ t: total.value.trim(), u: unit.value, m: mode.value });
    if (mode.value === "equal") p.set("n", count.value);
    else p.set("sh", rows.map((r) => `${r.name}~${r.share}`).join("|"));
    history.replaceState(null, "", `${location.pathname}?${p}#tool`);
  }

  $("pt-add").addEventListener("click", () => { if (rows.length < 30) { rows.push({ name: "", share: "" }); renderRows(); } });
  $("pt-remove").addEventListener("click", () => { if (rows.length > 2) { rows.pop(); renderRows(); calc(); } });
  for (const el of [total, unit, count]) el.addEventListener("input", calc);
  mode.addEventListener("input", () => { syncMode(); calc(); });
  $("pt-copy").addEventListener("click", () => copyLink(status));

  const q = new URLSearchParams(location.search);
  if (q.get("t")) total.value = q.get("t");
  if (q.get("u") && units.some((x) => x.id === q.get("u"))) unit.value = q.get("u");
  if (q.get("m") === "shares") mode.value = "shares";
  if (q.get("n")) count.value = q.get("n");
  if (q.get("sh")) q.get("sh").split("|").slice(0, 30).forEach((s) => { const [name, share] = s.split("~"); rows.push({ name: name || "", share: share || "" }); });
  renderRows(); syncMode(); calc();
}
init().catch(() => { $("pt-status").textContent = "टूल लोड नहीं हो सका. कृपया पेज रीफ़्रेश करें. / Tool failed to load."; });
