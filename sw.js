const CACHE_ESTATICO = 'gimnasio-estatico-v19'; // <-- ACORDATE DE CAMBIAR EL NÚMERO 
const CACHE_DINAMICO = 'gimnasio-dinamico-v19'; // <-- PARA FORZAR LA ACTUALIZACIÓN

const ASSETS_CORE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/imagenes/logo.png',
    '/imagenes/LOGOACENTO.png',
    '/imagenes/FONDOBLANCOTODO.jpg',
    '/imagenes/FONDONEGROTODO.jpg'
];

self.addEventListener('install', (evento) => {
    self.skipWaiting(); 
    
    evento.waitUntil(
        caches.open(CACHE_ESTATICO).then((cache) => cache.addAll(ASSETS_CORE))
    );
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(self.clients.claim()); 

    evento.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_ESTATICO && key !== CACHE_DINAMICO) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (evento) => {
    const url = evento.request.url;

    if (evento.request.method !== 'GET') return;

    if (url.includes('supabase.co/rest/v1/') || url.startsWith('ws://') || url.startsWith('chrome-extension')) {
        return; 
    }

    if (evento.request.destination === 'image' || 
        url.includes('supabase.co/storage/') || 
        url.includes('fonts.googleapis.com') || 
        url.includes('fonts.gstatic.com')) {
        
        evento.respondWith(
            caches.match(evento.request).then((respuestaCache) => {
                if (respuestaCache) {
                    return respuestaCache;
                }
                return fetch(evento.request).then((respuestaRed) => {
                    if (respuestaRed && respuestaRed.status === 200) {
                        const respuestaClonada = respuestaRed.clone();
                        caches.open(CACHE_DINAMICO).then(cache => cache.put(evento.request, respuestaClonada));
                    }
                    return respuestaRed;
                }).catch(() => {
                    return new Response('', { status: 404, statusText: 'Offline' });
                });
            })
        );
        return;
    }

    evento.respondWith(
        fetch(evento.request).then(respuestaRed => {
            const respuestaClonada = respuestaRed.clone();
            caches.open(CACHE_ESTATICO).then(cache => cache.put(evento.request, respuestaClonada));
            return respuestaRed;
        }).catch(async () => {
            const respuestaCache = await caches.match(evento.request);
            if (respuestaCache) {
                return respuestaCache;
            }
            return new Response('Contenido no disponible offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
});