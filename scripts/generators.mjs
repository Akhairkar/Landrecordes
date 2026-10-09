// Data-driven pages (states hub, 12 state pages, glossary tool, record-finder tool).
// Every fact comes from data/*.json with source ids (BUILD_RULES §A1). No page is created from a name swap alone:
// each state page renders state-specific facts, cautions and FAQs authored per state.
const CONF = {
  "official-doc": ["ok", "सरकारी दस्तावेज़ में इसका उल्लेख मिलता है; फिर भी खोलकर पुष्टि करें"],
  "multi-source": ["ok", "कई स्रोतों में यही पता मिलता है; खोलकर पुष्टि करें"],
  conflicting: ["", "स्रोतों में पता अलग-अलग मिलता है; नीचे दिए सभी पते जाँचें"],
  "single-source": ["", "एक ही स्रोत में यह पता मिला; खोलकर पुष्टि करें"],
  unconfirmed: ["", "आधिकारिक पता हम पक्का नहीं कर पाए; राज्य राजस्व विभाग की साइट से पुष्टि करें"],
};
const NEIGHBOURS = {
  "uttar-pradesh": ["uttarakhand", "bihar"], maharashtra: ["gujarat", "madhya-pradesh"], rajasthan: ["madhya-pradesh", "haryana"],
  "madhya-pradesh": ["rajasthan", "uttar-pradesh"], bihar: ["uttar-pradesh", "madhya-pradesh"], gujarat: ["maharashtra", "rajasthan"],
  haryana: ["punjab", "delhi"], punjab: ["haryana", "himachal-pradesh"], delhi: ["haryana", "uttar-pradesh"],
  uttarakhand: ["uttar-pradesh", "himachal-pradesh"], "himachal-pradesh": ["punjab", "uttarakhand"], "jammu-and-kashmir": ["punjab", "himachal-pradesh"],
};
const MAIN_RECORD_PAGE = { maharashtra: ["records/satbara-7-12/", "7/12 उतारा और 8-अ क्या हैं"], gujarat: ["records/satbara-7-12/", "7/12 उतारा और 8-अ क्या हैं"], haryana: ["records/jamabandi-fard/", "जमाबंदी और फर्द क्या हैं"], punjab: ["records/jamabandi-fard/", "जमाबंदी और फर्द क्या हैं"], rajasthan: ["records/jamabandi-fard/", "जमाबंदी और फर्द क्या हैं"], "himachal-pradesh": ["records/jamabandi-fard/", "जमाबंदी और फर्द क्या हैं"], "jammu-and-kashmir": ["records/jamabandi-fard/", "जमाबंदी और फर्द क्या हैं"], bihar: ["records/jamabandi-fard/", "जमाबंदी और फर्द क्या हैं"] };

export function generate({ readJson, esc }) {
  const { states, reviewed_on } = readJson("data/states.json");
  const byId = Object.fromEntries(states.map((s) => [s.id, s]));
  const out = [];
  const trim = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");
  const a = (s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>`;

  // ---- states hub ----
  const rows = states
    .map((s) => `<tr><th scope="row"><a href="states/${s.id}/">${esc(s.name_hi)}</a> <span class="lr-en">${esc(s.name_en)}</span></th><td>${esc(s.portal_name)}</td><td>${esc(s.record_hi)}</td><td>${esc(s.mutation_hi)}</td><td><span class="lr-badge ${CONF[s.confidence][0]}">${esc({ "official-doc": "सरकारी दस्तावेज़ में", "multi-source": "कई स्रोत", conflicting: "पते अलग-अलग", "single-source": "एक स्रोत", unconfirmed: "पुष्टि जारी" }[s.confidence])}</span></td></tr>`)
    .join("");
  out.push({
    rel: "states/index.html",
    meta: {
      title: "राज्य-वार भूमि रिकॉर्ड पोर्टल और स्थानीय शब्द | LandRecord",
      description: "12 राज्यों में जमीन का रिकॉर्ड देखने के पोर्टल, वहाँ के स्थानीय शब्द (खतौनी, जमाबंदी, 7/12) और नाम बदलवाने की प्रक्रिया का नाम, एक तालिका में।",
      type: "hub", status: "draft", reviewed_on, active: "states",
      intent: "Pick the state to see its land-record portal, local terms and mutation term.",
      unique_value: "Side-by-side table of portal, record names, mutation term and address-confidence per state; each row links to a state page.",
      keywords: ["state", "राज्य", "bhulekh", "भूलेख", "portal", "पोर्टल", "land record"],
      breadcrumbs: [{ name: "राज्य", path: "states/" }],
      sources: ["dilrmp"],
      related: [{ path: "tools/record-finder/", label: "रिकॉर्ड-खोज मार्गदर्शक" }, { path: "tools/land-terms/", label: "शब्दकोश: खतौनी = जमाबंदी = 7/12" }],
    },
    body: `<h1>राज्य-वार भूमि रिकॉर्ड पोर्टल <span class="lr-en">/ Land records by state</span></h1>
<p class="lr-lead">हर राज्य में जमीन के रिकॉर्ड के नाम, पोर्टल और प्रक्रिया अलग हैं। अपना राज्य चुनें और देखें कि वहाँ रिकॉर्ड को क्या कहते हैं, कहाँ देखते हैं और किन बातों का ध्यान रखें। अभी 12 राज्य जोड़े गए हैं; बाकी राज्य सत्यापित जानकारी मिलने पर ही जोड़े जाएँगे।</p>
<div class="lr-table-wrap"><table class="lr-table" style="min-width:680px"><caption class="lr-en" style="text-align:left;padding:8px 0">States covered so far</caption><thead><tr><th scope="col">राज्य</th><th scope="col">पोर्टल</th><th scope="col">मुख्य रिकॉर्ड</th><th scope="col">म्यूटेशन को कहते हैं</th><th scope="col">पोर्टल का पता</th></tr></thead><tbody>${rows}</tbody></table></div>
<div class="lr-prose"><h2>"पोर्टल का पता" वाला स्तंभ क्या बताता है?</h2>
<p>हर राज्य के पोर्टल का पता हमने अलग-अलग स्रोतों से मिलाया है। जहाँ स्रोत आपस में सहमत नहीं थे, वहाँ हमने सभी पते दिखाए और उसे साफ लिखा है। जहाँ आधिकारिक पता पक्का नहीं हो पाया, वहाँ "पुष्टि जारी" लिखा है। यह पुष्टि आप राज्य के राजस्व विभाग की वेबसाइट से कर सकते हैं।</p>
<p>राष्ट्रीय स्तर पर राज्यों के पोर्टल की सूची भूमि संसाधन विभाग के DILRMP कार्यक्रम के पास है, जो हमारा मार्गदर्शक संदर्भ है, पर वह यह साबित नहीं करता कि हर राज्य में एक जैसी सेवाएँ हैं।</p></div>`,
  });

  // ---- state pages ----
  for (const s of states) {
    const [cls, confText] = CONF[s.confidence];
    const alt = s.alt_urls.length ? `<p>अन्य स्रोतों में दिखने वाले पते: ${s.alt_urls.map((u) => a({ url: u })).join(", ")}</p>` : "";
    const recLink = MAIN_RECORD_PAGE[s.id];
    const nb = NEIGHBOURS[s.id].map((id) => byId[id]);
    const descFull = `${s.name_hi} में ${s.record_hi} देखने का पोर्टल (${s.portal_name}), खोज के चरण, सावधानियाँ और स्थानीय शब्दों का मतलब, सरल हिंदी में।`;
    const descAlt = `${s.name_hi} में जमीन का रिकॉर्ड देखने का पोर्टल, खोज के चरण, सावधानियाँ और स्थानीय शब्दों का मतलब, सरल हिंदी में।`;
    const descAlt2 = `${s.name_hi} में जमीन का रिकॉर्ड ऑनलाइन देखने का पोर्टल, खोज के चरण, सावधानियाँ और स्थानीय शब्दों का मतलब, सरल हिंदी में।`;
    const description = [descFull, descAlt2, descAlt].find((d) => d.length >= 110 && d.length <= 160) || descAlt2;
    out.push({
      rel: `states/${s.id}/index.html`,
      meta: {
        title: trim(`${s.name_hi} में जमीन का रिकॉर्ड ऑनलाइन कैसे देखें`, 60),
        description,
        type: "state", status: "draft", reviewed_on, active: "states",
        intent: `Find and read ${s.name_en} land records online and understand the local terms.`,
        unique_value: `${s.name_en}-specific portal (${s.portal_name}), local record names (${s.record_hi}), mutation term (${s.mutation_hi}), unit habits and cautions, with address confidence shown.`,
        keywords: [s.name_en, s.name_hi, "bhulekh", "भूलेख", s.portal_name, "khatauni", "jamabandi", "land record"],
        breadcrumbs: [{ name: "राज्य", path: "states/" }, { name: s.name_hi, path: `states/${s.id}/` }],
        sources: s.sources,
        faq: s.faq,
        related: [
          { path: "states/", label: "सभी राज्यों की तालिका" },
          { path: "tools/record-finder/", label: "रिकॉर्ड-खोज मार्गदर्शक" },
          ...(recLink ? [{ path: recLink[0], label: recLink[1] }] : [{ path: "records/ror/", label: "अधिकार-अभिलेख (RoR) क्या है" }]),
          { path: "records/mutation/", label: "म्यूटेशन के अलग-अलग नाम" },
          ...nb.map((n) => ({ path: `states/${n.id}/`, label: `${n.name_hi} के भूमि रिकॉर्ड` })),
        ],
      },
      body: `<h1>${esc(s.name_hi)} में जमीन का रिकॉर्ड ऑनलाइन कैसे देखें <span class="lr-en">/ ${esc(s.name_en)} land records</span></h1>
<p class="lr-lead">${esc(s.intro_hi)}</p>
<section class="lr-card" aria-labelledby="portal-h"><h2 id="portal-h" style="margin-top:0">आधिकारिक पोर्टल <span class="lr-en">/ Official portal</span></h2>
<p><strong>${esc(s.portal_name)}</strong></p>
<p><a class="lr-btn" style="display:inline-flex;align-items:center;text-decoration:none" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">पोर्टल खोलें (नई विंडो)</a></p>
<p>पता: ${a(s)} <span class="lr-badge ${cls}">${esc(confText)}</span></p>${alt}
<p class="lr-en">Always confirm the address on the state revenue department's official site; LandRecord is not the portal.</p></section>
<div class="lr-prose">
<h2>यहाँ रिकॉर्ड को क्या कहते हैं <span class="lr-en">/ Local terms</span></h2>
<ul><li><strong>मुख्य रिकॉर्ड:</strong> ${esc(s.record_hi)}</li><li><strong>म्यूटेशन (नाम परिवर्तन):</strong> ${esc(s.mutation_hi)}</li><li><strong>क्षेत्रफल की इकाइयाँ:</strong> ${esc(s.units_hi)}</li></ul>
<h2>रिकॉर्ड खोजने का सामान्य क्रम <span class="lr-en">/ Typical steps</span></h2>
<p>स्रोतों में बताए गए चरण नीचे हैं। पोर्टल के मेनू बदलते रहते हैं, इसलिए स्क्रीन पर जो दिखे उसे प्राथमिकता दें।</p>
<ol>${s.steps_hi.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
<h2>${esc(s.name_hi)} में ध्यान रखने की बातें <span class="lr-en">/ Cautions</span></h2>
<ul>${s.watch_hi.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
<h2>नक्शा और स्थान का संदर्भ <span class="lr-en">/ Map context</span></h2>
<p>भू-नक्शे की उपलब्धता राज्य के पोर्टल पर देखें। LandRecord कोई नक्शा या सीमा नहीं दिखाता और तीसरे पक्ष के नक्शों को आधिकारिक भू-नक्शा नहीं मानना चाहिए।</p>
<h2>उपयोगी टूल <span class="lr-en">/ Tools</span></h2>
<ul><li><a href="tools/record-finder/">रिकॉर्ड-खोज मार्गदर्शक</a>: अपने पास की जानकारी के हिसाब से अगला कदम</li><li><a href="tools/land-unit-converter/">जमीन नापने का कैलकुलेटर</a> और <a href="tools/plot-area-calculator/">खेत का क्षेत्रफल</a></li><li><a href="tools/land-terms/">शब्दकोश</a>: ${esc(s.name_hi)} और दूसरे राज्यों के शब्द साथ-साथ</li></ul>
</div>`,
    });
  }

  // ---- glossary tool ----
  out.push({
    rel: "tools/land-terms/index.html",
    meta: {
      title: "भूमि रिकॉर्ड शब्दकोश: खतौनी, जमाबंदी, 7/12 का मतलब",
      description: "खतौनी, जमाबंदी, 7/12, खसरा, खेवट, फर्द और इंतकाल जैसे शब्दों का मतलब, और 12 राज्यों में किस काम के लिए कौन-सा नाम चलता है, खोजकर देखें।",
      type: "tool", tool: true, status: "draft", reviewed_on, active: "tools",
      intent: "Translate a land-record term into what it is called in another state.",
      unique_value: "Searchable state-by-state term mapping drawn from the sourced portal data.",
      keywords: ["khatauni", "jamabandi", "7/12", "khasra", "khewat", "fard", "intkal", "dakhil kharij", "namantaran", "ferfar", "ror", "शब्दकोश", "glossary"],
      breadcrumbs: [{ name: "Tools", path: "tools/" }, { name: "शब्दकोश", path: "tools/land-terms/" }],
      sources: ["dilrmp", ...new Set(states.flatMap((s) => s.sources).filter((x) => x.startsWith("portal-")))],
      scripts: ["assets/js/tools/land-terms-ui.js"],
      related: [{ path: "states/", label: "राज्य-वार पोर्टल" }, { path: "records/ror/", label: "अधिकार-अभिलेख (RoR) क्या है" }],
    },
    body: `<h1>भूमि रिकॉर्ड शब्दकोश <span class="lr-en">/ Land-record terms</span></h1>
<p class="lr-lead">एक ही चीज़ के लिए हर राज्य में अलग नाम चलता है। कोई शब्द खोजें (जैसे &quot;खतौनी&quot; या &quot;इंतकाल&quot;) और देखें कि 12 राज्यों में उसे क्या कहते हैं।</p>
<section class="lr-card" aria-labelledby="tt-h"><h2 id="tt-h" style="margin-top:0">शब्द खोजें <span class="lr-en">/ Search</span></h2>
<div class="lr-field"><label for="tt-q">शब्द या राज्य <span class="lr-en">/ Term or state</span></label><input class="lr-input" id="tt-q" type="search" autocomplete="off" placeholder="जैसे: खतौनी, 7/12, इंतकाल, पंजाब"></div>
<p id="tt-status" role="status" aria-live="polite" class="lr-en"></p><div id="tt-out"></div></section>
<div class="lr-prose"><h2>इस शब्दकोश की सीमाएँ</h2><p>यहाँ दिए नाम पोर्टल और स्रोतों में मिले आम प्रयोग हैं। गाँव या जिले की स्थानीय बोली और पुराने रिकॉर्ड में कुछ और नाम भी चल सकते हैं। दो राज्यों के शब्द अर्थ में पूरी तरह बराबर नहीं होते, जैसे महाराष्ट्र का 7/12 एक सर्वे नंबर का रिकॉर्ड है जबकि कई राज्यों की जमाबंदी/खतौनी खाते (जोत) के आधार पर बनती है। इसलिए किसी भी काम से पहले अपने राज्य का आधिकारिक पोर्टल देखें।</p></div>`,
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
      breadcrumbs: [{ name: "Tools", path: "tools/" }, { name: "रिकॉर्ड-खोज मार्गदर्शक", path: "tools/record-finder/" }],
      sources: ["dilrmp", ...new Set(states.flatMap((s) => s.sources).filter((x) => x.startsWith("portal-")))],
      scripts: ["assets/js/tools/record-finder-ui.js"],
      related: [{ path: "states/", label: "राज्य-वार पोर्टल" }, { path: "guides/find-khasra-number/", label: "खसरा/गाटा नंबर कैसे पता करें" }],
    },
    body: `<h1>जमीन का रिकॉर्ड कहाँ और कैसे देखें <span class="lr-en">/ Record finder</span></h1>
<p class="lr-lead">तीन चीज़ें चुनें: राज्य, आपका मकसद और आपके पास क्या जानकारी है। हम बताएँगे कि आपके राज्य में इसे क्या कहते हैं, किस पोर्टल पर जाएँ और अगला कदम क्या हो, साथ में कारण भी। यह सरकारी निर्णय या कानूनी राय नहीं है।</p>
<section class="lr-card" aria-labelledby="rf-h"><h2 id="rf-h" style="margin-top:0">मार्गदर्शक <span class="lr-en">/ Guide</span></h2>
<div class="lr-field"><label for="rf-state">1. राज्य <span class="lr-en">/ State</span></label><select class="lr-select" id="rf-state"><option value="">— चुनें —</option></select></div>
<div class="lr-field"><label for="rf-goal">2. आप क्या करना चाहते हैं? <span class="lr-en">/ Goal</span></label><select class="lr-select" id="rf-goal"></select></div>
<div class="lr-field"><label for="rf-have">3. आपके पास क्या है? <span class="lr-en">/ What you have</span></label><select class="lr-select" id="rf-have"></select></div>
<div id="rf-out" role="status" aria-live="polite"></div></section>
<div class="lr-prose"><h2>यह कैसे काम करता है</h2><p>यह चैटबॉट नहीं, सीधे नियमों पर चलने वाला मार्गदर्शक है। आपका चुना राज्य हमारे डेटा से पोर्टल और स्थानीय नाम तय करता है, मकसद और आपके पास की जानकारी से सलाह का हिस्सा बनता है। हर परिणाम में नियम का नाम दिखता है ताकि आप जान सकें कि सुझाव क्यों आया। हम आपकी चुनी हुई जानकारी कहीं नहीं भेजते।</p></div>`,
  });
  return out;
}
