import { X } from 'lucide-react';
import { useEffect } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onApply: () => void;
  onClear?: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  title,
  children,
  onApply,
  onClear,
}: FilterModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with smooth fade - Kirby themed */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal with slide-up animation - Kirby themed */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl animate-slideUp">
        <div className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl border-2 border-cyan-400/40 mx-4 overflow-hidden">
          {/* Film grain */}
          <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

          {/* Corner decorations */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 z-10" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-400/60 z-10" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 z-10" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-400/60 z-10" />

          {/* Header with gradient border */}
          <div className="relative z-10">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <div className="flex items-center justify-between px-8 py-5">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 tracking-tight italic" style={{ textShadow: '0 0 20px rgba(34, 217, 238, 0.3)' }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-cyan-400 hover:text-white transition-all hover:rotate-90 duration-300 p-2 rounded-full hover:bg-cyan-500/20 border border-cyan-400/30"
                style={{ boxShadow: '0 0 10px rgba(34, 217, 238, 0.2)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content with custom scrollbar */}
          <div className="relative z-10 px-8 py-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>

          {/* Footer with Kirby theme */}
          <div className="relative z-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-b from-gray-900/50 to-black/80">
              <div className="flex items-center gap-2">
                {onClear && (
                  <button
                    onClick={onClear}
                    className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-all hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-bold text-gray-300 bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-cyan-400/50 hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onApply();
                    onClose();
                  }}
                  className="relative px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-lg transition-all border-2 border-cyan-300/50 overflow-hidden hover:scale-105"
                  style={{ boxShadow: '0 0 20px rgba(34, 217, 238, 0.4)' }}
                >
                  <div className="absolute inset-0 film-grain opacity-10" />
                  <span className="relative z-10">Apply Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
