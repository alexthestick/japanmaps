import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props { children: ReactNode }
interface State { hasError: boolean; isChunkError: boolean }

/**
 * Top-level error boundary that catches two cases:
 *
 * 1. ChunkLoadError — happens when the service worker serves old cached JS
 *    chunks after a new deploy. The old filenames no longer exist so React
 *    Router can't lazy-load the new page, causing a white screen. We catch
 *    this and show a "tap to reload" prompt instead.
 *
 * 2. Any other render error — shows a generic recovery UI.
 *
 * Note: Error boundaries must be class components (React requirement).
 */
export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Importing a module script failed');

    return { hasError: true, isChunkError };
  }

  handleReload = () => {
    // Clear any stale SW caches then hard-reload so the new chunks are fetched
    if ('caches' in window) {
      caches.keys().then(keys =>
        Promise.all(keys.map(k => caches.delete(k)))
      ).finally(() => window.location.reload());
    } else {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          {/* Neon glow decoration */}
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center mx-auto mb-6"
               style={{ boxShadow: '0 0 30px rgba(34, 217, 238, 0.3)' }}>
            <RefreshCw className="w-7 h-7 text-cyan-400" />
          </div>

          <h1 className="text-xl font-black italic text-white mb-3"
              style={{ textShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}>
            {this.state.isChunkError ? 'App Updated' : 'Something went wrong'}
          </h1>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {this.state.isChunkError
              ? 'A new version of Lost in Transit was deployed. Tap below to load the latest version.'
              : 'An unexpected error occurred. Reloading usually fixes it.'}
          </p>

          <button
            onClick={this.handleReload}
            className="px-8 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all border-2 border-cyan-300/50"
            style={{ boxShadow: '0 0 30px rgba(34, 217, 238, 0.4)' }}
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
