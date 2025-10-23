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
      {/* Backdrop with smooth fade */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal with slide-up animation */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 mx-4 overflow-hidden">
          {/* Header with gradient border */}
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="flex items-center justify-between px-8 py-5">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90 duration-300 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content with custom scrollbar */}
          <div className="px-8 py-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>

          {/* Footer with glass effect */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-b from-gray-50/50 to-white">
              <div className="flex items-center gap-2">
                {onClear && (
                  <button
                    onClick={onClear}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all hover:bg-gray-100 rounded-lg"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onApply();
                    onClose();
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
