// Chauhan Research — offline app shell. Research data itself is kept offline by Firestore, not here.
const CACHE = "cr-shell-v22";
const SHELL = ["./", "index.html", "teacher.html", "anxiety.html", "test.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png", "privacy.html"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {            // app files: network first (gets updates), cache when offline
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else if (url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/")) {   // Firebase SDK: versioned, cache first
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const cp = n.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return n; })));
  }
});
