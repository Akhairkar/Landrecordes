import { $, L } from "./shared-ui.js";

const CONF = {
  "official-doc": ["सरकारी दस्तावेज़ में इसका उल्लेख मिलता है; फिर भी खोलकर पुष्टि करें", "Mentioned in a government document; still open it to confirm"],
  "multi-source": ["कई स्रोतों में यही पता मिलता है; खोलकर पुष्टि करें", "Several sources give this address; open it to confirm"],
  conflicting: ["स्रोतों में पता अलग-अलग मिलता है; सभी पते जाँचें", "Sources give different addresses; check all of them"],
  "single-source": ["एक ही स्रोत में यह पता मिला; खोलकर पुष्टि करें", "Found in one source only; open it to confirm"],
  unconfirmed: ["आधिकारिक पता पक्का नहीं; राज्य राजस्व विभाग की साइट से पुष्टि करें", "Official address not confirmed; confirm on the state revenue department's site"],
};
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };

async function init() {
  const [{ states }, rules] = await Promise.all([
    fetch(new URL("data/states.json", document.baseURI)).then((r) => r.json()),
    fetch(new URL("data/rules.json", document.baseURI)).then((r) => r.json()),
  ]);
  const st = $("rf-state"), goal = $("rf-goal"), have = $("rf-have"), out = $("rf-out");
  for (const s of states) st.append(new Option(L(s.name_hi, s.name_en), s.id));
  for (const g of rules.goals) goal.append(new Option(L(g.label_hi, g.label_en), g.id));
  for (const h of rules.haves) have.append(new Option(L(h.label_hi, h.label_en), h.id));

  function render() {
    out.textContent = "";
    const s = states.find((x) => x.id === st.value);
    if (!s) return;
    const g = goal.value, h = have.value;
    const box = el("div", null, "lr-result");
    box.append(el("h3", `${L(s.name_hi, s.name_en)}: ${L(s.portal_name, s.portal_en)}`));
    if (s.url) {
      const p = el("p");
      const a = el("a", L("पोर्टल खोलें (नई विंडो)", "Open portal (new window)"));
      a.href = s.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      p.append(a, document.createTextNode(` · ${s.url.replace(/^https?:\/\//, "")}`));
      box.append(p);
    }
    box.append(el("p", L(...CONF[s.confidence])));
    if (s.alt_urls.length) box.append(el("p", `${L("अन्य पते", "Other addresses")}: ${s.alt_urls.join(", ")}`));
    box.append(el("p", `${L("आपके राज्य में इसे कहते हैं", "In your state this is called")}: ${g === "mutation" ? L(s.mutation_hi, s.mutation_en) : L(s.record_hi, s.record_en)}`));
    out.append(box);

    const hv = rules.haves.find((x) => x.id === h);
    const next = el("div", null, "lr-result");
    next.append(el("h3", L("अगला कदम", "Next step")));
    if (g === "view" || g === "certified") {
      const ol = el("ol");
      for (const step of L(s.steps_hi, s.steps_en)) ol.append(el("li", step));
      next.append(ol);
    }
    next.append(el("p", L(rules.goal_advice[g], rules.goal_advice_en[g])), el("p", L(hv.advice_hi, hv.advice_en)));
    if (g === "understand") {
      const l = el("a", L("शब्दकोश खोलें", "Open the glossary")); l.href = "tools/land-terms/";
      const q = el("p"); q.append(l); next.append(q);
    }
    out.append(next);

    const why = el("div", null, "lr-result");
    why.append(el("h3", L("यह सुझाव क्यों? (नियम)", "Why this suggestion? (rule)")));
    why.append(el("p", L(`नियम goal.${g} × have.${h} × state.${s.id}: आपका राज्य पोर्टल और स्थानीय नाम तय करता है; मकसद और आपके पास की जानकारी सलाह तय करती है।`,
      `Rule goal.${g} × have.${h} × state.${s.id}: your state decides the portal and local name; your goal and what you have decide the advice.`)));
    for (const w of L(s.watch_hi, s.watch_en).slice(0, 2)) why.append(el("p", `${L("सावधानी", "Caution")}: ${w}`));
    why.append(el("p", L("यह आधिकारिक निर्णय या कानूनी सलाह नहीं है। निर्णय से पहले राज्य के आधिकारिक पोर्टल/तहसील से पुष्टि करें।", "This is not an official decision or legal advice. Confirm with the state's official portal/tehsil before deciding."), "lr-en"));
    out.append(why);
    const url = new URLSearchParams({ s: st.value, g, h });
    history.replaceState(null, "", `${location.pathname}?${url}`);
  }
  for (const e of [st, goal, have]) e.addEventListener("input", render);
  const q = new URLSearchParams(location.search);
  if (q.get("s") && states.some((x) => x.id === q.get("s"))) st.value = q.get("s");
  if (q.get("g") && rules.goals.some((x) => x.id === q.get("g"))) goal.value = q.get("g");
  if (q.get("h") && rules.haves.some((x) => x.id === q.get("h"))) have.value = q.get("h");
  render();
}
init().catch(() => { $("rf-out").textContent = L("मार्गदर्शक लोड नहीं हो सका।", "The guide failed to load."); });
