// vite.config.ts
import { defineConfig } from "file:///sessions/intelligent-wonderful-faraday/mnt/Japan%20Maps/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/intelligent-wonderful-faraday/mnt/Japan%20Maps/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///sessions/intelligent-wonderful-faraday/mnt/Japan%20Maps/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-update the service worker silently in the background.
      // Users get new content on next page reload without any prompt.
      registerType: "autoUpdate",
      // Files to precache (app shell — works offline after first visit)
      includeAssets: ["favicon.png", "icons/*.png"],
      // ── Web App Manifest ────────────────────────────────────────────────────
      // This is what makes the browser show the "Add to Home Screen" prompt.
      // On Android it creates a proper shortcut; on iOS it enables standalone mode.
      manifest: {
        name: "Lost in Transit JP",
        short_name: "LIT JP",
        description: "Discover vintage, archive & streetwear stores across Japan",
        theme_color: "#0a0a0f",
        background_color: "#0a0a0f",
        display: "standalone",
        // Hides the browser chrome — feels like a native app
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        lang: "en",
        categories: ["travel", "lifestyle", "shopping"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            // "maskable" means Android can crop/reshape the icon to fit its
            // icon style (circle, rounded square, etc.) without white bars
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          // Shortcuts appear when long-pressing the home screen icon on Android
          {
            name: "Browse Map",
            short_name: "Map",
            description: "Open the store map",
            url: "/map?source=shortcut",
            icons: [{ src: "icons/icon-192.png", sizes: "192x192" }]
          },
          {
            name: "Saved Stores",
            short_name: "Saved",
            description: "View your saved stores",
            url: "/saved?source=shortcut",
            icons: [{ src: "icons/icon-192.png", sizes: "192x192" }]
          }
        ]
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
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Exclude the Mapbox GL JS chunk from precaching.
        // At 1,625 kB it is the largest single asset in the build, and it is
        // only needed on the /map route. Precaching it forces every first-time
        // visitor to download it in the background even on pages that never
        // show a map. It will still be fetched and cached at runtime the first
        // time the user visits /map, via the StaleWhileRevalidate rule below.
        globIgnores: ["**/mapbox-gl*.js"],
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
            handler: "CacheFirst",
            options: {
              cacheName: "imagekit-images",
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30
                // 30 days
              },
              cacheableResponse: { statuses: [200] },
              fetchOptions: { mode: "cors", credentials: "omit" }
            }
          },
          // Supabase API — try network first, fall back to last-known data
          // This means if someone opens the app on the subway with no signal,
          // they'll still see the store list from their last session.
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
                // 24 hours
              },
              networkTimeoutSeconds: 6,
              // Fall back to cache after 6s
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Mapbox tiles & API — serve stale while updating in background
          // Map tiles are large and numerous; stale-while-revalidate keeps
          // the map snappy even on slow connections.
          {
            urlPattern: /^https:\/\/.*\.mapbox\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "mapbox",
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 7
                // 7 days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Google Fonts — cache for a year (they're versioned, never change)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvaW50ZWxsaWdlbnQtd29uZGVyZnVsLWZhcmFkYXkvbW50L0phcGFuIE1hcHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9pbnRlbGxpZ2VudC13b25kZXJmdWwtZmFyYWRheS9tbnQvSmFwYW4gTWFwcy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvaW50ZWxsaWdlbnQtd29uZGVyZnVsLWZhcmFkYXkvbW50L0phcGFuJTIwTWFwcy92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG5cbiAgICBWaXRlUFdBKHtcbiAgICAgIC8vIEF1dG8tdXBkYXRlIHRoZSBzZXJ2aWNlIHdvcmtlciBzaWxlbnRseSBpbiB0aGUgYmFja2dyb3VuZC5cbiAgICAgIC8vIFVzZXJzIGdldCBuZXcgY29udGVudCBvbiBuZXh0IHBhZ2UgcmVsb2FkIHdpdGhvdXQgYW55IHByb21wdC5cbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuXG4gICAgICAvLyBGaWxlcyB0byBwcmVjYWNoZSAoYXBwIHNoZWxsIFx1MjAxNCB3b3JrcyBvZmZsaW5lIGFmdGVyIGZpcnN0IHZpc2l0KVxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLnBuZycsICdpY29ucy8qLnBuZyddLFxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgV2ViIEFwcCBNYW5pZmVzdCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICAgIC8vIFRoaXMgaXMgd2hhdCBtYWtlcyB0aGUgYnJvd3NlciBzaG93IHRoZSBcIkFkZCB0byBIb21lIFNjcmVlblwiIHByb21wdC5cbiAgICAgIC8vIE9uIEFuZHJvaWQgaXQgY3JlYXRlcyBhIHByb3BlciBzaG9ydGN1dDsgb24gaU9TIGl0IGVuYWJsZXMgc3RhbmRhbG9uZSBtb2RlLlxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ0xvc3QgaW4gVHJhbnNpdCBKUCcsXG4gICAgICAgIHNob3J0X25hbWU6ICdMSVQgSlAnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIHZpbnRhZ2UsIGFyY2hpdmUgJiBzdHJlZXR3ZWFyIHN0b3JlcyBhY3Jvc3MgSmFwYW4nLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyMwYTBhMGYnLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnIzBhMGEwZicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJywgICAgICAgICAvLyBIaWRlcyB0aGUgYnJvd3NlciBjaHJvbWUgXHUyMDE0IGZlZWxzIGxpa2UgYSBuYXRpdmUgYXBwXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQtcHJpbWFyeScsXG4gICAgICAgIHNjb3BlOiAnLycsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICBjYXRlZ29yaWVzOiBbJ3RyYXZlbCcsICdsaWZlc3R5bGUnLCAnc2hvcHBpbmcnXSxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdpY29ucy9pY29uLTE5Mi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaWNvbnMvaWNvbi01MTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIFwibWFza2FibGVcIiBtZWFucyBBbmRyb2lkIGNhbiBjcm9wL3Jlc2hhcGUgdGhlIGljb24gdG8gZml0IGl0c1xuICAgICAgICAgICAgLy8gaWNvbiBzdHlsZSAoY2lyY2xlLCByb3VuZGVkIHNxdWFyZSwgZXRjLikgd2l0aG91dCB3aGl0ZSBiYXJzXG4gICAgICAgICAgICBzcmM6ICdpY29ucy9pY29uLTUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ21hc2thYmxlJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBzaG9ydGN1dHM6IFtcbiAgICAgICAgICAvLyBTaG9ydGN1dHMgYXBwZWFyIHdoZW4gbG9uZy1wcmVzc2luZyB0aGUgaG9tZSBzY3JlZW4gaWNvbiBvbiBBbmRyb2lkXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Jyb3dzZSBNYXAnLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ01hcCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ09wZW4gdGhlIHN0b3JlIG1hcCcsXG4gICAgICAgICAgICB1cmw6ICcvbWFwP3NvdXJjZT1zaG9ydGN1dCcsXG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiAnaWNvbnMvaWNvbi0xOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJyB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdTYXZlZCBTdG9yZXMnLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ1NhdmVkJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldyB5b3VyIHNhdmVkIHN0b3JlcycsXG4gICAgICAgICAgICB1cmw6ICcvc2F2ZWQ/c291cmNlPXNob3J0Y3V0JyxcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICdpY29ucy9pY29uLTE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInIH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgV29ya2JveCBDYWNoaW5nIFN0cmF0ZWd5IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgICAgLy8gV29ya2JveCBpcyBHb29nbGUncyBzZXJ2aWNlIHdvcmtlciB0b29sa2l0LiBXZSB1c2UgaXQgdG8gY2FjaGUgZGlmZmVyZW50XG4gICAgICAvLyB0eXBlcyBvZiBjb250ZW50IHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXM6XG4gICAgICAvLyAgIENhY2hlRmlyc3QgICAgICBcdTIwMTQgU2VydmUgZnJvbSBjYWNoZSwgb25seSBnbyB0byBuZXR3b3JrIGlmIG5vdCBjYWNoZWQuXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgIEJlc3QgZm9yIGltYWdlcyAmIGZvbnRzIHRoYXQgcmFyZWx5IGNoYW5nZS5cbiAgICAgIC8vICAgTmV0d29ya0ZpcnN0ICAgIFx1MjAxNCBUcnkgbmV0d29yaywgZmFsbCBiYWNrIHRvIGNhY2hlIG9uIGZhaWx1cmUuXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgIEJlc3QgZm9yIEFQSSBkYXRhIHRoYXQgc2hvdWxkIGJlIGZyZXNoIGJ1dCB1c2FibGUgb2ZmbGluZS5cbiAgICAgIC8vICAgU3RhbGVXaGlsZVJldmFsaWRhdGUgXHUyMDE0IFNlcnZlIGZyb20gY2FjaGUgaW5zdGFudGx5LCB0aGVuIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kLlxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBCZXN0IGZvciBtYXAgdGlsZXMgd2hlcmUgc3BlZWQgbWF0dGVycyBtb3JlIHRoYW4gZnJlc2huZXNzLlxuICAgICAgd29ya2JveDoge1xuICAgICAgICAvLyBUYWtlIGNvbnRyb2wgb2YgYWxsIGNsaWVudHMgaW1tZWRpYXRlbHkgb24gYWN0aXZhdGlvbi5cbiAgICAgICAgLy8gV2l0aG91dCB0aGlzLCB0aGUgbmV3IHNlcnZpY2Ugd29ya2VyIHdhaXRzIHVudGlsIGV2ZXJ5IHRhYiBydW5uaW5nXG4gICAgICAgIC8vIHRoZSBvbGQgdmVyc2lvbiBpcyBjbG9zZWQgYmVmb3JlIGl0IGFjdGl2YXRlcyBcdTIwMTQgd2hpY2ggY2FuIHRha2UgaG91cnMuXG4gICAgICAgIC8vIFdpdGggaXQsIHRoZSBuZXcgU1cgYWN0aXZhdGVzIG9uIHRoZSBuZXh0IHBhZ2UgbG9hZCBhZnRlciBkZXBsb3ksXG4gICAgICAgIC8vIHByZXZlbnRpbmcgdGhlIGNodW5rLWhhc2ggbWlzbWF0Y2ggdGhhdCBjYXVzZXMgd2hpdGUgc2NyZWVucy5cbiAgICAgICAgc2tpcFdhaXRpbmc6IHRydWUsXG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcblxuICAgICAgICAvLyBQcmVjYWNoZSBhbGwgYnVpbGQgb3V0cHV0IChKUyBidW5kbGVzLCBDU1MsIEhUTUwsIGZvbnRzLCBpY29ucylcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdvZmYsd29mZjJ9J10sXG5cbiAgICAgICAgLy8gRXhjbHVkZSB0aGUgTWFwYm94IEdMIEpTIGNodW5rIGZyb20gcHJlY2FjaGluZy5cbiAgICAgICAgLy8gQXQgMSw2MjUga0IgaXQgaXMgdGhlIGxhcmdlc3Qgc2luZ2xlIGFzc2V0IGluIHRoZSBidWlsZCwgYW5kIGl0IGlzXG4gICAgICAgIC8vIG9ubHkgbmVlZGVkIG9uIHRoZSAvbWFwIHJvdXRlLiBQcmVjYWNoaW5nIGl0IGZvcmNlcyBldmVyeSBmaXJzdC10aW1lXG4gICAgICAgIC8vIHZpc2l0b3IgdG8gZG93bmxvYWQgaXQgaW4gdGhlIGJhY2tncm91bmQgZXZlbiBvbiBwYWdlcyB0aGF0IG5ldmVyXG4gICAgICAgIC8vIHNob3cgYSBtYXAuIEl0IHdpbGwgc3RpbGwgYmUgZmV0Y2hlZCBhbmQgY2FjaGVkIGF0IHJ1bnRpbWUgdGhlIGZpcnN0XG4gICAgICAgIC8vIHRpbWUgdGhlIHVzZXIgdmlzaXRzIC9tYXAsIHZpYSB0aGUgU3RhbGVXaGlsZVJldmFsaWRhdGUgcnVsZSBiZWxvdy5cbiAgICAgICAgZ2xvYklnbm9yZXM6IFsnKiovbWFwYm94LWdsKi5qcyddLFxuXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXG4gICAgICAgICAgLy8gSW1hZ2VLaXQgQ0ROIGltYWdlcyBcdTIwMTQgY2FjaGUgYWdncmVzc2l2ZWx5IGZvciAzMCBkYXlzLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gSU1QT1JUQU5UIFx1MjAxNCBjcmVkZW50aWFsczogJ29taXQnIGlzIHJlcXVpcmVkIGhlcmUuXG4gICAgICAgICAgLy8gVGhlIHNlcnZpY2Ugd29ya2VyIGludGVyY2VwdHMgPGltZz4gcmVxdWVzdHMgYW5kIHJlLWZldGNoZXMgdGhlbS5cbiAgICAgICAgICAvLyBXaXRob3V0IGV4cGxpY2l0bHkgb21pdHRpbmcgY3JlZGVudGlhbHMsIGJyb3dzZXJzIHNlbmQgY29va2llc1xuICAgICAgICAgIC8vIGFsb25nIHdpdGggdGhlIGNyb3NzLW9yaWdpbiByZXF1ZXN0LiBJbWFnZUtpdCByZXNwb25kcyB3aXRoXG4gICAgICAgICAgLy8gQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luOiAqIHdoaWNoIGJyb3dzZXJzIHJlamVjdCB3aGVuXG4gICAgICAgICAgLy8gY3JlZGVudGlhbHMgYXJlIHByZXNlbnQgXHUyMDE0IGNhdXNpbmcgZXZlcnkgaW1hZ2UgdG8gZmFpbCB3aXRoIGFcbiAgICAgICAgICAvLyBDT1JTIGVycm9yLiAnb21pdCcgdGVsbHMgdGhlIFNXIG5ldmVyIHRvIHNlbmQgY3JlZGVudGlhbHMgZm9yXG4gICAgICAgICAgLy8gSW1hZ2VLaXQgcmVxdWVzdHMsIHdoaWNoIGlzIGNvcnJlY3Qgc2luY2UgSUsgbmVlZHMgbm8gYXV0aC5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIHN0YXR1c2VzOiBbMjAwXSBvbmx5IFx1MjAxNCBuZXZlciBjYWNoZSBvcGFxdWUgKHN0YXR1cyAwKSByZXNwb25zZXMuXG4gICAgICAgICAgLy8gT3BhcXVlIHJlc3BvbnNlcyBicmVhayBjYW52YXMtYmFzZWQgZXhwb3J0cyAoaHRtbC10by1pbWFnZSkuXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9pa1xcLmltYWdla2l0XFwuaW9cXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdpbWFnZWtpdC1pbWFnZXMnLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMzAwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDMwLCAvLyAzMCBkYXlzXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMjAwXSB9LFxuICAgICAgICAgICAgICBmZXRjaE9wdGlvbnM6IHsgbW9kZTogJ2NvcnMnLCBjcmVkZW50aWFsczogJ29taXQnIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvLyBTdXBhYmFzZSBBUEkgXHUyMDE0IHRyeSBuZXR3b3JrIGZpcnN0LCBmYWxsIGJhY2sgdG8gbGFzdC1rbm93biBkYXRhXG4gICAgICAgICAgLy8gVGhpcyBtZWFucyBpZiBzb21lb25lIG9wZW5zIHRoZSBhcHAgb24gdGhlIHN1YndheSB3aXRoIG5vIHNpZ25hbCxcbiAgICAgICAgICAvLyB0aGV5J2xsIHN0aWxsIHNlZSB0aGUgc3RvcmUgbGlzdCBmcm9tIHRoZWlyIGxhc3Qgc2Vzc2lvbi5cbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcLy4qXFwuc3VwYWJhc2VcXC5jb1xcLy4qL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnc3VwYWJhc2UtYXBpJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCwgLy8gMjQgaG91cnNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbmV0d29ya1RpbWVvdXRTZWNvbmRzOiA2LCAvLyBGYWxsIGJhY2sgdG8gY2FjaGUgYWZ0ZXIgNnNcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFswLCAyMDBdIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvLyBNYXBib3ggdGlsZXMgJiBBUEkgXHUyMDE0IHNlcnZlIHN0YWxlIHdoaWxlIHVwZGF0aW5nIGluIGJhY2tncm91bmRcbiAgICAgICAgICAvLyBNYXAgdGlsZXMgYXJlIGxhcmdlIGFuZCBudW1lcm91czsgc3RhbGUtd2hpbGUtcmV2YWxpZGF0ZSBrZWVwc1xuICAgICAgICAgIC8vIHRoZSBtYXAgc25hcHB5IGV2ZW4gb24gc2xvdyBjb25uZWN0aW9ucy5cbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcLy4qXFwubWFwYm94XFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdTdGFsZVdoaWxlUmV2YWxpZGF0ZScsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ21hcGJveCcsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxNTAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogNywgLy8gNyBkYXlzXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgLy8gR29vZ2xlIEZvbnRzIFx1MjAxNCBjYWNoZSBmb3IgYSB5ZWFyICh0aGV5J3JlIHZlcnNpb25lZCwgbmV2ZXIgY2hhbmdlKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC4oZ29vZ2xlYXBpc3xnc3RhdGljKVxcLmNvbVxcLy4qL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dvb2dsZS1mb250cycsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUsIC8vIDEgeWVhclxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZTogeyBzdGF0dXNlczogWzAsIDIwMF0gfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG5cbiAgc2VydmVyOiB7XG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVixTQUFTLG9CQUFvQjtBQUNuWCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUVOLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHTixjQUFjO0FBQUE7QUFBQSxNQUdkLGVBQWUsQ0FBQyxlQUFlLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUs1QyxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEs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
