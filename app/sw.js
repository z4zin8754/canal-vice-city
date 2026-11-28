/* Canal Vice City · service worker */
const V = 'cvc-v23';
const SHELL = ['./', 'index.html', 'css/app.css', 'css/v2.css', 'js/config.js', 'js/content.js', 'js/app.js', 'js/bonus.js', 'js/estudio.js', 'assets/sprite.svg', 'assets/logo.webp', 'assets/logo-96.webp', 'assets/img/login.webp', 'assets/img/qg.webp', 'data/catalog.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; });
  // conteúdo muda com frequência: rede primeiro, cache se estiver offline
  if (/\.(html|js|css|json)$/.test(u.pathname) || u.pathname.endsWith('/')) { e.respondWith(net.catch(() => caches.match(e.request, { ignoreSearch: true }))); return; }
  // imagens e ícones: cache primeiro
  e.respondWith(caches.match(e.request).then(c => c || net));
});
