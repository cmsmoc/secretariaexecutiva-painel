self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  if (event.request.url.includes('script.google.com')) {
    event.respondWith(fetch(event.request).catch(() =>
      new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      const fetchPromise = fetch(event.request).then(networkResponse => {

        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const clone = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});