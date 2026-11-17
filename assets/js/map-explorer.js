/* LandRecord map explorer — general geographic context only, never cadastral data. */
(() => {
  "use strict";
  const BASE = document.querySelector("base")?.href || (location.origin + "/");
  const asset = (path) => new URL(path, BASE).href;
  const containers = [...document.querySelectorAll("[data-lr-map-explorer]")];
  if (!containers.length) return;

  let leafletPromise;
  function loadLeaflet() {
    if (window.L?.map) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      if (!document.querySelector("[data-lr-leaflet-css]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = asset("assets/vendor/leaflet-1.9.4/leaflet.css");
        link.dataset.lrLeafletCss = "true";
        document.head.append(link);
      }
      const script = document.createElement("script");
      script.src = asset("assets/vendor/leaflet-1.9.4/leaflet.js");
      script.onload = () => window.L?.map ? resolve(window.L) : reject(new Error("Leaflet did not initialise"));
      script.onerror = () => reject(new Error("Leaflet could not be loaded"));
      document.head.append(script);
    });
    return leafletPromise;
  }

  const INDIA_VIEW = { center: [22.5, 79], zoom: 4.35 };
  containers.forEach((element) => {
    let map = null;
    let started = false;
    const wrapper = element.closest(".lr-map-panel,.lr-map-page-map") || element.parentElement;
    const reset = wrapper?.querySelector("[data-lr-map-reset]");
    const note = wrapper?.querySelector("[data-lr-map-status]");

    function setNote(message) {
      if (note) note.textContent = message;
    }
    function resetView() {
      if (map) map.setView(INDIA_VIEW.center, INDIA_VIEW.zoom, { animate: true });
    }
    if (reset) reset.addEventListener("click", resetView);

    async function start() {
      if (started) return;
      started = true;
      setNote("नक्शा लोड हो रहा है… / Loading map…");
      try {
        const L = await loadLeaflet();
        map = L.map(element, { scrollWheelZoom: false, tap: true, zoomControl: true }).setView(INDIA_VIEW.center, INDIA_VIEW.zoom);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
        }).addTo(map);
        map.whenReady(() => setNote("OpenStreetMap • सामान्य भौगोलिक संदर्भ / General geographic context"));
        window.setTimeout(() => map?.invalidateSize(), 180);
      } catch {
        started = false;
        setNote("नक्शा अभी लोड नहीं हुआ। इंटरनेट जाँचें या राज्य-वार गाइड खोलें। / Map unavailable; check your connection or use the state guides.");
      }
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      }, { rootMargin: "180px 0px" });
      observer.observe(element);
    } else {
      start();
    }
  });
})();
