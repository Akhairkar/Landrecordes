const boxes = [...document.querySelectorAll(".lr-checklist input[type=checkbox]")];
const out = document.getElementById("ck-progress");
const KEY = "landrecord-checklist-v1";
let saved = [];
try { saved = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { saved = []; }
boxes.forEach((b, i) => { b.checked = !!saved[i]; });
function update() {
  const done = boxes.filter((b) => b.checked).length;
  out.innerHTML = "";
  const s = document.createElement("strong");
  s.textContent = document.documentElement.lang === "en" ? `${done} of ${boxes.length} done` : `${done} / ${boxes.length} पूरे`;
  out.append(s);
  try { localStorage.setItem(KEY, JSON.stringify(boxes.map((b) => b.checked))); } catch {}
}
boxes.forEach((b) => b.addEventListener("change", update));
document.getElementById("ck-reset").addEventListener("click", () => { boxes.forEach((b) => (b.checked = false)); update(); });
document.getElementById("ck-print").addEventListener("click", () => window.print());
update();
document.addEventListener("landrecord:languagechange", update);
