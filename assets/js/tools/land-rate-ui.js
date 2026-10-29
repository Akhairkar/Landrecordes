import { parseNumber, formatNumber } from "./land-units.js";
import { $, L, pick, uname, loadUnits, fillUnitSelect, mountLocalFields, copyLink } from "./shared-ui.js";
import { rateInAllUnits, totalPrice, formatINR, inrWords } from "./land-money.js";

async function init() {
  const units = await loadUnits();
  const rate = $("lr-rate"), rateUnit = $("lr-rate-unit"), area = $("lr-area"), areaUnit = $("lr-area-unit");
  const status = $("lr-status"), total = $("lr-total"), table = $("lr-rate-table"), body = $("lr-rate-body");
  fillUnitSelect(rateUnit, units);
  fillUnitSelect(areaUnit, units);
  rateUnit.value = "acre";
  areaUnit.value = "acre";
  const local = mountLocalFields($("lr-local-fields"), units, () => render());
  const lang = () => (document.documentElement.lang === "en" ? "en" : "hi");

  function needLocal(id, loc) {
    const u = units.find((x) => x.id === id);
    if (u.kind !== "local" || loc[u.id]) return false;
    status.textContent = pick(`${u.hi} का मान नीचे "स्थानीय इकाइयाँ" में वर्ग फुट में भरें. / Enter the value of 1 ${u.en} in sq ft under "Local units".`);
    $("lr-local-box").open = true;
    return true;
  }

  function render() {
    body.textContent = ""; table.hidden = true; total.textContent = ""; status.textContent = "";
    const r = parseNumber(rate.value), a = parseNumber(area.value), loc = local.read();
    writeUrl(loc);
    if (!rate.value.trim()) return;
    if (!Number.isFinite(r) || r < 0) { status.textContent = pick("रेट सही संख्या में लिखें. / Enter a valid rate."); return; }
    if (needLocal(rateUnit.value, loc)) return;
    const all = rateInAllUnits(units, r, rateUnit.value, loc);
    for (const u of units) {
      const tr = document.createElement("tr");
      const th = document.createElement("th"); th.scope = "row"; th.textContent = L(`प्रति ${u.hi}`, `per ${u.en}`);
      const td = document.createElement("td");
      if (all[u.id] == null) { td.textContent = L("अपना मान भरें", "Enter your value"); td.className = "lr-muted-cell"; }
      else { td.textContent = all[u.id] >= 100 ? formatINR(all[u.id]) : `₹${formatNumber(all[u.id], 2)}`; td.className = "num"; }
      tr.append(th, td); body.append(tr);
    }
    table.hidden = false;
    status.textContent = pick("यही रेट दूसरी इकाइयों में: / The same rate in other units:");
    if (area.value.trim()) {
      if (!Number.isFinite(a) || a < 0) { total.textContent = pick("क्षेत्रफल सही संख्या में लिखें. / Enter a valid area."); return; }
      if (needLocal(areaUnit.value, loc)) return;
      const t = totalPrice(units, r, rateUnit.value, a, areaUnit.value, loc);
      if (!t.ok) return;
      const au = units.find((u) => u.id === areaUnit.value);
      const words = inrWords(t.total, lang());
      total.textContent = L(`${formatNumber(a)} ${au.hi} की कुल कीमत: ${formatINR(t.total)}${words ? ` (${words})` : ""}`, `Total for ${formatNumber(a)} ${au.en}: ${formatINR(t.total)}${words ? ` (${words})` : ""}`);
    }
  }

  function writeUrl(loc) {
    const p = new URLSearchParams();
    if (rate.value.trim()) p.set("r", rate.value.trim());
    p.set("ru", rateUnit.value);
    if (area.value.trim()) p.set("a", area.value.trim());
    p.set("au", areaUnit.value);
    for (const [k, n] of Object.entries(loc)) p.set(k, String(n));
    history.replaceState(null, "", `${location.pathname}?${p}#tool`);
  }

  for (const el of [rate, rateUnit, area, areaUnit]) el.addEventListener("input", render);
  $("lr-copy").addEventListener("click", () => copyLink(status));
  const q = new URLSearchParams(location.search);
  if (q.get("ru") && units.some((u) => u.id === q.get("ru"))) rateUnit.value = q.get("ru");
  if (q.get("au") && units.some((u) => u.id === q.get("au"))) areaUnit.value = q.get("au");
  if (q.get("r")) rate.value = q.get("r");
  if (q.get("a")) area.value = q.get("a");
  for (const u of local.locals) if (q.get(u.id)) local.set(u.id, q.get(u.id));
  if (local.locals.some((u) => q.get(u.id))) $("lr-local-box").open = true;
  render();
}
init().catch(() => { $("lr-status").textContent = pick("टूल लोड नहीं हो सका. कृपया पेज रीफ़्रेश करें. / Tool failed to load."); });
