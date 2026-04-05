const CACHE_NAME = 'cms-cache-v2';

self.addEventListener('fetch', event => {
  // Ignora tudo que não for GET (como os POSTs de upload)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  // Não intercepta nem faz cache da API do Google
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a requisição deu certo, salva no cache e retorna
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se a internet cair, tenta pegar do cache silenciosamente (sem dar erro vermelho)
        return caches.match(event.request);
      })
  );
});