import { X, Dices, ArrowRight, RotateCcw } from 'lucide-react';
import type { Store } from '../../types/store';
import { MAIN_CATEGORY_COLORS } from '../../lib/constants';

interface RandomStoreModalProps {
  store: Store;
  onClose: () => void;
  onSpinAgain: () => void;
  onViewStore: () => void;
}

export function RandomStoreModal({
  store,
  onClose,
  onSpinAgain,
  onViewStore,
}: RandomStoreModalProps) {
  const categoryColor = store.mainCategory
    ? MAIN_CATEGORY_COLORS[store.mainCategory as keyof typeof MAIN_CATEGORY_COLORS]
    : '#00D9FF';

  const hasImage = store.photos && store.photos.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Image-first design, taller aspect ratio */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border-2 border-cyan-400/50 shadow-2xl max-w-md w-full overflow-hidden"
           style={{ boxShadow: '0 0 40px rgba(34, 217, 238, 0.3)' }}>
        {/* Film grain */}
        <div className="absolute inset-0 film-grain opacity-20 pointer-events-none z-10" />

        {/* Hero Image Section */}
        <div className="relative">
          {hasImage ? (
            <div className="relative h-96">
              <img
                src={store.photos![0]}
                alt={store.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-6xl opacity-30">📍</span>
            </div>
          )}

          {/* Close button - top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Random Pick badge - top left */}
          <div className="absolute top-4 left-4 z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-cyan-400/50">
              <Dices className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-bold text-cyan-300">Random Pick!</span>
            </div>
          </div>

          {/* Store info overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
            {/* Category badge */}
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
              style={{ backgroundColor: categoryColor }}
            >
              {store.mainCategory}
            </span>

            {/* Store name */}
            <h2 className="text-2xl font-black text-white mb-1"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {store.name}
            </h2>

            {/* Japanese name if available */}
            {store.nameJapanese && (
              <p className="text-white/70 text-sm mb-1">{store.nameJapanese}</p>
            )}

            {/* Location */}
            <p className="text-white/60 text-sm">
              {store.neighborhood && `${store.neighborhood}, `}{store.city}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative p-5 pt-4">
          {/* Description */}
          {store.description && (
            <p className="text-gray-300 text-sm line-clamp-2 mb-5">
              {store.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Spin Again */}
            <button
              onClick={onSpinAgain}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-cyan-400/50 text-cyan-300 font-bold text-sm hover:bg-cyan-500/20 hover:border-cyan-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Spin Again
            </button>

            {/* View Store */}
            <button
              onClick={onViewStore}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center justify-center gap-2 border-2 border-cyan-300/50"
              style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}
            >
              View Store
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Back to list link */}
          <button
            onClick={onClose}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Back to list
          </button>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40 z-30 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-400/40 z-30 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-400/40 z-30 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40 z-30 pointer-events-none" />
      </div>
    </div>
  );
}
