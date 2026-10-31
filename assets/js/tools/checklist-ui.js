// Due-diligence checklist: ticks stay in this browser (localStorage); summary is built locally as a .txt file.
const boxes = [...document.querySelectorAll(".lr-checklist input[type=checkbox]")];
const sections = [...document.querySelectorAll(".lr-checklist fieldset[data-section]")];
const out = document.getElementById("ck-progress");
const KEY = "landrecord-checklist-v2";
const en = () => document.documentElement.lang === "en";
const pct = (d, t) => (t ? Math.round((d / t) * 100) : 0);
const visibleText = (el) => {
  const span = el.querySelector(`[data-l="${en() ? "en" : "hi"}"]`);
  return (span || el).textContent.trim();
};

let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { saved = {}; }
boxes.forEach((b) => { b.checked = !!saved[b.dataset.id]; });

function update() {
  const done = boxes.filter((b) => b.checked).length;
  out.textContent = "";
  const s = document.createElement("strong");
  s.textContent = en() ? `${done} of ${boxes.length} done (${pct(done, boxes.length)}%)` : `${done} / ${boxes.length} पूरे (${pct(done, boxes.length)}%)`;
  out.append(s);
  for (const f of sections) {
    const bs = [...f.querySelectorAll("input[type=checkbox]")];
    const d = bs.filter((b) => b.checked).length;
    f.querySelector("[data-sec-out]").textContent = `${d}/${bs.length} · ${pct(d, bs.length)}%`;
  }
  try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(boxes.map((b) => [b.dataset.id, b.checked])))); } catch {}
}

function summary() {
  const lines = [];
  const done = boxes.filter((b) => b.checked).length;
  lines.push(en() ? "LandRecord — land purchase due-diligence checklist" : "LandRecord — जमीन खरीद जाँच-सूची");
  lines.push(`${en() ? "Date" : "तारीख"}: ${new Date().toLocaleDateString("en-IN")}`);
  lines.push(`${en() ? "Overall" : "कुल"}: ${done}/${boxes.length} (${pct(done, boxes.length)}%)`, "");
  for (const f of sections) {
    const bs = [...f.querySelectorAll("input[type=checkbox]")];
    const d = bs.filter((b) => b.checked).length;
    lines.push(`${visibleText(f.querySelector("legend strong"))} — ${d}/${bs.length}`);
    for (const b of bs) lines.push(`  [${b.checked ? "x" : " "}] ${visibleText(b.closest("label"))}`);
    lines.push("");
  }
  lines.push(en()
    ? "Note: general checklist only. It does not replace a lawyer's advice or an official title search."
    : "ध्यान दें: यह सामान्य जाँच-सूची है; वकील की सलाह या आधिकारिक टाइटल-सर्च की जगह नहीं।");
  lines.push(location.href.split("?")[0]);
  return lines.join("\n");
}

function download() {
  const blob = new Blob([summary()], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "landrecord-checklist.txt";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

boxes.forEach((b) => b.addEventListener("change", update));
document.getElementById("ck-reset").addEventListener("click", () => { boxes.forEach((b) => (b.checked = false)); update(); });
document.getElementById("ck-print").addEventListener("click", () => window.print());
document.getElementById("ck-download").addEventListener("click", download);
update();
document.addEventListener("landrecord:languagechange", update);
