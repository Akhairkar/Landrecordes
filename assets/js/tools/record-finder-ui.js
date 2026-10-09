import { $ } from "./shared-ui.js";

const CONF = {
  "official-doc": "सरकारी दस्तावेज़ में इसका उल्लेख मिलता है; फिर भी खोलकर पुष्टि करें",
  "multi-source": "कई स्रोतों में यही पता मिलता है; खोलकर पुष्टि करें",
  conflicting: "स्रोतों में पता अलग-अलग मिलता है; सभी पते जाँचें",
  "single-source": "एक ही स्रोत में यह पता मिला; खोलकर पुष्टि करें",
  unconfirmed: "आधिकारिक पता पक्का नहीं; राज्य राजस्व विभाग की साइट से पुष्टि करें",
};
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };

async function init() {
  const [{ states }, rules, { terms }] = await Promise.all([
    fetch(new URL("data/states.json", document.baseURI)).then((r) => r.json()),
    fetch(new URL("data/rules.json", document.baseURI)).then((r) => r.json()),
    fetch(new URL("data/terms.json", document.baseURI)).then((r) => r.json()),
  ]);
  const st = $("rf-state"), goal = $("rf-goal"), have = $("rf-have"), out = $("rf-out");
  for (const s of states) st.append(new Option(`${s.name_hi} / ${s.name_en}`, s.id));
  for (const g of rules.goals) goal.append(new Option(g.label_hi, g.id));
  for (const h of rules.haves) have.append(new Option(h.label_hi, h.id));

  function render() {
    out.textContent = "";
    const s = states.find((x) => x.id === st.value);
    if (!s) return;
    const g = goal.value, h = have.value;
    const box = el("div", null, "lr-result");
    box.append(el("h3", `${s.name_hi}: ${s.portal_name}`));
    if (s.url) {
      const p = el("p");
      const a = el("a", "पोर्टल खोलें (नई विंडो)");
      a.href = s.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      p.append(a, document.createTextNode(` · ${s.url.replace(/^https?:\/\//, "")}`));
      box.append(p);
    }
    box.append(el("p", CONF[s.confidence]));
    if (s.alt_urls.length) box.append(el("p", `अन्य पते: ${s.alt_urls.join(", ")}`));
    box.append(el("p", `आपके राज्य में इसे कहते हैं: ${g === "mutation" ? s.mutation_hi : s.record_hi}`));
    out.append(box);

    const advice = rules.goal_advice[g];
    const hv = rules.haves.find((x) => x.id === h);
    const next = el("div", null, "lr-result");
    next.append(el("h3", "अगला कदम"));
    if (g === "view" || g === "certified") {
      const ol = el("ol");
      for (const step of s.steps_hi) ol.append(el("li", step));
      next.append(ol);
    }
    next.append(el("p", advice), el("p", hv.advice_hi));
    if (g === "understand") {
      const l = el("a", "शब्दकोश खोलें"); l.href = "tools/land-terms/";
      const q = el("p"); q.append(l); next.append(q);
    }
    out.append(next);

    const why = el("div", null, "lr-result");
    why.append(el("h3", "यह सुझाव क्यों? (नियम)"));
    why.append(el("p", `नियम goal.${g} × have.${h} × state.${s.id}: आपका राज्य पोर्टल और स्थानीय नाम तय करता है; मकसद और आपके पास की जानकारी सलाह तय करती है।`));
    for (const w of s.watch_hi.slice(0, 2)) why.append(el("p", `सावधानी: ${w}`));
    why.append(el("p", "यह आधिकारिक निर्णय या कानूनी सलाह नहीं है। निर्णय से पहले राज्य के आधिकारिक पोर्टल/तहसील से पुष्टि करें।", "lr-en"));
    out.append(why);
    const url = new URLSearchParams({ s: st.value, g, h });
    history.replaceState(null, "", `${location.pathname}?${url}`);
  }
  for (const e of [st, goal, have]) e.addEventListener("input", render);
  const q = new URLSearchParams(location.search);
  if (q.get("s") && states.some((x) => x.id === q.get("s"))) st.value = q.get("s");
  if (q.get("g") && rules.goals.some((x) => x.id === q.get("g"))) goal.value = q.get("g");
  if (q.get("h") && rules.haves.some((x) => x.id === q.get("h"))) have.value = q.get("h");
  void terms;
  render();
}
init().catch(() => { $("rf-out").textContent = "मार्गदर्शक लोड नहीं हो सका. / Failed to load."; });
