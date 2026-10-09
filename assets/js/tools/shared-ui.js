// Shared helpers for LandRecord tool pages (DOM side). Pure maths lives in sibling modules.
import { parseNumber, convertAll, formatNumber } from "./land-units.js";

export const $ = (id) => document.getElementById(id);
export const lang = () => (document.documentElement.lang === "en" ? "en" : "hi");
/** Pick the Hindi or English text for the current page language. */
export const L = (hi, en) => (lang() === "en" ? en : hi);
/** "हिंदी / English" → the part for the current language (splits on the last " / "). */
export const pick = (s) => { const t = String(s); const i = t.lastIndexOf(" / "); return i < 0 ? t : lang() === "en" ? t.slice(i + 3) : t.slice(0, i); };
export const uname = (u) => L(`${u.hi} (${u.en})`, `${u.en} (${u.hi})`);
// Tool pages re-initialise in the new language; their inputs live in the URL, so nothing is lost.
document.addEventListener("landrecord:languagechange", () => location.reload());

export async function loadUnits() {
  const res = await fetch(new URL("data/units.json", document.baseURI));
  if (!res.ok) throw new Error("units");
  return (await res.json()).units;
}

export function fillUnitSelect(select, units) {
  for (const u of units) {
    const o = document.createElement("option");
    o.value = u.id;
    o.textContent = uname(u);
    select.append(o);
  }
}

/** Build inputs for local units (bigha, biswa…) inside `container`; returns { read(), set(id, v), any() }. */
export function mountLocalFields(container, units, onInput) {
  const locals = units.filter((u) => u.kind === "local");
  for (const u of locals) {
    const wrap = document.createElement("div");
    wrap.className = "lr-field";
    const label = document.createElement("label");
    label.htmlFor = `local-${u.id}`;
    label.textContent = L(`1 ${u.hi} = ? वर्ग फुट`, `1 ${u.en} = ? sq ft`);
    const input = document.createElement("input");
    input.className = "lr-input";
    input.id = `local-${u.id}`;
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.addEventListener("input", onInput);
    const hint = document.createElement("small");
    hint.textContent = L(u.note_hi, u.note_en);
    wrap.append(label, input, hint);
    container.append(wrap);
  }
  return {
    locals,
    read() {
      const out = {};
      for (const u of locals) {
        const n = parseNumber($(`local-${u.id}`).value);
        if (Number.isFinite(n) && n > 0) out[u.id] = n;
      }
      return out;
    },
    set(id, v) { const el = $(`local-${id}`); if (el) el.value = v; },
  };
}

/** Render "area in every unit" rows into tbody; `sqft` is the area in square feet. */
export function renderAreaRows(tbody, units, sqft, local) {
  tbody.textContent = "";
  const all = convertAll(units, sqft, "sqft", local);
  for (const u of units) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = uname(u);
    const td = document.createElement("td");
    if (all[u.id] == null) { td.textContent = L("अपना मान भरें", "Enter your value"); td.className = "lr-muted-cell"; }
    else { td.textContent = formatNumber(all[u.id]); td.className = "num"; }
    tr.append(th, td);
    tbody.append(tr);
  }
}

export function copyLink(statusEl) {
  return navigator.clipboard.writeText(location.href).then(
    () => { statusEl.textContent = pick("लिंक कॉपी हो गया. / Link copied."); },
    () => { statusEl.textContent = "लिंक कॉपी नहीं हो सका; एड्रेस बार से कॉपी करें. / Copy from the address bar."; }
  );
}
