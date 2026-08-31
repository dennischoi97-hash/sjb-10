// 말빛 서비스워커 — 오프라인에서도 앱이 열리도록 전체 파일을 캐시합니다.
// 배포 시 CACHE_VERSION을 올리면 다음 방문에서 새 파일로 교체됩니다.
const CACHE_VERSION = 'malbit-v1.0.0';

const ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './js/app.js',
  './js/data.js',
  './js/state.js',
  './js/speech.js',
  './js/input.js',
  './js/settings.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // 클라우드 TTS 등 외부 요청은 캐시하지 않습니다.
  if (url.origin !== location.origin) return;

  // 같은 출처: 캐시 우선, 없으면 네트워크에서 받아 캐시에 저장 (오프라인 우선)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
