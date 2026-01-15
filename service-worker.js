// Finance Pro - Service Worker v1.0.1
// CORRIGIDO para GitHub Pages

const CACHE_NAME = 'finance-pro-v1.0.1';
const RUNTIME_CACHE = 'finance-pro-runtime';

// ========================================
// ARQUIVOS ESSENCIAIS PARA CACHE
// ========================================
const CORE_ASSETS = [
  '/finance-pro/',                    // Start URL
  '/finance-pro/index.html',          // Página principal (CORRIGIDO!)
  '/finance-pro/manifest.json',       // Manifest
  '/finance-pro/icons/icon-192.png',  // Ícone principal
  '/finance-pro/icons/icon-512.png',  // Ícone grande
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'  // Chart.js
];

// ========================================
// INSTALAÇÃO - Cachear arquivos essenciais
// ========================================
self.addEventListener('install', (event) => {
  console.log('💾 [SW] Instalando Service Worker v1.0.1...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 [SW] Cache aberto, adicionando arquivos...');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('✅ [SW] Todos os arquivos cacheados!');
        return self.skipWaiting(); // Ativar imediatamente
      })
      .catch((error) => {
        console.error('❌ [SW] Erro ao cachear:', error);
      })
  );
});

// ========================================
// ATIVAÇÃO - Limpar caches antigos
// ========================================
self.addEventListener('activate', (event) => {
  console.log('🔄 [SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Deletar caches antigos
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ [SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ [SW] Service Worker ativado!');
        return self.clients.claim(); // Controlar todas as páginas
      })
  );
});

// ========================================
// FETCH - Estratégia: Cache First (Offline First)
// ========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de chrome-extension e outras
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('📦 [SW] Cache Hit:', request.url);
          return cachedResponse;
        }

        // Se não está no cache, buscar da rede
        console.log('🌐 [SW] Network:', request.url);
        return fetch(request)
          .then((response) => {
            // Não cachear respostas inválidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar resposta (só pode ser lida uma vez)
            const responseToCache = response.clone();

            // Cachear apenas recursos importantes
            if (shouldCache(request.url)) {
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                  console.log('💾 [SW] Cached:', request.url);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('❌ [SW] Fetch Error:', error);
            
            // Retornar página offline se disponível
            if (request.destination === 'document') {
              return caches.match('/finance-pro/index.html');
            }
            
            return new Response('Offline - Sem conexão com a internet', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=UTF-8'
              })
            });
          });
      })
  );
});

// ========================================
// HELPERS
// ========================================
function shouldCache(url) {
  // Cachear apenas CDN e assets locais importantes
  const cacheablePatterns = [
    /cdn\.jsdelivr\.net/,
    /\/finance-pro\//,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.svg$/,
    /\.css$/,
    /\.js$/,
    /\.woff2?$/,
    /\.ttf$/,
    /\.eot$/
  ];
  
  return cacheablePatterns.some(pattern => pattern.test(url));
}

// ========================================
// MENSAGENS - Comunicação com a página
// ========================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏩ [SW] Skip Waiting solicitado');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ [SW] Limpando cache...');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('✅ [SW] Cache limpo!');
      event.ports[0].postMessage({ success: true });
    });
  }
});

// ========================================
// SYNC - Background Sync (Future)
// ========================================
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Background Sync:', event.tag);
  
  if (event.tag === 'sync-finances') {
    event.waitUntil(syncFinances());
  }
});

function syncFinances() {
  return Promise.resolve()
    .then(() => {
      console.log('✅ [SW] Finanças sincronizadas!');
    })
    .catch((error) => {
      console.error('❌ [SW] Erro ao sincronizar:', error);
    });
}

// ========================================
// PUSH - Notificações (Future)
// ========================================
self.addEventListener('push', (event) => {
  console.log('📬 [SW] Push notification recebida');
  
  const title = 'Finance Pro';
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/finance-pro/icons/icon-192.png',
    badge: '/finance-pro/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'finance-notification',
    requireInteraction: false,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notificação clicada');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/finance-pro/')
  );
});

// Log de inicialização
console.log('🚀 [SW] Service Worker Finance Pro v1.0.1 carregado!');