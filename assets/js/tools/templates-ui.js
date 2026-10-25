// Land application drafts — built entirely in the browser. Nothing is saved or put in the URL (personal data).
import { $, L } from "./shared-ui.js";

const blank = (v, w = "........") => (v && v.trim() ? v.trim() : w);
const TYPES = {
  mutation: {
    label: ["नामांतरण/दाखिल-खारिज (नाम दर्ज कराना)", "Mutation (record my name)"],
    to: ["तहसीलदार", "The Tehsildar"],
    hint: ["जैसे: रजिस्ट्री की तारीख/नंबर, किससे खरीदा, या किसकी मृत्यु के बाद उत्तराधिकार।", "e.g. deed date/number, seller's name, or whose death led to inheritance."],
    subject: ["उपरोक्त भूमि का नामांतरण (म्यूटेशन) करने हेतु आवेदन", "Application for mutation of the land described above"],
    body: ["मैं विनम्र निवेदन करता/करती हूँ कि उपरोक्त भूमि मेरे नाम पर आ चुकी है। कृपया राजस्व अभिलेख में नियमानुसार मेरा नाम दर्ज (नामांतरण/दाखिल-खारिज) करने की कृपा करें।",
      "I respectfully submit that the land described above has come to me. Kindly enter my name in the revenue record (mutation) as per rules."],
    docs: [["रजिस्ट्री/उत्तराधिकार प्रमाण की प्रति", "पहचान-पत्र की प्रति", "वर्तमान अभिलेख (खतौनी/जमाबंदी/7-12) की प्रति"], ["Copy of the deed/succession proof", "Copy of ID", "Copy of the current record (khatauni/jamabandi/7-12)"]],
  },
  correction: {
    label: ["रिकॉर्ड में गलती सुधार", "Correction in the record"],
    to: ["तहसीलदार", "The Tehsildar"],
    hint: ["जैसे: रिकॉर्ड में क्या गलत लिखा है और सही क्या है।", "e.g. what is wrong in the record and what is correct."],
    subject: ["भूमि अभिलेख में त्रुटि सुधार हेतु आवेदन", "Application for correction of an error in the land record"],
    body: ["उपरोक्त भूमि के अभिलेख में नीचे बताई गई त्रुटि है। संलग्न प्रमाणों के आधार पर कृपया अभिलेख में आवश्यक सुधार करने की कृपा करें।",
      "The record of the land described above contains the error stated below. Kindly correct the record on the basis of the enclosed proof."],
    docs: [["गलती वाले अभिलेख की प्रति", "सही जानकारी का प्रमाण (रजिस्ट्री/पहचान-पत्र/पुराना अभिलेख)"], ["Copy of the record with the error", "Proof of the correct details (deed/ID/old record)"]],
  },
  copy: {
    label: ["प्रमाणित नकल (प्रति) माँगना", "Request a certified copy"],
    to: ["तहसीलदार / अभिलेख अधिकारी", "The Tehsildar / Record Officer"],
    hint: ["जैसे: कौन-सा रिकॉर्ड, किस वर्ष का, और किस काम के लिए (बैंक/कोर्ट)।", "e.g. which record, which year, and for what purpose (bank/court)."],
    subject: ["भूमि अभिलेख की प्रमाणित प्रति हेतु आवेदन", "Application for a certified copy of the land record"],
    body: ["मुझे उपरोक्त भूमि के अभिलेख की प्रमाणित प्रति की आवश्यकता है। कृपया निर्धारित शुल्क लेकर प्रमाणित प्रति उपलब्ध कराने की कृपा करें।",
      "I require a certified copy of the record of the land described above. Kindly provide the certified copy on payment of the prescribed fee."],
    docs: [["पहचान-पत्र की प्रति", "शुल्क की रसीद (यदि लागू)"], ["Copy of ID", "Fee receipt (if applicable)"]],
  },
  demarcation: {
    label: ["सीमांकन/पैमाइश (सीमा तय कराना)", "Demarcation (fix the boundary)"],
    to: ["तहसीलदार / उप-जिलाधिकारी", "The Tehsildar / Sub-Divisional Officer"],
    hint: ["जैसे: किन खसरों के बीच सीमा पर संदेह है और पड़ोसी खातेदारों के नाम।", "e.g. which plots' boundary is unclear and the neighbouring holders' names."],
    subject: ["भूमि के सीमांकन/पैमाइश हेतु आवेदन", "Application for demarcation of land"],
    body: ["उपरोक्त भूमि की सीमा को लेकर स्पष्टता नहीं है। कृपया नियमानुसार निर्धारित शुल्क लेकर मौके पर सीमांकन/पैमाइश कराने की कृपा करें और पड़ोसी खातेदारों को सूचना दी जाए।",
      "The boundary of the land described above is unclear. Kindly arrange demarcation on the spot as per rules on payment of the prescribed fee, with notice to the neighbouring holders."],
    docs: [["वर्तमान अभिलेख की प्रति", "नक्शे की प्रति (यदि हो)", "पड़ोसी खातेदारों के नाम-पते"], ["Copy of the current record", "Copy of the map (if available)", "Names and addresses of neighbouring holders"]],
  },
  encroachment: {
    label: ["अवैध कब्ज़े की शिकायत", "Complaint about encroachment"],
    to: ["तहसीलदार / थाना प्रभारी", "The Tehsildar / Station House Officer"],
    hint: ["जैसे: कब्ज़ा कब और कैसे हुआ, किसने किया (यदि पता हो), और आपके पास कौन-से सबूत हैं।", "e.g. when and how the occupation happened, by whom (if known), and what evidence you have."],
    subject: ["निजी भूमि पर अवैध कब्ज़े के संबंध में शिकायत", "Complaint regarding encroachment on private land"],
    body: ["उपरोक्त भूमि मेरे नाम पर दर्ज है और मेरे वैध कब्ज़े में रही है। नीचे बताए अनुसार उस पर अवैध कब्ज़ा किया गया है। कृपया मामले की जाँच कर नियमानुसार उचित कार्रवाई करने की कृपा करें।",
      "The land described above is recorded in my name and has been in my lawful possession. It has been encroached upon as stated below. Kindly inquire and take appropriate action as per rules."],
    docs: [["रजिस्ट्री/अभिलेख की प्रति", "घटना की तारीख सहित फोटो/वीडियो", "पहले की शिकायतों की प्रतियाँ (यदि हों)"], ["Copy of the deed/record", "Dated photos/videos of the incident", "Copies of earlier complaints (if any)"]],
  },
};
const F = ["to", "office", "name", "rel", "addr", "phone", "village", "tehsil", "district", "khasra", "khata", "area", "details"];

function letter(t, v, lang) {
  const i = lang === "en" ? 1 : 0;
  const today = new Date().toLocaleDateString(lang === "en" ? "en-IN" : "hi-IN");
  const land = lang === "en"
    ? `Land: village ${blank(v.village)}, tehsil ${blank(v.tehsil)}, district ${blank(v.district)}; plot/survey no. ${blank(v.khasra)}; khata no. ${blank(v.khata)}; area ${blank(v.area)}.`
    : `भूमि का विवरण: गाँव ${blank(v.village)}, तहसील ${blank(v.tehsil)}, जिला ${blank(v.district)}; खसरा/सर्वे नंबर ${blank(v.khasra)}; खाता नंबर ${blank(v.khata)}; रकबा ${blank(v.area)}।`;
  const lines = [
    lang === "en" ? "To," : "सेवा में,",
    blank(v.to, t.to[i]),
    blank(v.office, lang === "en" ? "Office ........" : "कार्यालय ........"),
    "",
    `${lang === "en" ? "Subject" : "विषय"}: ${t.subject[i]}`,
    "",
    lang === "en" ? "Sir/Madam," : "महोदय/महोदया,",
    "",
    lang === "en"
      ? `I, ${blank(v.name)}, son/daughter/wife of ${blank(v.rel)}, resident of ${blank(v.addr)}, submit as follows:`
      : `मैं, ${blank(v.name)}, पुत्र/पुत्री/पत्नी ${blank(v.rel)}, निवासी ${blank(v.addr)}, निवेदन करता/करती हूँ कि:`,
    "",
    land,
    "",
    t.body[i],
    "",
    `${lang === "en" ? "Details" : "विवरण"}: ${blank(v.details, "........................................")}`,
    "",
    lang === "en" ? "Enclosures:" : "संलग्नक:",
    ...t.docs[i].map((d, n) => `${n + 1}. ${d}`),
    "",
    lang === "en" ? "Yours faithfully," : "भवदीय/भवदीया,",
    "",
    `${lang === "en" ? "Signature" : "हस्ताक्षर"}: ..................`,
    `${lang === "en" ? "Name" : "नाम"}: ${blank(v.name)}`,
    ...(v.phone && v.phone.trim() ? [`${lang === "en" ? "Mobile" : "मोबाइल"}: ${v.phone.trim()}`] : []),
    `${lang === "en" ? "Date" : "दिनांक"}: ${today}`,
  ];
  return lines.join("\n");
}

function init() {
  const type = $("ap-type"), lang = $("ap-lang"), out = $("ap-out"), status = $("ap-status");
  for (const [id, t] of Object.entries(TYPES)) type.append(new Option(L(...t.label), id));
  lang.value = document.documentElement.lang === "en" ? "en" : "hi";
  let lastTo = "";
  const render = () => {
    const t = TYPES[type.value];
    const i = lang.value === "en" ? 1 : 0;
    const toEl = $("ap-to");
    if (!toEl.value.trim() || toEl.value === lastTo) { toEl.value = t.to[i]; lastTo = t.to[i]; }
    $("ap-hint").textContent = L(...t.hint);
    const v = Object.fromEntries(F.map((k) => [k, $(`ap-${k}`).value]));
    out.textContent = letter(t, v, lang.value);
  };
  type.addEventListener("input", render);
  lang.addEventListener("input", render);
  for (const k of F) $(`ap-${k}`).addEventListener("input", render);
  $("ap-copy").addEventListener("click", () => navigator.clipboard.writeText(out.textContent).then(
    () => { status.textContent = L("ड्राफ्ट कॉपी हो गया।", "Draft copied."); },
    () => { status.textContent = L("कॉपी नहीं हो सका; ड्राफ्ट चुनकर खुद कॉपी करें।", "Couldn't copy; select the draft and copy it manually."); }));
  $("ap-print").addEventListener("click", () => { document.body.classList.add("lr-printing"); window.print(); document.body.classList.remove("lr-printing"); });
  render();
}
init();
