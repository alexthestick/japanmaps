import type { Store } from '../../types/store';

interface InstagramCardProps {
  store: Store;
  photoUrl: string;
  format: 'story' | 'post';
  template: 'topBar' | 'minimal';
}

/**
 * Instagram Card Template - renders the branded card for download
 * Hidden from view, captured via html2canvas
 */
export function InstagramCard({ store, photoUrl, format, template }: InstagramCardProps) {
  const isStory = format === 'story';
  const dimensions = isStory
    ? { width: 1080, height: 1920 }
    : { width: 1080, height: 1080 };

  return (
    <div
      className="instagram-card relative overflow-hidden bg-gray-900"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
    >
      {/* Background Photo */}
      <div className="absolute inset-0">
        <img
          src={photoUrl}
          alt={store.name}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        {/* Subtle gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {template === 'topBar' ? (
        // OPTION 1: Top Bar + Bottom Text
        <>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 px-12 py-8 bg-gradient-to-b from-black/40 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-cyan-400" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  LOST IN TRANSIT
                </span>
              </div>
              {/* Small corner bracket */}
              <svg className="w-12 h-12 text-cyan-400/60" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M 32 8 L 56 8 L 56 32" />
              </svg>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="absolute bottom-12 left-12 right-12">
            <h1
              className="text-8xl font-black text-white mb-4 uppercase"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8)',
                letterSpacing: '-0.02em'
              }}
            >
              {store.name}
            </h1>
            <p
              className="text-4xl text-cyan-400 font-bold"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
            >
              {store.neighborhood ? `${store.neighborhood}, ` : ''}{store.city}
            </p>
          </div>
        </>
      ) : (
        // OPTION 2: Minimal - Bottom Text Only
        <>
          {/* Tiny watermark top right */}
          <div className="absolute top-8 right-8 flex items-center gap-2">
            <span className="text-2xl font-black text-white/80" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              L✈T
            </span>
          </div>

          {/* Bottom Text - No Box */}
          <div className="absolute bottom-12 left-12 right-12">
            <h1
              className="text-8xl font-black text-white mb-4 uppercase"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8)',
                letterSpacing: '-0.02em'
              }}
            >
              {store.name}
            </h1>
            <p
              className="text-4xl text-white/90 font-bold"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
            >
              {store.city}{store.neighborhood ? ` • ${store.neighborhood}` : ''}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
