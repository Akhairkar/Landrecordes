// LandRecord service worker. Same-origin only: cross-origin requests (OpenStreetMap tiles, government portals)
// are never intercepted or cached, so the OSM tile policy and official sites are untouched.
const VERSION = "__VERSION__";
const CACHE = `landrecord-${VERSION}`;
const SHELL = [
  "./",
  "404.html",
  "assets/css/site.css?v=__CSSV__",
  "assets/js/site-shell.js",
  "assets/js/sw-register.js",
  "assets/js/tools/shared-ui.js",
  "assets/js/tools/land-units.js",
  "assets/js/tools/land-units-ui.js",
  "data/units.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("landrecord-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin traffic
  if (!url.pathname.startsWith(new URL("./", self.location).pathname)) return;

  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    // Network first for pages; fall back to the cached copy, then the offline page.
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("404.html"))),
    );
    return;
  }

  // Stale-while-revalidate for same-origin assets and data.
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => { if (res.ok) c.put(req, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      }),
    ),
  );
});
