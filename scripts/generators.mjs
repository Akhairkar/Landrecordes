// Data-driven pages (states hub, state pages, glossary tool, record-finder tool), rendered in Hindi and English.
// Every fact comes from data/*.json with source ids (BUILD_RULES §A1). No page is created from a name swap alone:
// each state page renders state-specific facts, cautions and FAQs authored per state.
const CONF = {
  "official-doc": ["ok", "सरकारी दस्तावेज़ में इसका उल्लेख मिलता है; फिर भी खोलकर पुष्टि करें", "Mentioned in a government document; still open it to confirm"],
  "multi-source": ["ok", "कई स्रोतों में यही पता मिलता है; खोलकर पुष्टि करें", "Several sources give this address; open it to confirm"],
  conflicting: ["", "स्रोतों में पता अलग-अलग मिलता है; नीचे दिए सभी पते जाँचें", "Sources give different addresses; check all of them below"],
  "single-source": ["", "एक ही स्रोत में यह पता मिला; खोलकर पुष्टि करें", "Found in one source only; open it to confirm"],
  unconfirmed: ["", "आधिकारिक पता हम पक्का नहीं कर पाए; राज्य राजस्व विभाग की साइट से पुष्टि करें", "We could not confirm the official address; confirm it on the state revenue department's site"],
};
const CONF_SHORT = {
  "official-doc": ["सरकारी दस्तावेज़ में", "In a govt document"], "multi-source": ["कई स्रोत", "Several sources"],
  conflicting: ["पते अलग-अलग", "Addresses differ"], "single-source": ["एक स्रोत", "One source"], unconfirmed: ["पुष्टि जारी", "Unconfirmed"],
};
const NEIGHBOURS = {
  "uttar-pradesh": ["uttarakhand", "bihar"], maharashtra: ["gujarat", "madhya-pradesh"], rajasthan: ["madhya-pradesh", "haryana"],
  "madhya-pradesh": ["rajasthan", "uttar-pradesh"], bihar: ["uttar-pradesh", "madhya-pradesh"], gujarat: ["maharashtra", "rajasthan"],
  haryana: ["punjab", "delhi"], punjab: ["haryana", "himachal-pradesh"], delhi: ["haryana", "uttar-pradesh"],
  uttarakhand: ["uttar-pradesh", "himachal-pradesh"], "himachal-pradesh": ["punjab", "uttarakhand"], "jammu-and-kashmir": ["punjab", "himachal-pradesh"],
  karnataka: ["telangana", "andhra-pradesh"], telangana: ["andhra-pradesh", "karnataka"], "andhra-pradesh": ["telangana", "tamil-nadu"], "tamil-nadu": ["andhra-pradesh", "karnataka"],
  "west-bengal": ["odisha", "jharkhand"], odisha: ["west-bengal", "jharkhand"], chhattisgarh: ["madhya-pradesh", "jharkhand"], jharkhand: ["bihar", "odisha"],
};
const JAMABANDI = ["records/jamabandi-fard/", "जमाबंदी और फर्द क्या हैं", "Jamabandi and fard explained"];
const SATBARA = ["records/satbara-7-12/", "7/12 उतारा और 8-अ क्या हैं", "7/12 and 8-A explained"];
const MAIN_RECORD_PAGE = { maharashtra: SATBARA, gujarat: SATBARA, haryana: JAMABANDI, punjab: JAMABANDI, rajasthan: JAMABANDI, "himachal-pradesh": JAMABANDI, "jammu-and-kashmir": JAMABANDI, bihar: JAMABANDI };

function liveNote(entry) {
  if (!entry) return ["", ""];
  const d = entry.checked;
  if (entry.status >= 200 && entry.status < 400) return [`स्वचालित जाँच (${d}): यह पता खुला (HTTP ${entry.status})।`, `Automatic check (${d}): this address opened (HTTP ${entry.status}).`];
  if (entry.error === "ENOTFOUND") return [`स्वचालित जाँच (${d}): यह पता हमारी जाँच में खुला ही नहीं (डोमेन नहीं मिला)। सावधानी से पुष्टि करें।`, `Automatic check (${d}): this address did not resolve (domain not found). Confirm carefully.`];
  if (entry.status === 404) return [`स्वचालित जाँच (${d}): इस पते ने 'पेज नहीं मिला' (404) दिया; सही पता राज्य विभाग की साइट से देखें।`, `Automatic check (${d}): this address returned 'not found' (404); get the right address from the state department's site.`];
  return [`स्वचालित जाँच (${d}): हमारे सर्वर से नहीं खुला (${entry.status || entry.error}); इसे बंद न समझें, खुद खोलकर देखें।`, `Automatic check (${d}): did not open from our server (${entry.status || entry.error}); don't assume it is down, open it yourself.`];
}

export function generate({ readJson, esc }) {
  let linkStatus = {};
  try { linkStatus = readJson("data/link-status.json"); } catch { linkStatus = {}; }
  const { states, reviewed_on } = readJson("data/states.json");
  const byId = Object.fromEntries(states.map((s) => [s.id, s]));
  const out = [];
  const trim = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");
  const bi = (hi, en) => `<span data-l="hi">${hi}</span><span data-l="en">${en}</span>`;
  const host = (u) => esc(u.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  const link = (u) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${host(u)}</a>`;
  const portalSources = [...new Set(states.flatMap((s) => s.sources).filter((x) => x.startsWith("portal-")))];

  // ---- states hub ----
  const rows = states
    .map((s) => `<tr><th scope="row"><a href="states/${s.id}/">${bi(esc(s.name_hi), esc(s.name_en))}</a></th><td>${bi(esc(s.portal_name), esc(s.portal_en))}</td><td>${bi(esc(s.record_hi), esc(s.record_en))}</td><td>${bi(esc(s.mutation_hi), esc(s.mutation_en))}</td><td><span class="lr-badge ${CONF[s.confidence][0]}">${bi(...CONF_SHORT[s.confidence])}</span></td></tr>`)
    .join("");
  out.push({
    rel: "states/index.html",
    meta: {
      title: "राज्य-वार भूमि रिकॉर्ड पोर्टल और स्थानीय शब्द | LandRecord",
      description: "20 राज्यों में जमीन का रिकॉर्ड देखने के पोर्टल, वहाँ के स्थानीय शब्द (खतौनी, जमाबंदी, 7/12) और नाम बदलवाने की प्रक्रिया का नाम, एक तालिका में।",
      type: "hub", status: "draft", reviewed_on, active: "states",
      intent: "Pick the state to see its land-record portal, local terms and mutation term.",
      unique_value: "Side-by-side table of portal, record names, mutation term and address-confidence per state; each row links to a state page.",
      keywords: ["state", "राज्य", "bhulekh", "भूलेख", "portal", "पोर्टल", "land record"],
      breadcrumbs: [{ name: "राज्य", name_en: "States", path: "states/" }],
      sources: ["dilrmp"],
      related: [{ path: "tools/record-finder/", label: "रिकॉर्ड-खोज मार्गदर्शक", label_en: "Record finder" }, { path: "tools/land-terms/", label: "शब्दकोश: खतौनी = जमाबंदी = 7/12", label_en: "Glossary: khatauni = jamabandi = 7/12" }],
    },
    body: `<h1>राज्य-वार भूमि रिकॉर्ड पोर्टल <span class="lr-en">/ Land records by state</span></h1>
<p class="lr-lead" data-l="hi">हर राज्य में जमीन के रिकॉर्ड के नाम, पोर्टल और प्रक्रिया अलग हैं। अपना राज्य चुनें और देखें कि वहाँ रिकॉर्ड को क्या कहते हैं, कहाँ देखते हैं और किन बातों का ध्यान रखें। अभी 20 राज्य जोड़े गए हैं; बाकी राज्य सत्यापित जानकारी मिलने पर ही जोड़े जाएँगे।</p>
<p class="lr-lead" data-l="en">Record names, portals and processes differ in every state. Pick your state to see what the record is called, where to see it and what to watch out for. 20 states are covered so far; others will be added only after verification.</p>
<p class="lr-chips" data-l="hi">${states.map((s) => `<a href="states/${s.id}/">${esc(s.name_hi)}</a>`).join(" ")}</p>
<p class="lr-chips" data-l="en">${states.map((s) => `<a href="states/${s.id}/">${esc(s.name_en)}</a>`).join(" ")}</p>
<div class="lr-table-wrap"><table class="lr-table" style="min-width:680px"><caption style="text-align:left;padding:8px 0">${bi("अब तक शामिल राज्य", "States covered so far")}</caption><thead><tr><th scope="col">${bi("राज्य", "State")}</th><th scope="col">${bi("पोर्टल", "Portal")}</th><th scope="col">${bi("मुख्य रिकॉर्ड", "Main record")}</th><th scope="col">${bi("म्यूटेशन को कहते हैं", "Mutation is called")}</th><th scope="col">${bi("पोर्टल का पता", "Portal address")}</th></tr></thead><tbody>${rows}</tbody></table></div>
<div class="lr-prose" data-l="hi"><h2>"पोर्टल का पता" वाला स्तंभ क्या बताता है?</h2>
<p>हर राज्य के पोर्टल का पता हमने अलग-अलग स्रोतों से मिलाया है। जहाँ स्रोत आपस में सहमत नहीं थे, वहाँ हमने सभी पते दिखाए और उसे साफ लिखा है। जहाँ आधिकारिक पता पक्का नहीं हो पाया, वहाँ "पुष्टि जारी" लिखा है। यह पुष्टि आप राज्य के राजस्व विभाग की वेबसाइट से कर सकते हैं।</p>
<p>राष्ट्रीय स्तर पर राज्यों के पोर्टल की सूची भूमि संसाधन विभाग के DILRMP कार्यक्रम के पास है, जो हमारा मार्गदर्शक संदर्भ है, पर वह यह साबित नहीं करता कि हर राज्य में एक जैसी सेवाएँ हैं।</p></div>
<div class="lr-prose" data-l="en"><h2>What does the "portal address" column mean?</h2>
<p>We matched each state's portal address across several sources. Where sources disagreed, we show all addresses and say so. Where the official address could not be confirmed, it says "unconfirmed"; you can confirm it on the state revenue department's website.</p>
<p>At national level the list of state portals is kept by the Department of Land Resources' DILRMP programme, our guiding reference, but it does not prove that every state offers the same services.</p></div>`,
  });

  // ---- state pages ----
  for (const s of states) {
    const [cls, confHi, confEn] = CONF[s.confidence];
    const alt = s.alt_urls.length ? `<p>${bi("अन्य स्रोतों में दिखने वाले पते:", "Other addresses seen in sources:")} ${s.alt_urls.map(link).join(", ")}</p>` : "";
    const live = [s.url, ...s.alt_urls].filter(Boolean).filter((u) => linkStatus[u]).map((u) => {
      const [hi, en] = liveNote(linkStatus[u]);
      return `<p class="lr-en" style="margin:2px 0">${host(u)} — ${bi(esc(hi), esc(en))}</p>`;
    }).join("");
    const recLink = MAIN_RECORD_PAGE[s.id];
    const nb = NEIGHBOURS[s.id].map((id) => byId[id]);
    const descFull = `${s.name_hi} में ${s.record_hi} देखने का पोर्टल (${s.portal_name}), खोज के चरण, सावधानियाँ और स्थानीय शब्दों का मतलब, सरल हिंदी में।`;
    const descAlt = `${s.name_hi} में जमीन का रिकॉर्ड देखने का पोर्टल, खोज के चरण, सावधानियाँ और स्थानीय शब्दों का मतलब, सरल हिंदी में।`;
    const descAlt2 = `${s.name_hi} में जमीन का रिकॉर्ड ऑनलाइन देखने का पोर्टल, खोज के चरण, सावधानियाँ और स्थानीय शब्दों का मतलब, सरल हिंदी में।`;
    const description = [descFull, descAlt2, descAlt].find((d) => d.length >= 110 && d.length <= 160) || descAlt2;
    const li = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join("");
    out.push({
      rel: `states/${s.id}/index.html`,
      meta: {
        title: trim(`${s.name_hi} में जमीन का रिकॉर्ड ऑनलाइन कैसे देखें`, 60),
        description,
        type: "state", status: "draft", reviewed_on, active: "states",
        intent: `Find and read ${s.name_en} land records online and understand the local terms.`,
        unique_value: `${s.name_en}-specific portal (${s.portal_en}), local record names (${s.record_en}), mutation term (${s.mutation_en}), unit habits and cautions, with address confidence shown.`,
        keywords: [s.name_en, s.name_hi, "bhulekh", "भूलेख", s.portal_name, s.portal_en, "khatauni", "jamabandi", "land record"],
        breadcrumbs: [{ name: "राज्य", name_en: "States", path: "states/" }, { name: s.name_hi, name_en: s.name_en, path: `states/${s.id}/` }],
        sources: s.sources,
        faq: s.faq,
        faq_en: s.faq_en,
        related: [
          { path: "states/", label: "सभी राज्यों की तालिका", label_en: "Table of all states" },
          { path: "tools/record-finder/", label: "रिकॉर्ड-खोज मार्गदर्शक", label_en: "Record finder" },
          ...(recLink ? [{ path: recLink[0], label: recLink[1], label_en: recLink[2] }] : [{ path: "records/ror/", label: "अधिकार-अभिलेख (RoR) क्या है", label_en: "What is a Record of Rights" }]),
          { path: "records/mutation/", label: "म्यूटेशन के अलग-अलग नाम", label_en: "Names for mutation" },
          ...nb.map((n) => ({ path: `states/${n.id}/`, label: `${n.name_hi} के भूमि रिकॉर्ड`, label_en: `${n.name_en} land records` })),
        ],
      },
      body: `<h1>${esc(s.name_hi)} में जमीन का रिकॉर्ड ऑनलाइन कैसे देखें <span class="lr-en">/ ${esc(s.name_en)} land records online</span></h1>
<p class="lr-lead" data-l="hi">${esc(s.intro_hi)}</p>
<p class="lr-lead" data-l="en">${esc(s.intro_en)}</p>
<section class="lr-card" aria-labelledby="portal-h"><h2 id="portal-h" style="margin-top:0">आधिकारिक पोर्टल <span class="lr-en">/ Official portal</span></h2>
<p><strong>${bi(esc(s.portal_name), esc(s.portal_en))}</strong></p>
${s.url ? `<p><a class="lr-btn" style="display:inline-flex;align-items:center;text-decoration:none" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${bi("पोर्टल खोलें (नई विंडो)", "Open portal (new window)")}</a></p>
<p>${bi("पता:", "Address:")} ${link(s.url)} <span class="lr-badge ${cls}">${bi(esc(confHi), esc(confEn))}</span></p>` : `<p><span class="lr-badge ${cls}">${bi(esc(confHi), esc(confEn))}</span></p>`}${alt}
${live}</section>
<div class="lr-prose" data-l="hi">
<h2>यहाँ रिकॉर्ड को क्या कहते हैं</h2>
<ul><li><strong>मुख्य रिकॉर्ड:</strong> ${esc(s.record_hi)}</li><li><strong>म्यूटेशन (नाम परिवर्तन):</strong> ${esc(s.mutation_hi)}</li><li><strong>क्षेत्रफल की इकाइयाँ:</strong> ${esc(s.units_hi)}</li></ul>
<h2>रिकॉर्ड खोजने का सामान्य क्रम</h2>
<ol>${li(s.steps_hi)}</ol>
<h2>${esc(s.name_hi)} में ध्यान रखने की बातें</h2>
<ul>${li(s.watch_hi)}</ul>
${s.example_hi ? `<h2>पढ़ने का उदाहरण</h2>\n<p>${esc(s.example_hi)}</p>\n` : ""}<h2>नक्शा और स्थान का संदर्भ</h2>
<p>भू-नक्शा राज्य के पोर्टल पर देखें; LandRecord कोई नक्शा या सीमा नहीं दिखाता।</p>
<h2>उपयोगी टूल</h2>
<p><a href="tools/record-finder/">रिकॉर्ड-खोज मार्गदर्शक</a> · <a href="tools/land-unit-converter/">इकाई कैलकुलेटर</a> · <a href="tools/land-terms/">शब्दकोश</a></p>
</div>
<div class="lr-prose" data-l="en">
<h2>What the record is called here</h2>
<ul><li><strong>Main record:</strong> ${esc(s.record_en)}</li><li><strong>Mutation (name change):</strong> ${esc(s.mutation_en)}</li><li><strong>Units of area:</strong> ${esc(s.units_en)}</li></ul>
<h2>Typical steps to find a record</h2>
<ol>${li(s.steps_en)}</ol>
<h2>Things to watch in ${esc(s.name_en)}</h2>
<ul>${li(s.watch_en)}</ul>
${s.example_en ? `<h2>Reading example</h2>\n<p>${esc(s.example_en)}</p>\n` : ""}<h2>Map and location context</h2>
<p>See the land map on the state portal; LandRecord does not show any map or boundary.</p>
<h2>Useful tools</h2>
<p><a href="tools/record-finder/">Record finder</a> · <a href="tools/land-unit-converter/">Unit converter</a> · <a href="tools/land-terms/">Glossary</a></p>
</div>`,
    });
  }

  // ---- glossary tool ----
  out.push({
    rel: "tools/land-terms/index.html",
    meta: {
      title: "भूमि रिकॉर्ड शब्दकोश: खतौनी, जमाबंदी, 7/12 का मतलब",
      description: "खतौनी, जमाबंदी, 7/12, खसरा, खेवट, फर्द और इंतकाल जैसे शब्दों का मतलब, और 20 राज्यों में किस काम के लिए कौन-सा नाम चलता है, खोजकर देखें।",
      type: "tool", tool: true, status: "draft", reviewed_on, active: "tools",
      intent: "Translate a land-record term into what it is called in another state.",
      unique_value: "Searchable state-by-state term mapping drawn from the sourced portal data.",
      keywords: ["khatauni", "jamabandi", "7/12", "khasra", "khewat", "fard", "intkal", "dakhil kharij", "namantaran", "ferfar", "ror", "शब्दकोश", "glossary"],
      breadcrumbs: [{ name: "टूल्स", name_en: "Tools", path: "tools/" }, { name: "शब्दकोश", name_en: "Glossary", path: "tools/land-terms/" }],
      sources: ["dilrmp", ...portalSources],
      scripts: ["assets/js/tools/land-terms-ui.js"],
      related: [{ path: "states/", label: "राज्य-वार पोर्टल", label_en: "State portals" }, { path: "records/ror/", label: "अधिकार-अभिलेख (RoR) क्या है", label_en: "What is a Record of Rights" }],
    },
    body: `<h1>भूमि रिकॉर्ड शब्दकोश <span class="lr-en">/ Land-record glossary</span></h1>
<p class="lr-lead" data-l="hi">एक ही चीज़ के लिए हर राज्य में अलग नाम चलता है। कोई शब्द खोजें (जैसे &quot;खतौनी&quot; या &quot;इंतकाल&quot;) और देखें कि 20 राज्यों में उसे क्या कहते हैं।</p>
<p class="lr-lead" data-l="en">The same thing has a different name in every state. Search a term (e.g. &quot;khatauni&quot; or &quot;intkal&quot;) and see what it is called across 20 states.</p>
<section class="lr-card" aria-labelledby="tt-h"><h2 id="tt-h" style="margin-top:0">शब्द खोजें <span class="lr-en">/ Search</span></h2>
<div class="lr-field"><label for="tt-q">शब्द या राज्य <span class="lr-en">/ Term or state</span></label><input class="lr-input" id="tt-q" type="search" autocomplete="off" placeholder="खतौनी, 7/12, intkal, Punjab…"></div>
<p id="tt-status" role="status" aria-live="polite" class="lr-en"></p><div id="tt-out"></div></section>
<div class="lr-prose" data-l="hi"><h2>इस शब्दकोश की सीमाएँ</h2><p>यहाँ दिए नाम पोर्टल और स्रोतों में मिले आम प्रयोग हैं। गाँव या जिले की स्थानीय बोली और पुराने रिकॉर्ड में कुछ और नाम भी चल सकते हैं। दो राज्यों के शब्द अर्थ में पूरी तरह बराबर नहीं होते, जैसे महाराष्ट्र का 7/12 एक सर्वे नंबर का रिकॉर्ड है जबकि कई राज्यों की जमाबंदी/खतौनी खाते (जोत) के आधार पर बनती है। इसलिए किसी भी काम से पहले अपने राज्य का आधिकारिक पोर्टल देखें।</p></div>
<div class="lr-prose" data-l="en"><h2>Limits of this glossary</h2><p>The names here are common usages found in portals and sources. Local dialects and old records may use other names. Terms in two states are not exact equivalents: Maharashtra's 7/12 is the record of one survey number, while many states' jamabandi/khatauni is built per khata (holding). So check your state's official portal before acting.</p></div>`,
  });

  // ---- record-finder tool ----
  out.push({
    rel: "tools/record-finder/index.html",
    meta: {
      title: "जमीन का रिकॉर्ड कहाँ और कैसे देखें: मार्गदर्शक",
      description: "राज्य, अपना मकसद और आपके पास कौन-सा नंबर है, यह चुनें और पाएँ सही पोर्टल, रिकॉर्ड का स्थानीय नाम और अगला कदम। हर सुझाव का कारण भी दिखता है।",
      type: "tool", tool: true, status: "draft", reviewed_on, active: "tools",
      intent: "User knows their goal and state but not which record/portal/next step.",
      unique_value: "Deterministic, explainable rule engine v1 (state + goal + what you have → portal, local term, steps, why).",
      keywords: ["bhulekh", "land record kaise dekhe", "khatauni nikalna", "jamabandi nakal", "record finder", "रिकॉर्ड खोज", "kaha dekhe"],
      breadcrumbs: [{ name: "टूल्स", name_en: "Tools", path: "tools/" }, { name: "रिकॉर्ड-खोज मार्गदर्शक", name_en: "Record finder", path: "tools/record-finder/" }],
      sources: ["dilrmp", ...portalSources],
      scripts: ["assets/js/tools/record-finder-ui.js"],
      related: [{ path: "states/", label: "राज्य-वार पोर्टल", label_en: "State portals" }, { path: "guides/find-khasra-number/", label: "खसरा/गाटा नंबर कैसे पता करें", label_en: "How to find your khasra number" }],
    },
    body: `<h1>जमीन का रिकॉर्ड कहाँ और कैसे देखें <span class="lr-en">/ Where and how to see your land record</span></h1>
<p class="lr-lead" data-l="hi">तीन चीज़ें चुनें: राज्य, आपका मकसद और आपके पास क्या जानकारी है। हम बताएँगे कि आपके राज्य में इसे क्या कहते हैं, किस पोर्टल पर जाएँ और अगला कदम क्या हो, साथ में कारण भी। यह सरकारी निर्णय या कानूनी राय नहीं है।</p>
<p class="lr-lead" data-l="en">Choose three things: your state, your goal and what information you have. We show what it is called in your state, which portal to use and the next step, with the reason. This is not a government decision or legal opinion.</p>
<section class="lr-card" aria-labelledby="rf-h"><h2 id="rf-h" style="margin-top:0">मार्गदर्शक <span class="lr-en">/ Guide</span></h2>
<div class="lr-field"><label for="rf-state">1. राज्य <span class="lr-en">/ State</span></label><select class="lr-select" id="rf-state"><option value="">— चुनें / Choose —</option></select></div>
<div class="lr-field"><label for="rf-goal">2. आप क्या करना चाहते हैं? <span class="lr-en">/ What do you want to do?</span></label><select class="lr-select" id="rf-goal"></select></div>
<div class="lr-field"><label for="rf-have">3. आपके पास क्या है? <span class="lr-en">/ What do you have?</span></label><select class="lr-select" id="rf-have"></select></div>
<div id="rf-out" role="status" aria-live="polite"></div></section>
<div class="lr-prose" data-l="hi"><h2>यह कैसे काम करता है</h2><p>यह चैटबॉट नहीं, सीधे नियमों पर चलने वाला मार्गदर्शक है। आपका चुना राज्य हमारे डेटा से पोर्टल और स्थानीय नाम तय करता है, मकसद और आपके पास की जानकारी से सलाह का हिस्सा बनता है। हर परिणाम में नियम का नाम दिखता है ताकि आप जान सकें कि सुझाव क्यों आया। हम आपकी चुनी हुई जानकारी कहीं नहीं भेजते।</p></div>
<div class="lr-prose" data-l="en"><h2>How it works</h2><p>This is not a chatbot but a rule-based guide. Your state decides the portal and local name from our data; your goal and what you have decide the advice. Every result shows the rule name so you know why it was suggested. We don't send your choices anywhere.</p></div>`,
  });
  return out;
}
