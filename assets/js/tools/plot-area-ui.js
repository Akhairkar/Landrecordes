import { parseNumber } from "./land-units.js";
import { $, L, pick, loadUnits, mountLocalFields, renderAreaRows, copyLink } from "./shared-ui.js";
import * as plot from "./plot-area.js";

const SHAPES = {
  rect: { fields: [["l", "लंबाई / Length"], ["w", "चौड़ाई / Width"]] },
  tri3: { fields: [["a", "भुजा a / Side a"], ["b", "भुजा b / Side b"], ["c", "भुजा c / Side c"]] },
  trih: { fields: [["b", "आधार / Base"], ["h", "ऊँचाई / Height"]] },
  quad: { fields: [["a", "भुजा AB / Side AB"], ["b", "भुजा BC / Side BC"], ["c", "भुजा CD / Side CD"], ["d", "भुजा DA / Side DA"], ["e", "विकर्ण AC / Diagonal AC"]] },
  poly: { fields: [] },
};
const ERR = {
  invalid: "कृपया सभी माप शून्य से बड़ी सही संख्या में भरें. / Enter valid positive measurements.",
  "not-a-triangle": "ये माप त्रिभुज नहीं बना सकते (दो भुजाओं का योग तीसरी से बड़ा होना चाहिए). / These sides cannot form a triangle.",
  "self-intersecting": "बिंदु ऐसे क्रम में हैं कि सीमा खुद को काटती है. बिंदु सीमा के साथ-साथ क्रम में लिखें. / Points cross themselves; list them in order around the boundary.",
  "zero-area": "ये बिंदु एक सीधी रेखा में हैं, क्षेत्रफल शून्य है. / Points are collinear.",
};

async function init() {
  const units = await loadUnits();
  const shape = $("pa-shape"), unit = $("pa-unit"), fieldsBox = $("pa-fields"), polyBox = $("pa-poly-box"), poly = $("pa-poly");
  const status = $("pa-status"), table = $("pa-table"), steps = $("pa-steps"), customWrap = $("pa-custom-wrap"), custom = $("pa-custom");
  const local = mountLocalFields($("pa-local-fields"), units, () => calc());
  const values = {};

  function buildFields() {
    fieldsBox.textContent = "";
    const cfg = SHAPES[shape.value];
    polyBox.hidden = shape.value !== "poly";
    fieldsBox.hidden = shape.value === "poly";
    for (const [id, label] of cfg.fields) {
      const wrap = document.createElement("div");
      wrap.className = "lr-field";
      const l = document.createElement("label");
      l.htmlFor = `pa-f-${id}`;
      l.textContent = pick(label);
      const i = document.createElement("input");
      i.className = "lr-input";
      i.id = `pa-f-${id}`;
      i.inputMode = "decimal";
      i.autocomplete = "off";
      i.value = values[`${shape.value}.${id}`] ?? "";
      i.addEventListener("input", () => { values[`${shape.value}.${id}`] = i.value; calc(); });
      wrap.append(l, i);
      fieldsBox.append(wrap);
    }
    for (const svg of document.querySelectorAll("[data-shape-svg]")) svg.hidden = svg.dataset.shapeSvg !== shape.value;
  }

  function lengthToFt(v) {
    return plot.lengthToFeet(v, unit.value, unit.value === "custom" ? parseNumber(custom.value) : null);
  }

  function calc() {
    customWrap.hidden = unit.value !== "custom";
    table.hidden = true; steps.textContent = ""; status.textContent = "";
    const get = (id) => lengthToFt(parseNumber($(`pa-f-${id}`)?.value));
    let r;
    switch (shape.value) {
      case "rect": r = plot.rectangle(get("l"), get("w")); break;
      case "tri3": r = plot.triangleSides(get("a"), get("b"), get("c")); break;
      case "trih": r = plot.triangleBaseHeight(get("b"), get("h")); break;
      case "quad": r = plot.quadrilateral(get("a"), get("b"), get("c"), get("d"), get("e")); break;
      case "poly": {
        if (!poly.value.trim()) return;
        const pts = plot.parsePoints(poly.value, parseNumber);
        if (!pts) { status.textContent = pick("हर लाइन में दो संख्याएँ लिखें: x, y. / Each line needs two numbers: x, y."); return; }
        r = plot.polygon(pts.map(([x, y]) => [lengthToFt(x), lengthToFt(y)]));
        break;
      }
    }
    if (!r.ok) {
      const anyInput = [...document.querySelectorAll("#pa-fields input")].some((i) => i.value.trim()) || poly.value.trim();
      if (anyInput) status.textContent = pick(ERR[r.reason] || ERR.invalid);
      return;
    }
    renderAreaRows($("pa-body"), units, r.area, local.read());
    for (const s of r.steps) { const li = document.createElement("li"); li.textContent = s; steps.append(li); }
    status.textContent = pick("क्षेत्रफल (सभी इकाइयों में): / Area in every unit:");
    table.hidden = false;
    writeUrl();
  }

  function writeUrl() {
    const p = new URLSearchParams({ s: shape.value, lu: unit.value });
    if (unit.value === "custom" && custom.value) p.set("cf", custom.value);
    if (shape.value === "poly") p.set("pts", poly.value.trim().split(/\n+/).join(";"));
    else for (const [id] of SHAPES[shape.value].fields) { const v = $(`pa-f-${id}`).value.trim(); if (v) p.set(id, v); }
    history.replaceState(null, "", `${location.pathname}?${p}#tool`);
  }

  shape.addEventListener("input", () => { buildFields(); calc(); });
  unit.addEventListener("input", calc);
  custom.addEventListener("input", calc);
  poly.addEventListener("input", calc);
  $("pa-copy").addEventListener("click", () => copyLink(status));

  const q = new URLSearchParams(location.search);
  if (q.get("s") && SHAPES[q.get("s")]) shape.value = q.get("s");
  if (q.get("lu")) unit.value = q.get("lu");
  if (q.get("cf")) custom.value = q.get("cf");
  if (q.get("pts")) poly.value = q.get("pts").split(";").join("\n");
  for (const [id] of SHAPES[shape.value].fields) if (q.get(id)) values[`${shape.value}.${id}`] = q.get(id);
  buildFields();
  calc();
}
init().catch(() => { $("pa-status").textContent = pick("टूल लोड नहीं हो सका. कृपया पेज रीफ़्रेश करें. / Tool failed to load."); });
