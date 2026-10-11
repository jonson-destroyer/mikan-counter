// 初回オンライン時に全ファイルをキャッシュし、以降はオフラインで動かす
const CACHE = "mikan-v1";
const FILES = [
  "./", "./index.html",
  "./model/best.onnx",
  "./lib/ort.min.js",
  "./lib/ort-wasm-simd-threaded.wasm",
  "./lib/ort-wasm-simd-threaded.mjs"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
