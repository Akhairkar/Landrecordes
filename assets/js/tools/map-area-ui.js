import { $, L as tr, pick, loadUnits, mountLocalFields, renderAreaRows, copyLink } from "./shared-ui.js";
import { formatNumber } from "./land-units.js";
import { fieldArea, encodePoints, decodePoints, distanceM } from "./geo-area.js";
import { MAX_POLYGON_POINTS } from "./plot-area.js";

const LEAFLET = "assets/vendor/leaflet-1.9.4/";
const ERR = {
  invalid: "कम से कम 3 अलग-अलग कोने जोड़ें. / Add at least 3 different corners.",
  "self-intersecting": "सीमा खुद को काट रही है. कोने सीमा के साथ-साथ क्रम में जोड़ें. / The boundary crosses itself; add corners in order around the field.",
  "zero-area": "सारे कोने एक सीधी रेखा में हैं. / All corners are on one line.",
};

async function init() {
  const units = await loadUnits();
  const status = $("ma-status"), list = $("ma-points"), table = $("ma-table"), summary = $("ma-summary");
  const local = mountLocalFields($("ma-local-fields"), units, () => update());
  /** @type {{p:[number,number], acc?:number}[]} */
  let pts = [];
  let map = null, layer = null;

  function add(p, acc) {
    if (pts.length >= MAX_POLYGON_POINTS) { status.textContent = pick("बहुत ज़्यादा कोने. / Too many corners."); return; }
    pts.push({ p, acc });
    update();
  }

  function update() {
    list.textContent = "";
    pts.forEach(({ p, acc }, i) => {
      const li = document.createElement("li");
      const gap = i > 0 ? ` · ${tr("पिछले से", "from previous")} ${formatNumber(distanceM(pts[i - 1].p, p))} m` : "";
      li.textContent = `${p[0].toFixed(6)}, ${p[1].toFixed(6)}${acc ? ` (±${Math.round(acc)} m)` : ""}${gap}`;
      list.append(li);
    });
    $("ma-undo").disabled = $("ma-clear").disabled = pts.length === 0;
    table.hidden = true; summary.textContent = "";
    drawMap();
    writeUrl();
    if (pts.length < 3) { status.textContent = pts.length ? pick(`${pts.length} कोना जुड़ा; कम से कम 3 चाहिए. / ${pts.length} corner(s) added; at least 3 needed.`) : ""; return; }
    const r = fieldArea(pts.map((x) => x.p));
    if (!r.ok) { status.textContent = pick(ERR[r.reason] || ERR.invalid); return; }
    const worst = Math.max(0, ...pts.map((x) => x.acc || 0));
    status.textContent = pick("अनुमानित क्षेत्रफल (सभी इकाइयों में): / Estimated area in every unit:");
    summary.textContent = tr(`परिधि (सीमा की कुल लंबाई): ${formatNumber(r.perimeterM)} मीटर`, `Perimeter: ${formatNumber(r.perimeterM)} m`)
      + (worst > 10 ? tr(` · GPS की सटीकता ±${Math.round(worst)} मीटर तक है, इसलिए नतीजे में काफ़ी फर्क हो सकता है।`, ` · GPS accuracy is up to ±${Math.round(worst)} m, so the result can be well off.`) : "");
    renderAreaRows($("ma-body"), units, r.sqft, local.read());
    table.hidden = false;
  }

  function writeUrl() {
    const q = new URLSearchParams();
    if (pts.length) q.set("pts", encodePoints(pts.map((x) => x.p)));
    for (const [id, n] of Object.entries(local.read())) q.set(id, String(n));
    const s = q.toString();
    history.replaceState(null, "", `${location.pathname}${s ? `?${s}` : ""}#tool`);
  }

  function gps() {
    if (!navigator.geolocation) { status.textContent = pick("इस ब्राउज़र में GPS उपलब्ध नहीं है. / GPS is not available in this browser."); return; }
    const btn = $("ma-gps");
    btn.disabled = true;
    status.textContent = pick("GPS से जगह ली जा रही है… खुले में स्थिर खड़े रहें. / Getting GPS position… stand still in the open.");
    navigator.geolocation.getCurrentPosition(
      (pos) => { btn.disabled = false; add([pos.coords.latitude, pos.coords.longitude], pos.coords.accuracy); if (map) map.setView(pts.at(-1).p, Math.max(map.getZoom(), 18)); },
      (e) => { btn.disabled = false; status.textContent = e.code === 1 ? pick("लोकेशन की अनुमति नहीं मिली. ब्राउज़र सेटिंग में इस साइट के लिए लोकेशन चालू करें. / Location permission denied; allow it in browser settings.") : pick("GPS से जगह नहीं मिली. खुले में दोबारा कोशिश करें. / Could not get a GPS fix; try again in the open."); },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
    );
  }

  function loadLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${LEAFLET}leaflet.css`;
    document.head.append(css);
    return new Promise((ok, fail) => {
      const s = document.createElement("script");
      s.src = `${LEAFLET}leaflet.js`;
      s.onload = () => ok(window.L);
      s.onerror = fail;
      document.head.append(s);
    });
  }

  async function openMap() {
    const btn = $("ma-open-map");
    btn.disabled = true;
    try {
      const Lf = await loadLeaflet();
      const box = $("ma-map");
      box.hidden = false;
      map = Lf.map(box, { tap: true }).setView(pts.length ? pts.at(-1).p : [22.5, 79], pts.length ? 18 : 5);
      Lf.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
      map.on("click", (e) => add([e.latlng.lat, e.latlng.lng]));
      btn.hidden = true;
      $("ma-map-help").hidden = false;
      drawMap();
      if (pts.length >= 2) map.fitBounds(pts.map((x) => x.p), { padding: [24, 24] });
    } catch {
      btn.disabled = false;
      status.textContent = pick("नक्शा लोड नहीं हुआ. इंटरनेट जाँचें; GPS वाला तरीका बिना नक्शे के भी चलता है. / Map failed to load; GPS mode works without it.");
    }
  }

  function drawMap() {
    if (!map) return;
    const Lf = window.L;
    if (layer) layer.remove();
    layer = Lf.layerGroup().addTo(map);
    const ll = pts.map((x) => x.p);
    if (ll.length >= 3) Lf.polygon(ll, { color: "#2c5b3c", weight: 3, fillOpacity: 0.25, interactive: false }).addTo(layer);
    else if (ll.length === 2) Lf.polyline(ll, { color: "#2c5b3c", weight: 3, interactive: false }).addTo(layer);
    ll.forEach((p, i) => Lf.circleMarker(p, { radius: 7, color: "#fff", weight: 2, fillColor: "#a0522d", fillOpacity: 1, interactive: false }).bindTooltip(String(i + 1), { permanent: true, direction: "top", offset: [0, -6] }).addTo(layer));
  }

  $("ma-gps").addEventListener("click", gps);
  $("ma-open-map").addEventListener("click", openMap);
  $("ma-undo").addEventListener("click", () => { pts.pop(); update(); });
  $("ma-clear").addEventListener("click", () => { if (confirm(tr("सारे कोने हटा दें?", "Remove all corners?"))) { pts = []; update(); } });
  $("ma-copy").addEventListener("click", () => copyLink(status));

  const q = new URLSearchParams(location.search);
  const saved = decodePoints(q.get("pts") || "");
  if (saved) pts = saved.map((p) => ({ p }));
  for (const u of local.locals) if (q.get(u.id)) local.set(u.id, q.get(u.id));
  if (local.locals.some((u) => q.get(u.id))) $("ma-local-box").open = true;
  update();
}
init().catch(() => { $("ma-status").textContent = pick("टूल लोड नहीं हो सका. कृपया पेज रीफ़्रेश करें. / Tool failed to load."); });
