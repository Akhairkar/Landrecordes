/* Explainable, client-side record-finder. No personal data is collected or transmitted. */
(() => {
  "use strict";
  const form = document.getElementById("rf-form");
  if (!form) return;
  const stateSelect = document.getElementById("rf-state");
  const goalSelect = document.getElementById("rf-goal");
  const haveSelect = document.getElementById("rf-have");
  const status = document.getElementById("rf-status");
  const result = document.getElementById("rf-result");
  const base = document.querySelector("base")?.href || new URL("../../", location.href).href;
  const lang = () => document.documentElement.lang === "en" ? "en" : "hi";
  const copy = (hi, en) => lang() === "en" ? en : hi;
  let states = [];
  let rules = null;
  const safeText = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const load = async () => {
    try {
      const [stateResponse, ruleResponse] = await Promise.all([
        fetch(new URL("data/states.json", base), {credentials:"same-origin"}),
        fetch(new URL("data/rules.json", base), {credentials:"same-origin"})
      ]);
      if (!stateResponse.ok || !ruleResponse.ok) throw new Error("data unavailable");
      const stateData = await stateResponse.json();
      rules = await ruleResponse.json();
      states = Array.isArray(stateData.states) ? stateData.states : [];
      states.sort((a,b) => String(a.name_hi).localeCompare(String(b.name_hi), "hi"));
      stateSelect.innerHTML = '<option value="">'+safeText(copy("राज्य चुनें","Choose a state"))+'</option>' +
        states.map(s => '<option value="'+safeText(s.id)+'">'+safeText(s.name_hi)+' / '+safeText(s.name_en)+'</option>').join("");
      status.textContent = copy("राज्य सूची तैयार है। ऊपर विकल्प चुनें।","State list is ready. Choose your options above.");
    } catch (_) {
      status.textContent = copy("राज्य सूची लोड नहीं हुई। राज्य निर्देशिका खोलें।","Could not load the state list. Open the state directory.");
      stateSelect.innerHTML = '<option value="">'+safeText(copy("सूची उपलब्ध नहीं","List unavailable"))+'</option>';
    }
  };
  const renderResult = () => {
    const state = states.find(s => s.id === stateSelect.value);
    if (!state || !rules) {
      status.textContent = copy("कृपया राज्य चुनें।","Please choose a state.");
      result.hidden = true;
      return;
    }
    const goal = goalSelect.value;
    const have = haveSelect.value;
    const advice = rules.goal_advice?.[goal] || "";
    const adviceEn = rules.goal_advice_en?.[goal] || "";
    const haveRule = rules.haves?.find(h => h.id === have);
    const portal = safeText(state.portal_name || copy("राज्य पोर्टल","State portal"));
    const portalUrl = /^https:\/\//i.test(state.url || "") ? state.url : "";
    const record = copy(state.record_hi || "राज्य के रिकॉर्ड", state.record_en || "State land records");
    const mutation = copy(state.mutation_hi || "राज्य की प्रक्रिया", state.mutation_en || "State process");
    const stateIntro = copy(state.intro_hi || "", state.intro_en || "");
    const goalText = copy(advice, adviceEn);
    const haveText = haveRule ? copy(haveRule.advice_hi, haveRule.advice_en) : "";
    const portalLink = portalUrl ? '<p><a class="lr-btn" href="'+safeText(portalUrl)+'" target="_blank" rel="noopener noreferrer">'+safeText(copy("आधिकारिक पोर्टल खोलें","Open official portal"))+' ↗</a></p>' : "";
    const steps = Array.isArray(copy(state.steps_hi || [], state.steps_en || [])) ? copy(state.steps_hi || [], state.steps_en || []) : [];
    const stepsHtml = steps.length ? '<ol>'+steps.map(step => '<li>'+safeText(step)+'</li>').join("")+'</ol>' : "";
    const watch = copy(state.watch_hi || [], state.watch_en || []);
    const watchHtml = Array.isArray(watch) && watch.length ? '<ul>'+watch.slice(0,2).map(item => '<li>'+safeText(item)+'</li>').join("")+'</ul>' : "";
    result.innerHTML = '<div class="lr-prose"><h2>'+safeText(copy("आपका अगला कदम","Your next step"))+'</h2>' +
      '<p><strong>'+safeText(copy("राज्य रिकॉर्ड","State record"))+':</strong> '+safeText(record)+'</p>' +
      '<p><strong>'+safeText(copy("म्यूटेशन का स्थानीय नाम","Local mutation term"))+':</strong> '+safeText(mutation)+'</p>' +
      '<p>'+safeText(goalText)+'</p><p>'+safeText(haveText)+'</p>' +
      '<h3>'+safeText(copy("राज्य की सामान्य जानकारी","State overview"))+'</h3><p>'+safeText(stateIntro)+'</p>' +
      '<h3>'+safeText(copy("पोर्टल पर सामान्य कदम","Typical portal steps"))+'</h3>'+stepsHtml+
      '<h3>'+safeText(copy("ध्यान रखें","Keep in mind"))+'</h3>'+watchHtml+
      '<p><strong>'+safeText(copy("पोर्टल स्रोत स्थिति","Portal source confidence"))+':</strong> '+safeText(state.confidence || "unconfirmed")+'</p>' +
      portalLink + '<p><a href="'+safeText(new URL("maps/", base).href)+'">'+safeText(copy("नक्शे की जानकारी","Map guidance"))+'</a> · <a href="'+safeText(new URL("guides/find-khasra-number/", base).href)+'">'+safeText(copy("खसरा नंबर कैसे खोजें","How to find a khasra number"))+'</a></p>' +
      '<p><small>'+safeText(copy("जानकारी सामान्य है; अंतिम प्रक्रिया संबंधित राज्य के आधिकारिक स्रोत से जाँचें।","This is general guidance; confirm the current process with the relevant official state source."))+'</small></p></div>';
    result.hidden = false;
    status.textContent = copy("सुझाव तैयार है।","Your guidance is ready.");
  };
  form.addEventListener("submit", (event) => { event.preventDefault(); renderResult(); });
  document.addEventListener("landrecord:languagechange", () => {
    if (states.length) status.textContent = copy("राज्य सूची तैयार है। ऊपर विकल्प चुनें।","State list is ready. Choose your options above.");
    if (!result.hidden && stateSelect.value) renderResult();
  });
  load();
})();
