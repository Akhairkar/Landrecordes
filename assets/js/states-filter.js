// States hub: client-side search and filters. Without JS every state stays visible.
(() => {
  const form = document.getElementById("st-filter");
  const table = document.getElementById("st-table");
  if (!form || !table) return;
  const rows = [...table.querySelectorAll("tbody tr")];
  const q = document.getElementById("st-q"), conf = document.getElementById("st-conf");
  const owner = document.getElementById("st-owner"), map = document.getElementById("st-map"), reg = document.getElementById("st-reg");
  const count = document.getElementById("st-count");
  const en = () => document.documentElement.lang === "en";
  form.hidden = false;
  form.addEventListener("submit", (e) => e.preventDefault());
  function apply() {
    const term = q.value.trim().toLowerCase();
    let shown = 0;
    for (const r of rows) {
      const ok = (!term || r.dataset.name.includes(term))
        && (!conf.value || r.dataset.conf === conf.value)
        && (!owner.checked || r.dataset.methods.split(" ").includes("owner-name"))
        && (!map.checked || r.dataset.map === "1")
        && (!reg.checked || r.dataset.reg === "1");
      r.hidden = !ok;
      if (ok) shown++;
    }
    count.textContent = en() ? `${shown} of ${rows.length} states/UTs shown` : `${shown} राज्य/UT दिख रहे हैं (कुल ${rows.length})`;
  }
  for (const el of [q, conf, owner, map, reg]) el.addEventListener("input", apply);
  apply();
})();
