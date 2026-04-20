const CACHE_NAME = 'dashboard-cat-v2'

// Apenas recursos estáticos públicos são pré-cacheados (sem páginas autenticadas)
const PRECACHE_URLS = [
  '/',
]

// Rotas que NUNCA devem ser cacheadas
const NEVER_CACHE = [
  '/dashboard',
  '/api/',
]

function shouldCache(url) {
  const { pathname } = new URL(url)
  for (const blocked of NEVER_CACHE) {
    if (pathname.startsWith(blocked)) return false
  }
  return true
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Nunca cachear páginas autenticadas nem respostas de API
  if (!shouldCache(event.request.url)) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Só cachear respostas válidas de recursos estáticos
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
