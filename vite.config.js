import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/app-gimnasio-183/', // Fundamental para que funcione en GitHub Pages
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      filename: 'sw.js',
      manifest: false, // Vite no toca tu manifest.json manual de la carpeta public
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        navigateFallback: '/index.html', // Carga la app aunque no haya internet
        runtimeCaching: [
          {
            // Atrapa las imágenes de Supabase Storage sin importar el ?token=
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-imagenes',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            // Atrapa imágenes dinámicas locales
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)(?:\?.*)?$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'imagenes-dinamicas',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ]
});