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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border-2 border-cyan-400/50 shadow-2xl max-w-md w-full overflow-hidden"
           style={{ boxShadow: '0 0 40px rgba(34, 217, 238, 0.3)' }}>
        {/* Film grain */}
        <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-400/60" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-400/60" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="relative p-6 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/50 mb-4">
            <Dices className="w-5 h-5 text-cyan-300" />
            <span className="text-sm font-bold text-cyan-300 italic">Random Pick!</span>
          </div>
          <h2 className="text-2xl font-black text-white italic"
              style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}>
            {store.name}
          </h2>
          {store.nameJapanese && (
            <p className="text-gray-400 text-sm mt-1">{store.nameJapanese}</p>
          )}
        </div>

        {/* Store Image */}
        {store.photos && store.photos.length > 0 && (
          <div className="relative mx-6 rounded-xl overflow-hidden border-2 border-cyan-400/30">
            <img
              src={store.photos[0]}
              alt={store.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Store Details */}
        <div className="relative p-6 space-y-3">
          {/* Category badge */}
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {store.mainCategory}
            </span>
            {store.category && store.category !== store.mainCategory && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                {store.category}
              </span>
            )}
          </div>

          {/* Location */}
          <p className="text-gray-400 text-sm">
            {store.neighborhood && `${store.neighborhood}, `}{store.city}
          </p>

          {/* Description snippet */}
          {store.description && (
            <p className="text-gray-300 text-sm line-clamp-2">
              {store.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative p-6 pt-2 flex gap-3">
          {/* Spin Again */}
          <button
            onClick={onSpinAgain}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-cyan-400/50 text-cyan-300 font-bold text-sm hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
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
        <div className="relative px-6 pb-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Back to list
          </button>
        </div>
      </div>
    </div>
  );
}
