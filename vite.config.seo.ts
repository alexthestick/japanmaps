/**
 * Vite config for SEO builds with pre-rendering
 *
 * Use this config when you want to pre-render all pages for SEO.
 * Build time: ~10-15 minutes (renders all 868+ store pages)
 *
 * Usage: npm run build:seo
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePrerender from 'vite-plugin-prerender'
import { getPrerenderRoutes } from './scripts/get-prerender-routes.js'
import path from 'path'

export default defineConfig(async () => {
  // Fetch all routes from Supabase
  const routes = await getPrerenderRoutes()

  return {
    plugins: [
      react(),
      vitePrerender({
        routes,
        renderer: '@prerenderer/renderer-puppeteer',
        rendererOptions: {
          // Wait for network to be idle before capturing
          renderAfterTime: 5000,
          // Disable sandbox for Vercel compatibility
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        postProcess(renderedRoute) {
          // Add a comment to identify pre-rendered pages
          renderedRoute.html = renderedRoute.html.replace(
            '</head>',
            '<!-- Pre-rendered for SEO --></head>'
          )
          return renderedRoute
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
    build: {
      outDir: 'dist',
    },
  }
})
