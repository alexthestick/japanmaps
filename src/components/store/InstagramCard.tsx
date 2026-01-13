import type { Store } from '../../types/store';

interface InstagramCardProps {
  store: Store;
  photoUrl: string;
  format: 'story' | 'post';
}

/**
 * Instagram Card Template - renders the branded card for download
 * Hidden from view, captured via html2canvas
 */
export function InstagramCard({ store, photoUrl, format }: InstagramCardProps) {
  const isStory = format === 'story';
  const dimensions = isStory
    ? { width: 1080, height: 1920 }
    : { width: 1080, height: 1080 };

  // Get first 2 categories to display
  const displayCategories = store.categories?.slice(0, 2) || [];

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
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
      </div>

      {/* Corner Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left */}
        <svg className="absolute top-8 left-8 w-16 h-16 text-cyan-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M 8 32 L 8 8 L 32 8" />
        </svg>
        {/* Top Right */}
        <svg className="absolute top-8 right-8 w-16 h-16 text-cyan-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M 32 8 L 56 8 L 56 32" />
        </svg>
        {/* Bottom Left */}
        <svg className="absolute bottom-8 left-8 w-16 h-16 text-cyan-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M 8 32 L 8 56 L 32 56" />
        </svg>
        {/* Bottom Right */}
        <svg className="absolute bottom-8 right-8 w-16 h-16 text-cyan-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M 56 32 L 56 56 L 32 56" />
        </svg>
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-12">
        {/* Dark background panel */}
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl p-10 border border-cyan-400/30">
          {/* Store Name */}
          <h1 className="text-7xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            '{store.name}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-4 h-4 bg-orange-500 rounded-full" />
            <p className="text-3xl text-gray-300 uppercase tracking-wider font-medium">
              {store.city} {store.neighborhood && `• ${store.neighborhood}`}
            </p>
          </div>

          {/* Categories */}
          {displayCategories.length > 0 && (
            <div className="flex gap-4 mb-8">
              {displayCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="px-8 py-4 bg-cyan-500/20 border-2 border-cyan-400 rounded-full"
                >
                  <span className="text-2xl font-semibold text-cyan-300">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-cyan-400/20">
            <p className="text-2xl text-cyan-400 font-medium">
              lostintransitjp.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
