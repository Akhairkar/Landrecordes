import { parseNumber, convertAll, formatNumber } from "./land-units.js";
import { $, L, pick, uname, loadUnits, fillUnitSelect, mountLocalFields, copyLink } from "./shared-ui.js";

async function init() {
  const units = await loadUnits();
  const from = $("conv-from"), value = $("conv-value"), body = $("conv-body"), table = $("conv-table"), status = $("conv-status");
  fillUnitSelect(from, units);
  const local = mountLocalFields($("local-fields"), units, () => render());

  const writeUrl = (v, f, loc) => {
    const p = new URLSearchParams();
    if (v) p.set("v", v);
    p.set("u", f);
    for (const [k, n] of Object.entries(loc)) p.set(k, String(n));
    history.replaceState(null, "", `${location.pathname}?${p}#converter`);
  };

  function render() {
    const raw = value.value;
    const n = parseNumber(raw);
    body.textContent = "";
    if (!raw.trim()) { table.hidden = true; status.textContent = ""; return; }
    if (!Number.isFinite(n) || n < 0) {
      table.hidden = true;
      status.textContent = pick("कृपया सही संख्या लिखें (शून्य या उससे बड़ी). / Enter a valid non-negative number.");
      return;
    }
    const loc = local.read();
    const fromUnit = units.find((u) => u.id === from.value);
    if (fromUnit.kind === "local" && !loc[fromUnit.id]) {
      table.hidden = true;
      status.textContent = pick(`${fromUnit.hi} बदलने के लिए ऊपर "स्थानीय इकाइयों का मान" खोलकर 1 ${fromUnit.hi} के वर्ग फुट भरें. / Enter your local value for ${fromUnit.en}.`);
      $("local-box").open = true;
      return;
    }
    const all = convertAll(units, n, from.value, loc);
    for (const u of units) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = uname(u);
      const td = document.createElement("td");
      if (all[u.id] == null) { td.textContent = L("अपना मान भरें", "Enter your value"); td.className = "lr-muted-cell"; }
      else { td.textContent = formatNumber(all[u.id]); td.className = "num"; }
      tr.append(th, td);
      body.append(tr);
    }
    status.textContent = pick(`${formatNumber(n)} ${fromUnit.hi} के बराबर: / Equivalent values:`);
    table.hidden = false;
    writeUrl(raw.trim(), from.value, loc);
  }

  $("conv-form").addEventListener("submit", (e) => { e.preventDefault(); render(); });
  value.addEventListener("input", render);
  from.addEventListener("input", render);
  $("conv-copy").addEventListener("click", () => copyLink(status));

  const q = new URLSearchParams(location.search);
  if (q.get("u") && units.some((u) => u.id === q.get("u"))) from.value = q.get("u");
  if (q.get("v")) value.value = q.get("v");
  for (const u of local.locals) if (q.get(u.id)) local.set(u.id, q.get(u.id));
  if (local.locals.some((u) => q.get(u.id))) $("local-box").open = true;
  render();
}
init().catch(() => { $("conv-status").textContent = pick("टूल लोड नहीं हो सका. कृपया पेज रीफ़्रेश करें. / Tool failed to load."); });
