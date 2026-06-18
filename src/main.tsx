import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/common/AppErrorBoundary.tsx'

// ── Service worker update handler ───────────────────────────────────────────
// When a new service worker activates and claims this tab, the old HTML is
// still loaded and references old chunk hashes that no longer exist on the
// server. Reloading immediately after the SW controller changes ensures the
// user gets the new HTML (with new hashes) on the very next page load — no
// white screen, no manual refresh required.
if ('serviceWorker' in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloading) {
      reloading = true;
      window.location.reload();
    }
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </HelmetProvider>
    </AppErrorBoundary>
  </StrictMode>,
)


