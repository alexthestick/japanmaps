import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // Auto-update the service worker silently in the background.
      // Users get new content on next page reload without any prompt.
      registerType: 'autoUpdate',

      // Files to precache (app shell — works offline after first visit)
      includeAssets: ['favicon.png', 'icons/*.png'],

      // ── Web App Manifest ────────────────────────────────────────────────────
      // This is what makes the browser show the "Add to Home Screen" prompt.
      // On Android it creates a proper shortcut; on iOS it enables standalone mode.
      manifest: {
        name: 'Lost in Transit JP',
        short_name: 'LIT JP',
        description: 'Discover vintage, archive & streetwear stores across Japan',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',         // Hides the browser chrome — feels like a native app
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['travel', 'lifestyle', 'shopping'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            // "maskable" means Android can crop/reshape the icon to fit its
            // icon style (circle, rounded square, etc.) without white bars
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          // Shortcuts appear when long-pressing the home screen icon on Android
          {
            name: 'Browse Map',
            short_name: 'Map',
            description: 'Open the store map',
            url: '/map?source=shortcut',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Saved Stores',
            short_name: 'Saved',
            description: 'View your saved stores',
            url: '/saved?source=shortcut',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },

      // ── Workbox Caching Strategy ────────────────────────────────────────────
      // Workbox is Google's service worker toolkit. We use it to cache different
      // types of content with different strategies:
      //   CacheFirst      — Serve from cache, only go to network if not cached.
      //                     Best for images & fonts that rarely change.
      //   NetworkFirst    — Try network, fall back to cache on failure.
      //                     Best for API data that should be fresh but usable offline.
      //   StaleWhileRevalidate — Serve from cache instantly, then update in background.
      //                     Best for map tiles where speed matters more than freshness.
      workbox: {
        // Take control of all clients immediately on activation.
        // Without this, the new service worker waits until every tab running
        // the old version is closed before it activates — which can take hours.
        // With it, the new SW activates on the next page load after deploy,
        // preventing the chunk-hash mismatch that causes white screens.
        skipWaiting: true,
        clientsClaim: true,

        // Precache all build output (JS bundles, CSS, HTML, fonts, icons)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Exclude the Mapbox GL JS chunk from precaching.
        // At 1,625 kB it is the largest single asset in the build, and it is
        // only needed on the /map route. Precaching it forces every first-time
        // visitor to download it in the background even on pages that never
        // show a map. It will still be fetched and cached at runtime the first
        // time the user visits /map, via the StaleWhileRevalidate rule below.
        globIgnores: ['**/mapbox-gl*.js'],

        runtimeCaching: [
          // ImageKit CDN images — cache aggressively for 30 days.
          //
          // IMPORTANT — credentials: 'omit' is required here.
          // The service worker intercepts <img> requests and re-fetches them.
          // Without explicitly omitting credentials, browsers send cookies
          // along with the cross-origin request. ImageKit responds with
          // Access-Control-Allow-Origin: * which browsers reject when
          // credentials are present — causing every image to fail with a
          // CORS error. 'omit' tells the SW never to send credentials for
          // ImageKit requests, which is correct since IK needs no auth.
          //
          // statuses: [200] only — never cache opaque (status 0) responses.
          // Opaque responses break canvas-based exports (html-to-image).
          {
            urlPattern: /^https:\/\/ik\.imagekit\.io\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagekit-images',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [200] },
              fetchOptions: { mode: 'cors', credentials: 'omit' },
            },
          },

          // Supabase API — try network first, fall back to last-known data
          // This means if someone opens the app on the subway with no signal,
          // they'll still see the store list from their last session.
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 6, // Fall back to cache after 6s
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Mapbox tiles & API — serve stale while updating in background
          // Map tiles are large and numerous; stale-while-revalidate keeps
          // the map snappy even on slow connections.
          {
            urlPattern: /^https:\/\/.*\.mapbox\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mapbox',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Google Fonts — cache for a year (they're versioned, never change)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
