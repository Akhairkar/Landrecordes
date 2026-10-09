// Shared helpers for LandRecord tool pages (DOM side). Pure maths lives in sibling modules.
import { parseNumber, convertAll, formatNumber } from "./land-units.js";

export const $ = (id) => document.getElementById(id);

export async function loadUnits() {
  const res = await fetch(new URL("data/units.json", document.baseURI));
  if (!res.ok) throw new Error("units");
  return (await res.json()).units;
}

export function fillUnitSelect(select, units) {
  for (const u of units) {
    const o = document.createElement("option");
    o.value = u.id;
    o.textContent = `${u.hi} / ${u.en}`;
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
    label.textContent = `1 ${u.hi} = ? वर्ग फुट`;
    const input = document.createElement("input");
    input.className = "lr-input";
    input.id = `local-${u.id}`;
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.addEventListener("input", onInput);
    const hint = document.createElement("small");
    hint.textContent = u.note_hi;
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
    th.textContent = `${u.hi} / ${u.en}`;
    const td = document.createElement("td");
    if (all[u.id] == null) { td.textContent = "अपना मान भरें"; td.className = "lr-muted-cell"; }
    else { td.textContent = formatNumber(all[u.id]); td.className = "num"; }
    tr.append(th, td);
    tbody.append(tr);
  }
}

export function copyLink(statusEl) {
  return navigator.clipboard.writeText(location.href).then(
    () => { statusEl.textContent = "लिंक कॉपी हो गया. / Link copied."; },
    () => { statusEl.textContent = "लिंक कॉपी नहीं हो सका; एड्रेस बार से कॉपी करें. / Copy from the address bar."; }
  );
}
