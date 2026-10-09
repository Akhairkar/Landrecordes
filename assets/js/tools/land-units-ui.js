import { parseNumber, convertAll, formatNumber } from "./land-units.js";

const $ = (id) => document.getElementById(id);
const lang = () => document.documentElement.lang;

async function init() {
  const res = await fetch(new URL("data/units.json", document.baseURI));
  const { units } = await res.json();
  const from = $("conv-from"), value = $("conv-value"), body = $("conv-body"), table = $("conv-table"), status = $("conv-status");
  const localBox = $("local-fields");
  const locals = units.filter((u) => u.kind === "local");

  for (const u of units) {
    const o = document.createElement("option");
    o.value = u.id;
    o.textContent = `${u.hi} / ${u.en}`;
    from.append(o);
  }
  for (const u of locals) {
    const wrap = document.createElement("div");
    wrap.className = "lr-field";
    const label = document.createElement("label");
    label.htmlFor = `local-${u.id}`;
    label.textContent = `1 ${u.hi} = ? वर्ग फुट`;
    const input = document.createElement("input");
    input.className = "lr-input";
    input.id = `local-${u.id}`;
    input.inputMode = "decimal";
    input.autocomplete = "off";
    const hint = document.createElement("small");
    hint.textContent = u.note_hi;
    wrap.append(label, input, hint);
    localBox.append(wrap);
  }

  const readLocal = () => {
    const out = {};
    for (const u of locals) {
      const n = parseNumber($(`local-${u.id}`).value);
      if (Number.isFinite(n) && n > 0) out[u.id] = n;
    }
    return out;
  };

  const writeUrl = (v, f, local) => {
    const p = new URLSearchParams();
    if (v) p.set("v", v);
    p.set("u", f);
    for (const [k, n] of Object.entries(local)) p.set(k, String(n));
    history.replaceState(null, "", `${location.pathname}?${p}#converter`);
  };

  const render = () => {
    const raw = value.value;
    const n = parseNumber(raw);
    body.textContent = "";
    if (!raw.trim()) { table.hidden = true; status.textContent = ""; return; }
    if (!Number.isFinite(n) || n < 0) {
      table.hidden = true;
      status.textContent = "कृपया सही संख्या लिखें (शून्य या उससे बड़ी). / Enter a valid non-negative number.";
      return;
    }
    const local = readLocal();
    const fromUnit = units.find((u) => u.id === from.value);
    const all = convertAll(units, n, from.value, local);
    if (fromUnit.kind === "local" && !local[fromUnit.id]) {
      table.hidden = true;
      status.textContent = `${fromUnit.hi} बदलने के लिए ऊपर "स्थानीय इकाइयों का मान" खोलकर 1 ${fromUnit.hi} के वर्ग फुट भरें. / Enter your local value for ${fromUnit.en}.`;
      $("local-box").open = true;
      return;
    }
    for (const u of units) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = `${u.hi} / ${u.en}`;
      const td = document.createElement("td");
      td.className = "num";
      if (all[u.id] == null) { td.textContent = "अपना मान भरें"; td.className = "lr-muted-cell"; }
      else td.textContent = formatNumber(all[u.id]);
      tr.append(th, td);
      body.append(tr);
    }
    status.textContent = `${formatNumber(n)} ${fromUnit.hi} के बराबर: / Equivalent values:`;
    table.hidden = false;
    writeUrl(raw.trim(), from.value, local);
  };

  $("conv-form").addEventListener("submit", (e) => { e.preventDefault(); render(); });
  for (const el of [value, from, ...locals.map((u) => $(`local-${u.id}`))]) el.addEventListener("input", render);
  $("conv-copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); status.textContent = "लिंक कॉपी हो गया. / Link copied."; }
    catch { status.textContent = "लिंक कॉपी नहीं हो सका; ब्राउज़र के एड्रेस बार से कॉपी करें. / Copy from the address bar."; }
  });

  const q = new URLSearchParams(location.search);
  if (q.get("u") && units.some((u) => u.id === q.get("u"))) from.value = q.get("u");
  if (q.get("v")) value.value = q.get("v");
  for (const u of locals) if (q.get(u.id)) $(`local-${u.id}`).value = q.get(u.id);
  if (locals.some((u) => q.get(u.id))) $("local-box").open = true;
  render();
}
init().catch(() => { $("conv-status").textContent = "टूल लोड नहीं हो सका. कृपया पेज रीफ़्रेश करें. / Tool failed to load."; });
