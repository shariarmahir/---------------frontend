/*
 * Saves the Geography & Travel page and the map of Bangladesh for offline use
 * (the "Save for offline" button). Everything goes to the network first, with
 * the saved copy when there is no signal. Only what the visitor chose to save
 * is stored, on their device. Map tiles come from two open-data hosts.
 */
const CACHE = "bd-travel-v2";
const MAP_HOSTS = ["tiles.openfreemap.org", "s3.amazonaws.com"];

const allowed = (url) => {
  const { origin, hostname } = new URL(url, self.location.origin);
  return origin === self.location.origin || MAP_HOSTS.includes(hostname);
};

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("bd-travel-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function saveAll(urls, reply) {
  const cache = await caches.open(CACHE);
  const queue = [...new Set(urls)].filter(allowed);
  const total = queue.length;
  let saved = 0;
  let done = 0;
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        const response = await fetch(url, { mode: new URL(url, self.location.origin).origin === self.location.origin ? "same-origin" : "cors" });
        if (response.ok) {
          await cache.put(url, response);
          saved++;
        }
      } catch {
        /* One missing tile is not worth failing the rest. */
      }
      done++;
      if (done % 25 === 0) reply({ type: "progress", saved, total });
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  reply({ type: "saved", saved, total });
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "save") return;
  event.waitUntil(saveAll(event.data.urls, (message) => event.source?.postMessage(message)));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !allowed(request.url)) return;
  // ignoreVary: the server varies by request headers, and a saved copy must answer whichever request asks for it.
  event.respondWith(fetch(request).catch(async () => (await caches.match(request, { ignoreSearch: request.mode === "navigate", ignoreVary: true })) ?? Response.error()));
});
