// vite.config.ts
import { defineConfig } from "file:///sessions/youthful-charming-mendel/mnt/Japan%20Maps/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/youthful-charming-mendel/mnt/Japan%20Maps/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///sessions/youthful-charming-mendel/mnt/Japan%20Maps/node_modules/vite-plugin-pwa/dist/index.js";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMveW91dGhmdWwtY2hhcm1pbmctbWVuZGVsL21udC9KYXBhbiBNYXBzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMveW91dGhmdWwtY2hhcm1pbmctbWVuZGVsL21udC9KYXBhbiBNYXBzL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy95b3V0aGZ1bC1jaGFybWluZy1tZW5kZWwvbW50L0phcGFuJTIwTWFwcy92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG5cbiAgICBWaXRlUFdBKHtcbiAgICAgIC8vIEF1dG8tdXBkYXRlIHRoZSBzZXJ2aWNlIHdvcmtlciBzaWxlbnRseSBpbiB0aGUgYmFja2dyb3VuZC5cbiAgICAgIC8vIFVzZXJzIGdldCBuZXcgY29udGVudCBvbiBuZXh0IHBhZ2UgcmVsb2FkIHdpdGhvdXQgYW55IHByb21wdC5cbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuXG4gICAgICAvLyBGaWxlcyB0byBwcmVjYWNoZSAoYXBwIHNoZWxsIFx1MjAxNCB3b3JrcyBvZmZsaW5lIGFmdGVyIGZpcnN0IHZpc2l0KVxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLnBuZycsICdpY29ucy8qLnBuZyddLFxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgV2ViIEFwcCBNYW5pZmVzdCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICAgIC8vIFRoaXMgaXMgd2hhdCBtYWtlcyB0aGUgYnJvd3NlciBzaG93IHRoZSBcIkFkZCB0byBIb21lIFNjcmVlblwiIHByb21wdC5cbiAgICAgIC8vIE9uIEFuZHJvaWQgaXQgY3JlYXRlcyBhIHByb3BlciBzaG9ydGN1dDsgb24gaU9TIGl0IGVuYWJsZXMgc3RhbmRhbG9uZSBtb2RlLlxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ0xvc3QgaW4gVHJhbnNpdCBKUCcsXG4gICAgICAgIHNob3J0X25hbWU6ICdMSVQgSlAnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIHZpbnRhZ2UsIGFyY2hpdmUgJiBzdHJlZXR3ZWFyIHN0b3JlcyBhY3Jvc3MgSmFwYW4nLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyMwYTBhMGYnLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnIzBhMGEwZicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJywgICAgICAgICAvLyBIaWRlcyB0aGUgYnJvd3NlciBjaHJvbWUgXHUyMDE0IGZlZWxzIGxpa2UgYSBuYXRpdmUgYXBwXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQtcHJpbWFyeScsXG4gICAgICAgIHNjb3BlOiAnLycsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICBjYXRlZ29yaWVzOiBbJ3RyYXZlbCcsICdsaWZlc3R5bGUnLCAnc2hvcHBpbmcnXSxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdpY29ucy9pY29uLTE5Mi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaWNvbnMvaWNvbi01MTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIFwibWFza2FibGVcIiBtZWFucyBBbmRyb2lkIGNhbiBjcm9wL3Jlc2hhcGUgdGhlIGljb24gdG8gZml0IGl0c1xuICAgICAgICAgICAgLy8gaWNvbiBzdHlsZSAoY2lyY2xlLCByb3VuZGVkIHNxdWFyZSwgZXRjLikgd2l0aG91dCB3aGl0ZSBiYXJzXG4gICAgICAgICAgICBzcmM6ICdpY29ucy9pY29uLTUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ21hc2thYmxlJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBzaG9ydGN1dHM6IFtcbiAgICAgICAgICAvLyBTaG9ydGN1dHMgYXBwZWFyIHdoZW4gbG9uZy1wcmVzc2luZyB0aGUgaG9tZSBzY3JlZW4gaWNvbiBvbiBBbmRyb2lkXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Jyb3dzZSBNYXAnLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ01hcCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ09wZW4gdGhlIHN0b3JlIG1hcCcsXG4gICAgICAgICAgICB1cmw6ICcvbWFwP3NvdXJjZT1zaG9ydGN1dCcsXG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiAnaWNvbnMvaWNvbi0xOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJyB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdTYXZlZCBTdG9yZXMnLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ1NhdmVkJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldyB5b3VyIHNhdmVkIHN0b3JlcycsXG4gICAgICAgICAgICB1cmw6ICcvc2F2ZWQ/c291cmNlPXNob3J0Y3V0JyxcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICdpY29ucy9pY29uLTE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInIH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgV29ya2JveCBDYWNoaW5nIFN0cmF0ZWd5IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgICAgLy8gV29ya2JveCBpcyBHb29nbGUncyBzZXJ2aWNlIHdvcmtlciB0b29sa2l0LiBXZSB1c2UgaXQgdG8gY2FjaGUgZGlmZmVyZW50XG4gICAgICAvLyB0eXBlcyBvZiBjb250ZW50IHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXM6XG4gICAgICAvLyAgIENhY2hlRmlyc3QgICAgICBcdTIwMTQgU2VydmUgZnJvbSBjYWNoZSwgb25seSBnbyB0byBuZXR3b3JrIGlmIG5vdCBjYWNoZWQuXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgIEJlc3QgZm9yIGltYWdlcyAmIGZvbnRzIHRoYXQgcmFyZWx5IGNoYW5nZS5cbiAgICAgIC8vICAgTmV0d29ya0ZpcnN0ICAgIFx1MjAxNCBUcnkgbmV0d29yaywgZmFsbCBiYWNrIHRvIGNhY2hlIG9uIGZhaWx1cmUuXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgIEJlc3QgZm9yIEFQSSBkYXRhIHRoYXQgc2hvdWxkIGJlIGZyZXNoIGJ1dCB1c2FibGUgb2ZmbGluZS5cbiAgICAgIC8vICAgU3RhbGVXaGlsZVJldmFsaWRhdGUgXHUyMDE0IFNlcnZlIGZyb20gY2FjaGUgaW5zdGFudGx5LCB0aGVuIHVwZGF0ZSBpbiBiYWNrZ3JvdW5kLlxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBCZXN0IGZvciBtYXAgdGlsZXMgd2hlcmUgc3BlZWQgbWF0dGVycyBtb3JlIHRoYW4gZnJlc2huZXNzLlxuICAgICAgd29ya2JveDoge1xuICAgICAgICAvLyBUYWtlIGNvbnRyb2wgb2YgYWxsIGNsaWVudHMgaW1tZWRpYXRlbHkgb24gYWN0aXZhdGlvbi5cbiAgICAgICAgLy8gV2l0aG91dCB0aGlzLCB0aGUgbmV3IHNlcnZpY2Ugd29ya2VyIHdhaXRzIHVudGlsIGV2ZXJ5IHRhYiBydW5uaW5nXG4gICAgICAgIC8vIHRoZSBvbGQgdmVyc2lvbiBpcyBjbG9zZWQgYmVmb3JlIGl0IGFjdGl2YXRlcyBcdTIwMTQgd2hpY2ggY2FuIHRha2UgaG91cnMuXG4gICAgICAgIC8vIFdpdGggaXQsIHRoZSBuZXcgU1cgYWN0aXZhdGVzIG9uIHRoZSBuZXh0IHBhZ2UgbG9hZCBhZnRlciBkZXBsb3ksXG4gICAgICAgIC8vIHByZXZlbnRpbmcgdGhlIGNodW5rLWhhc2ggbWlzbWF0Y2ggdGhhdCBjYXVzZXMgd2hpdGUgc2NyZWVucy5cbiAgICAgICAgc2tpcFdhaXRpbmc6IHRydWUsXG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcblxuICAgICAgICAvLyBQcmVjYWNoZSBhbGwgYnVpbGQgb3V0cHV0IChKUyBidW5kbGVzLCBDU1MsIEhUTUwsIGZvbnRzLCBpY29ucylcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdvZmYsd29mZjJ9J10sXG5cbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICAvLyBJbWFnZUtpdCBDRE4gaW1hZ2VzIFx1MjAxNCBjYWNoZSBhZ2dyZXNzaXZlbHkgZm9yIDMwIGRheXMuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBJTVBPUlRBTlQgXHUyMDE0IGNyZWRlbnRpYWxzOiAnb21pdCcgaXMgcmVxdWlyZWQgaGVyZS5cbiAgICAgICAgICAvLyBUaGUgc2VydmljZSB3b3JrZXIgaW50ZXJjZXB0cyA8aW1nPiByZXF1ZXN0cyBhbmQgcmUtZmV0Y2hlcyB0aGVtLlxuICAgICAgICAgIC8vIFdpdGhvdXQgZXhwbGljaXRseSBvbWl0dGluZyBjcmVkZW50aWFscywgYnJvd3NlcnMgc2VuZCBjb29raWVzXG4gICAgICAgICAgLy8gYWxvbmcgd2l0aCB0aGUgY3Jvc3Mtb3JpZ2luIHJlcXVlc3QuIEltYWdlS2l0IHJlc3BvbmRzIHdpdGhcbiAgICAgICAgICAvLyBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW46ICogd2hpY2ggYnJvd3NlcnMgcmVqZWN0IHdoZW5cbiAgICAgICAgICAvLyBjcmVkZW50aWFscyBhcmUgcHJlc2VudCBcdTIwMTQgY2F1c2luZyBldmVyeSBpbWFnZSB0byBmYWlsIHdpdGggYVxuICAgICAgICAgIC8vIENPUlMgZXJyb3IuICdvbWl0JyB0ZWxscyB0aGUgU1cgbmV2ZXIgdG8gc2VuZCBjcmVkZW50aWFscyBmb3JcbiAgICAgICAgICAvLyBJbWFnZUtpdCByZXF1ZXN0cywgd2hpY2ggaXMgY29ycmVjdCBzaW5jZSBJSyBuZWVkcyBubyBhdXRoLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gc3RhdHVzZXM6IFsyMDBdIG9ubHkgXHUyMDE0IG5ldmVyIGNhY2hlIG9wYXF1ZSAoc3RhdHVzIDApIHJlc3BvbnNlcy5cbiAgICAgICAgICAvLyBPcGFxdWUgcmVzcG9uc2VzIGJyZWFrIGNhbnZhcy1iYXNlZCBleHBvcnRzIChodG1sLXRvLWltYWdlKS5cbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2lrXFwuaW1hZ2VraXRcXC5pb1xcLy4qL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2ltYWdla2l0LWltYWdlcycsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAzMDAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzAsIC8vIDMwIGRheXNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFsyMDBdIH0sXG4gICAgICAgICAgICAgIGZldGNoT3B0aW9uczogeyBtb2RlOiAnY29ycycsIGNyZWRlbnRpYWxzOiAnb21pdCcgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIC8vIFN1cGFiYXNlIEFQSSBcdTIwMTQgdHJ5IG5ldHdvcmsgZmlyc3QsIGZhbGwgYmFjayB0byBsYXN0LWtub3duIGRhdGFcbiAgICAgICAgICAvLyBUaGlzIG1lYW5zIGlmIHNvbWVvbmUgb3BlbnMgdGhlIGFwcCBvbiB0aGUgc3Vid2F5IHdpdGggbm8gc2lnbmFsLFxuICAgICAgICAgIC8vIHRoZXknbGwgc3RpbGwgc2VlIHRoZSBzdG9yZSBsaXN0IGZyb20gdGhlaXIgbGFzdCBzZXNzaW9uLlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC5zdXBhYmFzZVxcLmNvXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdzdXBhYmFzZS1hcGknLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogNTAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0LCAvLyAyNCBob3Vyc1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBuZXR3b3JrVGltZW91dFNlY29uZHM6IDYsIC8vIEZhbGwgYmFjayB0byBjYWNoZSBhZnRlciA2c1xuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZTogeyBzdGF0dXNlczogWzAsIDIwMF0gfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIC8vIE1hcGJveCB0aWxlcyAmIEFQSSBcdTIwMTQgc2VydmUgc3RhbGUgd2hpbGUgdXBkYXRpbmcgaW4gYmFja2dyb3VuZFxuICAgICAgICAgIC8vIE1hcCB0aWxlcyBhcmUgbGFyZ2UgYW5kIG51bWVyb3VzOyBzdGFsZS13aGlsZS1yZXZhbGlkYXRlIGtlZXBzXG4gICAgICAgICAgLy8gdGhlIG1hcCBzbmFwcHkgZXZlbiBvbiBzbG93IGNvbm5lY3Rpb25zLlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC5tYXBib3hcXC5jb21cXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ1N0YWxlV2hpbGVSZXZhbGlkYXRlJyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnbWFwYm94JyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDE1MCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiA3LCAvLyA3IGRheXNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFswLCAyMDBdIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvLyBHb29nbGUgRm9udHMgXHUyMDE0IGNhY2hlIGZvciBhIHllYXIgKHRoZXkncmUgdmVyc2lvbmVkLCBuZXZlciBjaGFuZ2UpXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLihnb29nbGVhcGlzfGdzdGF0aWMpXFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnZ29vZ2xlLWZvbnRzJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSwgLy8gMSB5ZWFyXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcblxuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVVLFNBQVMsb0JBQW9CO0FBQ3BXLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFHeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBRU4sUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUdOLGNBQWM7QUFBQTtBQUFBLE1BR2QsZUFBZSxDQUFDLGVBQWUsYUFBYTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSzVDLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQTtBQUFBLFFBQ1QsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsTUFBTTtBQUFBLFFBQ04sWUFBWSxDQUFDLFVBQVUsYUFBYSxVQUFVO0FBQUEsUUFDOUMsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUE7QUFBQTtBQUFBLFlBR0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsUUFDQSxXQUFXO0FBQUE7QUFBQSxVQUVUO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPLENBQUMsRUFBRSxL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
