/* LandRecord M2 — shared shell foundation. */
(function () {
  "use strict";
  const labels = {
    en: { records:"Records", states:"States", tools:"Tools", guides:"Guides", search:"Search", language:"हिन्दी", theme:"Theme", menu:"More", disclaimer:"Independent information platform. Government portals remain the authoritative source for official records and decisions." },
    hi: { records:"रिकॉर्ड", states:"राज्य", tools:"टूल्स", guides:"गाइड", search:"खोजें", language:"English", theme:"थीम", menu:"और", disclaimer:"स्वतंत्र सूचना प्लेटफ़ॉर्म। आधिकारिक रिकॉर्ड और निर्णय के लिए संबंधित सरकारी पोर्टल ही प्रामाणिक स्रोत हैं।" }
  };
  const basePath = (document.querySelector("base")?.getAttribute("href") || "/").replace(/\/$/,"");
  const route = (path) => basePath + (path.startsWith("/") ? path : "/" + path);
  const getLanguage = () => localStorage.getItem("landrecord-language") || document.documentElement.lang || "en";
  const getTheme = () => localStorage.getItem("landrecord-theme") || "light";
  function setLanguage(lang){ localStorage.setItem("landrecord-language",lang); document.documentElement.lang=lang; document.dispatchEvent(new CustomEvent("landrecord:languagechange",{detail:{lang}})); }
  function setTheme(theme){ localStorage.setItem("landrecord-theme",theme); document.documentElement.dataset.theme=theme; document.dispatchEvent(new CustomEvent("landrecord:themechange",{detail:{theme}})); }
  function mount(options){
    const root=document.querySelector("[data-landrecord-shell]"); if(!root) return;
    const lang=getLanguage(), t=labels[lang]||labels.en, active=(options&&options.active)||"";
    root.innerHTML=`<header class="lr-header">
      <a class="lr-brand" href="${route("/")}" aria-label="LandRecord home"><span class="lr-brand-mark" aria-hidden="true">LR</span><span class="lr-brand-text">LandRecord</span></a>
      <nav class="lr-nav" aria-label="Primary navigation">
        <a class="${active==="records"?"is-active":""}" href="${route("/records/")}">${t.records}</a>
        <a class="${active==="states"?"is-active":""}" href="${route("/states/")}">${t.states}</a>
        <a class="${active==="tools"?"is-active":""}" href="${route("/tools/")}">${t.tools}</a>
        <a class="${active==="guides"?"is-active":""}" href="${route("/guides/")}">${t.guides}</a>
      </nav>
      <div class="lr-actions"><a class="lr-action lr-search-action" href="${route("/search/")}" aria-label="${t.search}"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>${t.search}</span></a><button class="lr-action" type="button" data-lr-language>${t.language}</button><button class="lr-action" type="button" data-lr-theme aria-label="${t.theme}" title="${t.theme}"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg></button><button class="lr-menu-toggle" type="button" data-lr-menu aria-expanded="false" aria-controls="lr-mobile-nav">${t.menu}</button></div>
    </header>
    <nav id="lr-mobile-nav" class="lr-mobile-nav" aria-label="Mobile navigation" hidden><a href="${route("/records/")}">${t.records}</a><a href="${route("/states/")}">${t.states}</a><a href="${route("/tools/")}">${t.tools}</a><a href="${route("/guides/")}">${t.guides}</a><a href="${route("/search/")}">${t.search}</a></nav>`;
    document.documentElement.dataset.theme=getTheme();
    root.querySelector("[data-lr-language]").onclick=()=>{setLanguage(getLanguage()==="hi"?"en":"hi");mount(options)};
    root.querySelector("[data-lr-theme]").onclick=()=>{setTheme(getTheme()==="dark"?"light":"dark");mount(options)};
    root.querySelector("[data-lr-menu]").onclick=e=>{const nav=root.querySelector("#lr-mobile-nav"),open=nav.hidden;nav.hidden=!open;e.currentTarget.setAttribute("aria-expanded",String(open));};
  }
  window.LandRecordShell={mount,setLanguage,setTheme};
})();