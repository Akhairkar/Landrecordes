import { parseNumber } from "./land-units.js";
import { $, L, pick, copyLink } from "./shared-ui.js";
import { registrationCost, formatINR, inrWords } from "./land-money.js";

const FIELDS = ["sd-deal", "sd-circle", "sd-duty", "sd-reg", "sd-cap", "sd-extra"];

function init() {
  const status = $("sd-status"), out = $("sd-out"), basis = $("sd-basis");
  const lang = () => (document.documentElement.lang === "en" ? "en" : "hi");
  const num = (id) => { const v = $(id).value.trim(); return v ? parseNumber(v) : null; };

  function render() {
    out.hidden = true; status.textContent = "";
    writeUrl();
    const deal = num("sd-deal"), circle = num("sd-circle"), duty = num("sd-duty");
    if (deal == null && circle == null) return;
    if ([deal, circle].some((n) => n != null && !(Number.isFinite(n) && n >= 0))) { status.textContent = pick("मूल्य सही संख्या में लिखें. / Enter valid amounts."); return; }
    let value;
    if (basis.value === "deal") value = deal;
    else if (basis.value === "circle") value = circle;
    else value = Math.max(deal ?? 0, circle ?? 0);
    if (value == null) { status.textContent = pick("चुने गए आधार का मूल्य भरें. / Enter the value for the chosen basis."); return; }
    if (duty == null) { status.textContent = pick("अपने राज्य की स्टांप ड्यूटी (%) भरें. / Enter your state's stamp duty (%)."); return; }
    const r = registrationCost({ value, dutyPct: duty, regPct: num("sd-reg") ?? 0, regCap: num("sd-cap"), extra: num("sd-extra") ?? 0 });
    if (!r.ok) { status.textContent = r.reason === "percent-range" ? pick("प्रतिशत 0 से 100 के बीच हो. / Percent must be 0–100.") : pick("सभी मान सही संख्या में भरें. / Enter valid numbers."); return; }
    const w = (n) => { const s = inrWords(n, lang()); return s ? ` (${s})` : ""; };
    $("sd-value").textContent = formatINR(value) + w(value);
    $("sd-duty-out").textContent = formatINR(r.duty) + w(r.duty);
    $("sd-reg-out").textContent = formatINR(r.reg) + w(r.reg);
    $("sd-extra-out").textContent = formatINR(r.extra);
    $("sd-total").textContent = formatINR(r.total) + w(r.total);
    $("sd-grand").textContent = formatINR(value + r.total) + w(value + r.total);
    out.hidden = false;
    status.textContent = L("अनुमानित खर्च:", "Estimated cost:");
  }

  function writeUrl() {
    const p = new URLSearchParams();
    for (const id of FIELDS) { const v = $(id).value.trim(); if (v) p.set(id.slice(3), v); }
    p.set("b", basis.value);
    history.replaceState(null, "", `${location.pathname}?${p}#tool`);
  }

  for (const id of FIELDS) $(id).addEventListener("input", render);
  basis.addEventListener("input", render);
  $("sd-copy").addEventListener("click", () => copyLink(status));
  const q = new URLSearchParams(location.search);
  for (const id of FIELDS) if (q.get(id.slice(3))) $(id).value = q.get(id.slice(3));
  if (["higher", "deal", "circle"].includes(q.get("b"))) basis.value = q.get("b");
  render();
}
try { init(); } catch { $("sd-status").textContent = pick("टूल लोड नहीं हो सका. / Tool failed to load."); }
