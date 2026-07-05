// Nombre de la memoria caché
const CACHE_NAME = "gimnasio-18.3-v1";

// Cuando la app se instala, activamos el Service Worker
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Obliga a que se actualice al instante si hay cambios
});

// Cuando la app pide un archivo (como el HTML o una foto)
self.addEventListener("fetch", (event) => {
    // Le decimos que SIEMPRE intente buscar la versión más nueva en internet primero.
    // Así te asegurás de que los profes siempre vean tus últimas actualizaciones.
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});