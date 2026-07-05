// Nombre de la memoria caché
const CACHE_NAME = "gimnasio-18.3-v2";

// Cuando la app se instala, activamos el Service Worker y forzamos el reemplazo
self.addEventListener("install", (event) => {
    self.skipWaiting(); 
});

// Cuando se activa, borra cualquier memoria vieja (v1) y toma el control al instante
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// El interceptor de peticiones (Acá ocurre la magia de las actualizaciones)
self.addEventListener("fetch", (event) => {
    // Si no es una petición de lectura (GET), no hacemos nada
    if (event.request.method !== 'GET') return;

    // Verificamos si el archivo que se pide es tuyo (de tu app) o de afuera (Supabase, Google)
    const url = new URL(event.request.url);
    const esArchivoPropio = url.origin === location.origin;

    if (esArchivoPropio) {
        event.respondWith(
            // El truco de oro: { cache: 'no-store' } obliga al celular a ignorar su memoria vieja
            fetch(event.request, { cache: 'no-store' })
                .then((respuestaRed) => {
                    // Si responde GitHub y hay internet, actualizamos la memoria invisible por si se corta el WiFi
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, respuestaRed.clone());
                        return respuestaRed;
                    });
                })
                .catch(() => {
                    // Si falla (no hay internet), recién ahí le damos la versión vieja de la memoria
                    return caches.match(event.request);
                })
        );
    } else {
        // Para cosas externas (como consultar la base de datos), comportamiento normal
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});