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
    const a = el("a", L(hi, en), className); a.href = href; parent.append(a); return a;
  }
  function miniCard(parent, icon, title, description, className = "lr-finder-mini-card") {
    const node = el("article", null, className);
    node.append(el("span", icon, "lr-finder-mini-icon"));
    node.append(el("h4", title));
    if (description) node.append(el("p", description));
    parent.append(node); return node;
  }
  function render() {
    out.textContent = "";
    const s = states.find((x) => x.id === st.value), g = goal.value, h = have.value;
    if (!s || !g || !h) {
      const empty = el("div", null, "lr-finder-empty");
      empty.append(el("span", "⌕", "lr-finder-empty-icon"));
      empty.append(el("strong", L("तीन विकल्प चुनें — आपका रास्ता तैयार होगा", "Choose three options — your route will appear")));
      const steps = el("div", null, "lr-finder-empty-steps");
      [["01","राज्य","State"],["02","काम","Task"],["03","उपलब्ध जानकारी","Details"]].forEach(([n,hi,en]) => {
        const item=el("span",null,"lr-finder-empty-step"); item.append(el("b",n)); item.append(el("strong",L(hi,en))); steps.append(item);
      });
      empty.append(steps); out.append(empty); return;
    }
    const goalItem = rules.goals.find((x) => x.id === g), haveItem = rules.haves.find((x) => x.id === h);
    const methods = Array.isArray(s.search_methods) ? s.search_methods.filter((m) => METHODS[m]) : [];
    const usable = (HAVE_METHODS[h] || []).filter((m) => methods.includes(m));
    const recordName = g === "mutation" ? L(s.mutation_hi, s.mutation_en) : L(s.record_hi, s.record_en);

    const selection = el("div", null, "lr-finder-selection");
    const selectionTitle = el("div", null, "lr-finder-selection-title");
    selectionTitle.append(el("span","✓","lr-finder-selection-check"),el("strong",L("आपके चयन के अनुसार","YOUR MATCH")));
    selection.append(selectionTitle);
    const selectionGrid = el("div",null,"lr-finder-selection-grid");
    [["राज्य","STATE",L(s.name_hi,s.name_en),"⌖"],["आपका काम","YOUR TASK",L(goalItem.label_hi,goalItem.label_en),"▤"],["आपके पास","YOU HAVE",L(haveItem.label_hi,haveItem.label_en),"◉"]].forEach(([hi,en,value,icon])=>{
      const item=el("div",null,"lr-finder-selection-item"); item.append(el("span",icon,"lr-finder-selection-icon"));
      const copy=el("div",null); copy.append(el("small",L(hi,en)),el("strong",value)); item.append(copy); selectionGrid.append(item);
    });
    selection.append(selectionGrid); out.append(selection);

    const spotlight=el("section",null,"lr-finder-record-spotlight");
    const spotlightCopy=el("div",null,"lr-finder-record-spotlight-copy");
    spotlightCopy.append(el("span",L("आपके राज्य में रिकॉर्ड का नाम","LOCAL RECORD NAME"),"lr-eyebrow"));
    spotlightCopy.append(el("h2",recordName));
    spotlightCopy.append(el("p",L("आपके चुने हुए काम के लिए यही स्थानीय रिकॉर्ड / प्रक्रिया देखनी है।","This is the local record or process relevant to your selected task.")));
    spotlight.append(spotlightCopy,el("div","LR","lr-finder-record-mark")); out.append(spotlight);

    const infoGrid=el("div",null,"lr-finder-visual-grid");
    const methodCard=el("section",null,"lr-finder-visual-card lr-finder-method-card");
    const methodHead=el("div",null,"lr-finder-visual-card-head");
    methodHead.append(el("span","01","lr-finder-visual-number"));
    const mh=el("div",null); mh.append(el("h3",L("किस जानकारी से खोजें?","HOW CAN YOU SEARCH?")),el("p",L("राज्य के पोर्टल पर उपलब्ध खोज विकल्प","Search options listed for this state")));
    methodHead.append(mh); methodCard.append(methodHead);
    if(usable.length){
      const methodsGrid=el("div",null,"lr-finder-method-grid");
      usable.forEach((m,i)=>miniCard(methodsGrid,["⌕","▦","⌖","◈"][i%4],L(...METHODS[m]),L("आपके चुने विवरण के अनुसार","Matches the details you selected"),"lr-finder-method-tile"));
      methodCard.append(methodsGrid);
    } else {
      const notice=el("div",null,"lr-finder-notice-tile"); notice.append(el("span","!","lr-finder-notice-mark"));
      const copy=el("div",null); copy.append(el("strong",L("सीधे नाम से खोज उपलब्ध होने की पुष्टि नहीं है","Direct name search is not confirmed")));
      copy.append(el("p",L("पहले पुराने कागज़ से खसरा / खाता नंबर ढूँढें।","First find the khasra or khata number from an older document.")));
      notice.append(copy); methodCard.append(notice);
      const links=el("div",null,"lr-finder-action-row");
      addInternalLink(links,"guides/find-khasra-number/","खसरा नंबर कैसे पता करें","How to find a khasra number","lr-btn secondary");
      addInternalLink(links,"guides/land-record-by-name/","नाम से रिकॉर्ड खोजें","Search by owner's name","lr-btn secondary");
      methodCard.append(links);
    }
    if(methods.length>usable.length){
      const details=el("details",null,"lr-finder-more-methods");
      details.append(el("summary",L("राज्य के सभी उपलब्ध खोज विकल्प","All search options for this state")));
      const all=el("div",null,"lr-finder-method-chips"); methods.forEach(m=>all.append(el("span",L(...METHODS[m]))));
      details.append(all); methodCard.append(details);
    }
    infoGrid.append(methodCard);

    const prepCard=el("section",null,"lr-finder-visual-card lr-finder-prep-card");
    const prepHead=el("div",null,"lr-finder-visual-card-head"); prepHead.append(el("span","02","lr-finder-visual-number"));
    const ph=el("div",null); ph.append(el("h3",L("शुरू करने से पहले","BEFORE YOU START")),el("p",L("ये बातें तैयार रखें","Keep these details handy")));
    prepHead.append(ph); prepCard.append(prepHead);
    const prepGrid=el("div",null,"lr-finder-prep-list");
    [["⌖","गाँव / मौजा","Village / revenue area"],["▤","खसरा या खाता नंबर","Khasra or khata number"],["✓","नाम और वर्तनी मिलाएँ","Check the name spelling"]].forEach(([icon,hi,en])=>miniCard(prepGrid,icon,L(hi,en),"","lr-finder-prep-item"));
    prepCard.append(prepGrid);
    const personalTip=el("div",null,"lr-finder-personal-tip"); personalTip.append(el("span","i","lr-finder-tip-mark"),el("p",L(haveItem.advice_hi,haveItem.advice_en)));
    prepCard.append(personalTip); infoGrid.append(prepCard); out.append(infoGrid);

    const next=el("section",null,"lr-finder-process");
    const processHead=el("div",null,"lr-finder-process-head"), processNo=el("div",null);
    processNo.append(el("span","03","lr-finder-visual-number"));
    const processTitle=el("div",null); processTitle.append(el("h3",L("अब ये कदम अपनाएँ","FOLLOW THESE STEPS")),el("p",L("राज्य पोर्टल पर रिकॉर्ड तक पहुँचने का सामान्य क्रम","The usual route to your record on the state portal")));
    processHead.append(processNo,processTitle); next.append(processHead);
    const steps=L(s.steps_hi,s.steps_en);
    if((g==="view"||g==="certified")&&Array.isArray(steps)&&steps.length){
      const stepGrid=el("div",null,"lr-finder-step-grid");
      steps.forEach((step,i)=>{
        const item=el("article",null,"lr-finder-step-card");
        item.append(el("span",String(i+1).padStart(2,"0"),"lr-finder-step-index"));
        item.append(el("span",["⌖","▤","⌕","↓"][i%4],"lr-finder-step-icon"));
        item.append(el("p",step)); stepGrid.append(item);
      });
      next.append(stepGrid);
    } else {
      const action=ACTIONS[g]?.(s), taskGrid=el("div",null,"lr-finder-task-grid");
      const task=miniCard(taskGrid,"→",L(goalItem.label_hi,goalItem.label_en),L(rules.goal_advice[g],rules.goal_advice_en[g]),"lr-finder-task-tile");
      if(action) addInternalLink(task,action[0],action[1],action[2]);
      next.append(taskGrid);
    }
    const goalDetails=el("details",null,"lr-finder-guidance-details");
    goalDetails.append(el("summary",L("इस काम की जरूरी जानकारी और सावधानी","Important guidance and cautions for this task")));
    const goalAdvice=el("div",null,"lr-finder-guidance-content"); goalAdvice.append(el("p",L(rules.goal_advice[g],rules.goal_advice_en[g])));
    goalDetails.append(goalAdvice); next.append(goalDetails); out.append(next);

    const cautions=L(s.watch_hi,s.watch_en);
    if(Array.isArray(cautions)&&cautions.length){
      const cautionSection=el("details",null,"lr-finder-cautions");
      cautionSection.append(el("summary",L("ध्यान रखने वाली बातें","Things to keep in mind")));
      const cautionGrid=el("div",null,"lr-finder-caution-grid");
      cautions.forEach(item=>{
        const tile=el("div",null,"lr-finder-caution-tile"); tile.append(el("span","!","lr-finder-caution-mark"),el("p",item)); cautionGrid.append(tile);
      });
      cautionSection.append(cautionGrid); out.append(cautionSection);
    }

    const portalCard=el("section",null,"lr-finder-portal-card");
    const portalCopy=el("div",null,"lr-finder-portal-copy");
    portalCopy.append(el("p",L("आखिरी चरण","FINAL STEP"),"lr-eyebrow"),el("h3",L("अब सरकारी पोर्टल पर जाएँ","Continue to the government portal")));
    portalCopy.append(el("p",L("रिकॉर्ड का नाम और खोजने के तरीके समझने के बाद ही आगे बढ़ें।","Continue after reviewing the record name and search method.")));
    portalCopy.append(el("p",L(...(CONF[s.confidence]||CONF.unconfirmed)),"lr-finder-portal-confidence")); portalCard.append(portalCopy);
    const portalAction=el("div",null,"lr-finder-portal-action");
    if(s.url){
      const a=externalLink(s.url,L("सरकारी पोर्टल खोलें","Open government portal"));
      if(a){a.className="lr-btn lr-finder-portal-button";portalAction.append(a,el("small",new URL(s.url).host));}
    }else portalAction.append(el("p",L("इस राज्य का सार्वजनिक ऑनलाइन पोर्टल लिंक उपलब्ध/पुष्ट नहीं है।","A public online portal link is unavailable or unconfirmed.")));
    portalCard.append(portalAction);
    if(Array.isArray(s.alt_urls)&&s.alt_urls.length){
      const alt=el("details",null,"lr-finder-alt-links");alt.append(el("summary",L("अन्य स्रोतों के पते देखें","View alternate source addresses")));
      s.alt_urls.forEach(url=>{const a=externalLink(url,url.replace(/^https?:\/\//,""));if(a)alt.append(a);});
      portalCard.append(alt);
    }
    out.append(portalCard);
    history.replaceState(null,"",location.pathname+"?"+new URLSearchParams({s:st.value,g,h}).toString());
  }
  for(const e of [st,goal,have])e.addEventListener("input",render);
  const q=new URLSearchParams(location.search);
  if(q.get("s")&&states.some(x=>x.id===q.get("s")))st.value=q.get("s");
  if(q.get("g")&&rules.goals.some(x=>x.id===q.get("g")))goal.value=q.get("g");
  if(q.get("h")&&rules.haves.some(x=>x.id===q.get("h")))have.value=q.get("h");
  render();
}
init().catch(() => { $("rf-out").textContent = L("मार्गदर्शक लोड नहीं हो सका।", "The guide failed to load."); });
