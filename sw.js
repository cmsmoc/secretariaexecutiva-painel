const CACHE_NAME = 'biblioteca-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap',
  'https://unpkg.com/lucide@latest'
];

// Instalação: Cache dos assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativação: Limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
});

// Interceptação de Fetch (Stale-while-revalidate)
self.addEventListener('fetch', event => {
  // Ignora chamadas para a API do Google (Sempre buscar dados frescos se online)
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback para os dados offline não foi implementado neste protótipo simples,
        // mas aqui seria onde o IndexedDB retornaria os dados cacheados.
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' }});
      })
    );
    return;
  }

  // Cache first para arquivos locais e CDN
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const networkFetch = fetch(event.request).then(response => {
        // Atualiza o cache silenciosamente
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
        });
        return response;
      });
      // Retorna do cache se existir, senão aguarda a rede
      return cachedResponse || networkFetch;
    })
  );
});