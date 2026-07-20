const CACHE_ESTATICO = 'gimnasio-estatico-v9'; // <-- ACORDATE DE CAMBIAR EL NÚMERO 
const CACHE_DINAMICO = 'gimnasio-dinamico-v9'; // <-- PARA FORZAR LA ACTUALIZACIÓN

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
    // 1. LA MAGIA: Obliga a la nueva versión a instalarse y tomar el control INMEDIATAMENTE
    self.skipWaiting(); 
    
    evento.waitUntil(
        caches.open(CACHE_ESTATICO).then((cache) => cache.addAll(ASSETS_CORE))
    );
});

self.addEventListener('activate', (evento) => {
    // 2. LA MAGIA PARTE 2: Hace que la nueva versión controle todas las pestañas abiertas al instante
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

// ... (Acá sigue tu evento 'fetch' exactamente igual que como lo tenés) ...
self.addEventListener('fetch', (evento) => {
    const url = evento.request.url;

    // 1. REGLA ESTRICTA: Ignorar base de datos y Live Server
    if (url.includes('supabase.co/rest/v1/') || url.startsWith('ws://') || url.startsWith('chrome-extension')) {
        return; 
    }

    // 2. MAGIA: Guardar Imágenes Y TIPOGRAFÍAS de Google
    if (evento.request.destination === 'image' || 
        url.includes('supabase.co/storage/') || 
        url.includes('fonts.googleapis.com') || 
        url.includes('fonts.gstatic.com')) {
        
        evento.respondWith(
            caches.match(evento.request).then((respuestaCache) => {
                if (respuestaCache) {
                    return respuestaCache; // Devuelve al instante
                }
                return fetch(evento.request).then((respuestaRed) => {
                    if (respuestaRed && respuestaRed.status === 200) {
                        const respuestaClonada = respuestaRed.clone();
                        caches.open(CACHE_DINAMICO).then(cache => cache.put(evento.request, respuestaClonada));
                    }
                    return respuestaRed;
                }).catch(() => {
                    // Salvavidas silencioso si falla
                    return new Response('', { status: 404, statusText: 'Offline' });
                });
            })
        );
        return;
    }

    // 3. PARA EL RESTO (HTML, CSS, JS)
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
            // EL SALVAVIDAS que arregla tu error rojo: devuelve un archivo vacío en vez de entrar en pánico
            return new Response('Contenido no disponible offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
});