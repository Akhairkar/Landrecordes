import { $, L } from "./shared-ui.js";

const CONF = {
  "official-doc": ["सरकारी दस्तावेज़ में इसका उल्लेख मिलता है; फिर भी खोलकर पुष्टि करें", "Mentioned in a government document; still open it to confirm"],
  "multi-source": ["कई स्रोतों में यही पता मिलता है; खोलकर पुष्टि करें", "Several sources give this address; open it to confirm"],
  conflicting: ["स्रोतों में पता अलग-अलग मिलता है; सभी पते जाँचें", "Sources give different addresses; check all of them"],
  "single-source": ["एक ही स्रोत में यह पता मिला; खोलकर पुष्टि करें", "Found in one source only; open it to confirm"],
  unconfirmed: ["आधिकारिक पता पक्का नहीं; राज्य राजस्व विभाग की साइट से पुष्टि करें", "Official address not confirmed; confirm on the state revenue department's site"],
};
// Search methods named in each state's portal steps (data/states.json → search_methods), and which of them
// each "what do you have" answer can use.
const METHODS = {
  "owner-name": ["मालिक का नाम", "owner name"], khasra: ["खसरा/गाटा", "khasra/gata"], khata: ["खाता", "khata"],
  survey: ["सर्वे/गट नंबर", "survey/gat number"], khewat: ["खेवट", "khewat"], dag: ["दाग नंबर", "dag number"],
  patta: ["पट्टा", "patta"], cts: ["CTS नंबर", "CTS number"],
};
const HAVE_METHODS = { khasra: ["khasra", "survey", "dag", "cts"], khata: ["khata", "khewat", "patta"], owner: ["owner-name"], nothing: [] };
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };
const ACTIONS = {
  view: (s) => [`states/${s.id}/`, "राज्य का रिकॉर्ड मार्गदर्शक खोलें", "Open state record guide"],
  certified: () => ["guides/online-vs-certified-copy/", "साधारण और प्रमाणित प्रति का अंतर समझें", "Understand ordinary vs certified copies"],
  mutation: () => ["records/mutation/", "नामांतरण / म्यूटेशन की जानकारी देखें", "Read the mutation guide"],
  map: () => ["maps/", "नक्शा सेवाएँ और उनकी सीमाएँ देखें", "Explore map services and their limits"],
  understand: () => ["tools/land-terms/", "भूमि रिकॉर्ड शब्दकोश खोलें", "Open the land-record glossary"],
};
function externalLink(url, label) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    const a = el("a", label);
    a.href = parsed.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  } catch { return null; }
}

async function init() {
  const [{ states }, rules] = await Promise.all([
    fetch(new URL("data/states.json", document.baseURI)).then((r) => r.json()),
    fetch(new URL("data/rules.json", document.baseURI)).then((r) => r.json()),
  ]);
  const st = $("rf-state"), goal = $("rf-goal"), have = $("rf-have"), out = $("rf-out");
  for (const s of states) st.append(new Option(L(s.name_hi, s.name_en), s.id));
  goal.append(new Option(L("— चुनें —", "— Choose —"), ""));
  have.append(new Option(L("— चुनें —", "— Choose —"), ""));
  for (const g of rules.goals) goal.append(new Option(L(g.label_hi, g.label_en), g.id));
  for (const h of rules.haves) have.append(new Option(L(h.label_hi, h.label_en), h.id));

  function addInternalLink(parent, href, hi, en, className = "lr-finder-text-link") {
    const a = el("a", L(hi, en), className);
    a.href = href;
    parent.append(a);
    return a;
  }

  function render() {
    out.textContent = "";
    const s = states.find((x) => x.id === st.value);
    const g = goal.value, h = have.value;
    if (!s || !g || !h) {
      const empty = el("div", null, "lr-finder-empty");
      empty.append(el("span", "⌕", "lr-finder-empty-icon"));
      empty.append(el("strong", L("सुझाव पाने के लिए तीनों विकल्प चुनें", "Choose all three options to get your guidance")));
      empty.append(el("p", L("हम पहले आपके राज्य और जरूरत के अनुसार रास्ता तय करेंगे।", "We’ll first identify the right route for your state and task.")));
      out.append(empty);
      return;
    }

    const goalItem = rules.goals.find((x) => x.id === g);
    const haveItem = rules.haves.find((x) => x.id === h);
    const methods = Array.isArray(s.search_methods) ? s.search_methods.filter((m) => METHODS[m]) : [];
    const usable = (HAVE_METHODS[h] || []).filter((m) => methods.includes(m));
    const recordName = g === "mutation" ? L(s.mutation_hi, s.mutation_en) : L(s.record_hi, s.record_en);

    const head = el("div", null, "lr-finder-result-head");
    const titleBox = el("div", null, "lr-finder-result-title");
    titleBox.append(el("p", L("आपके चयन के अनुसार", "BASED ON YOUR SELECTION"), "lr-eyebrow"));
    titleBox.append(el("h2", L("आपके लिए सही रास्ता", "Your recommended route")));
    titleBox.append(el("p", L("आपके राज्य में रिकॉर्ड/काम का नाम: ", "Local record or task name: ") + recordName));
    head.append(titleBox);
    const stateBadge = el("span", L(s.name_hi, s.name_en), "lr-finder-state-badge");
    head.append(stateBadge);
    out.append(head);

    const summaryGrid = el("div", null, "lr-finder-summary-grid");
    const localCard = el("article", null, "lr-finder-info-card");
    localCard.append(el("span", "01", "lr-finder-card-number"));
    localCard.append(el("h3", L("आपके राज्य की जानकारी", "Your state details")));
    localCard.append(el("p", L("रिकॉर्ड / प्रक्रिया", "Record / process"), "lr-finder-card-label"));
    localCard.append(el("strong", recordName, "lr-finder-record-name"));
    localCard.append(el("p", L("संबंधित पोर्टल का नाम", "Portal name"), "lr-finder-card-label"));
    localCard.append(el("p", L(s.portal_name, s.portal_en), "lr-finder-portal-name"));
    summaryGrid.append(localCard);

    const methodCard = el("article", null, "lr-finder-info-card");
    methodCard.append(el("span", "02", "lr-finder-card-number"));
    methodCard.append(el("h3", L("आपकी जानकारी से खोज", "Search with what you have")));
    if (usable.length) {
      methodCard.append(el("p", L("इस राज्य के चरणों में ये तरीके दिए गए हैं:", "The state guide lists these search methods:")));
      const chips = el("div", null, "lr-finder-method-chips");
      usable.forEach((m) => chips.append(el("span", L(...METHODS[m]))));
      methodCard.append(chips);
      methodCard.append(el("p", L("आपके पास उपलब्ध जानकारी इन तरीकों में काम आ सकती है। गाँव/क्षेत्र का नाम भी रिकॉर्ड से मिलाएँ।", "Your available details may work with these methods. Match the village/area name with the record too.")));
    } else {
      methodCard.append(el("p", L("आपके चुने हुए विवरण से सीधे खोज का विकल्प राज्य के उपलब्ध चरणों में नहीं दिखता।", "The available state steps do not show a direct search using the details you selected.")));
      methodCard.append(el("p", L("पहले खसरा/गाटा या खाता नंबर ढूँढना बेहतर होगा।", "It is better to find the khasra/gata or khata number first.")));
      addInternalLink(methodCard, "guides/find-khasra-number/", "खसरा नंबर पता करने की गाइड", "Guide to finding a khasra number");
      addInternalLink(methodCard, "guides/land-record-by-name/", "नाम से रिकॉर्ड खोजने की गाइड", "Guide to searching by owner name");
    }
    if (methods.length) {
      methodCard.append(el("p", L("राज्य-पेज पर बताए गए दूसरे तरीके:", "Other methods listed on the state page:")));
      const allChips = el("div", null, "lr-finder-method-chips");
      methods.forEach((m) => allChips.append(el("span", L(...METHODS[m]))));
      methodCard.append(allChips);
    }
    summaryGrid.append(methodCard);
    out.append(summaryGrid);

    const next = el("section", null, "lr-finder-next-card");
    const nextHead = el("div", null, "lr-finder-section-head");
    nextHead.append(el("span", "03", "lr-finder-card-number"));
    nextHead.append(el("div", null));
    nextHead.lastChild.append(el("h3", L("अब आगे क्या करें?", "What to do next")));
    nextHead.lastChild.append(el("p", L("आपके मकसद और उपलब्ध जानकारी के आधार पर", "Based on your goal and available details")));
    next.append(nextHead);
    if (g === "view" || g === "certified") {
      const steps = el("ol", null, "lr-finder-steps");
      for (const step of L(s.steps_hi, s.steps_en)) steps.append(el("li", step));
      next.append(steps);
    }
    next.append(el("p", L(rules.goal_advice[g], rules.goal_advice_en[g]), "lr-finder-advice"));
    if (haveItem) next.append(el("p", L(haveItem.advice_hi, haveItem.advice_en), "lr-finder-advice"));
    const action = ACTIONS[g]?.(s);
    if (action) {
      const actionRow = el("div", null, "lr-finder-action-row");
      addInternalLink(actionRow, action[0], action[1], action[2], "lr-btn secondary");
      next.append(actionRow);
    }
    if ((h === "owner" || h === "nothing") && usable.length === 0) {
      const actionRow = el("div", null, "lr-finder-action-row");
      addInternalLink(actionRow, "guides/find-khasra-number/", "खसरा / सर्वे नंबर पता करने की गाइड", "Guide to finding a khasra / survey number", "lr-btn secondary");
      next.append(actionRow);
    }
    out.append(next);

    const why = el("details", null, "lr-finder-why");
    why.append(el("summary", L("यह सुझाव क्यों मिला? सावधानी और नियम देखें", "Why this recommendation? View the rule and cautions")));
    why.append(el("p", L(
      "नियम " + "goal." + g + " × have." + h + " × state." + s.id + ": आपका राज्य पोर्टल और स्थानीय नाम तय करता है; मकसद और आपके पास की जानकारी सलाह तय करती है।",
      "Rule " + "goal." + g + " × have." + h + " × state." + s.id + ": your state determines the portal and local name; your goal and available details determine the guidance."
    )));
    const cautions = L(s.watch_hi, s.watch_en).slice(0, 2);
    cautions.forEach((w) => why.append(el("p", L("सावधानी: ", "Caution: ") + w)));
    why.append(el("p", L("यह आधिकारिक निर्णय या कानूनी सलाह नहीं है। अंतिम पुष्टि राज्य के आधिकारिक पोर्टल या संबंधित राजस्व कार्यालय से करें।", "This is not an official decision or legal advice. Confirm with the official state portal or the relevant revenue office.")));
    out.append(why);

    const portalCard = el("section", null, "lr-finder-portal-card");
    const portalCopy = el("div", null, "lr-finder-portal-copy");
    portalCopy.append(el("p", L("आखिरी चरण", "FINAL STEP"), "lr-eyebrow"));
    portalCopy.append(el("h3", L("अब सही सरकारी पोर्टल पर जाएँ", "Now open the relevant government portal")));
    portalCopy.append(el("p", L("ऊपर रिकॉर्ड का नाम, खोजने का तरीका और जरूरी सावधानी समझ लें। उसके बाद सरकारी पोर्टल पर अपना रिकॉर्ड खोजें।", "Review the record name, search method and cautions above. Then continue to the government portal to search for your record.")));
    const confidenceText = CONF[s.confidence] || CONF.unconfirmed;
    portalCopy.append(el("p", L(...confidenceText), "lr-finder-portal-confidence"));
    portalCard.append(portalCopy);
    if (s.url) {
      const a = externalLink(s.url, L("सरकारी पोर्टल खोलें", "Open government portal"));
      if (a) {
        a.className = "lr-btn lr-finder-portal-button";
        portalCard.append(a);
        portalCard.append(el("p", new URL(s.url).host, "lr-finder-host"));
      }
    } else {
      portalCard.append(el("p", L("इस राज्य का सार्वजनिक ऑनलाइन पोर्टल लिंक उपलब्ध/पुष्ट नहीं है। राज्य के राजस्व विभाग की आधिकारिक वेबसाइट या संबंधित कार्यालय से पता लें।", "A public online portal link for this state is unavailable or unconfirmed. Get the address from the state revenue department’s official website or the relevant office."), "lr-finder-portal-missing"));
    }
    if (Array.isArray(s.alt_urls) && s.alt_urls.length) {
      const altWrap = el("div", null, "lr-finder-alt-links");
      altWrap.append(el("p", L("अन्य स्रोतों के पते", "Other source addresses")));
      s.alt_urls.forEach((url) => {
        const a = externalLink(url, url.replace(/^https?:\/\//, ""));
        if (a) altWrap.append(a);
      });
      portalCard.append(altWrap);
    }
    out.append(portalCard);

    const query = new URLSearchParams({ s: st.value, g, h });
    history.replaceState(null, "", location.pathname + "?" + query.toString());
  }
  for (const e of [st, goal, have]) e.addEventListener("input", render);
  const q = new URLSearchParams(location.search);
  if (q.get("s") && states.some((x) => x.id === q.get("s"))) st.value = q.get("s");
  if (q.get("g") && rules.goals.some((x) => x.id === q.get("g"))) goal.value = q.get("g");
  if (q.get("h") && rules.haves.some((x) => x.id === q.get("h"))) have.value = q.get("h");
  render();
}
init().catch(() => { $("rf-out").textContent = L("मार्गदर्शक लोड नहीं हो सका।", "The guide failed to load."); });
