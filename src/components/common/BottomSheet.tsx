import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Mobile bottom sheet that slides up from the bottom.
 *
 * Scroll lock uses the position:fixed trick instead of overflow:hidden.
 * overflow:hidden on body does not prevent scroll on iOS Safari — the page
 * continues to scroll via touch momentum. The fix: save the current scrollY,
 * fix the body at that position, then restore on close.
 *
 * dvh (dynamic viewport height) instead of vh accounts for Safari's
 * collapsible bottom toolbar — vh is calculated from the full viewport
 * (toolbar hidden) so the sheet clips when the toolbar is visible.
 */
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      // Save current scroll position before locking
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position on close
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — z-[200] clears all page stacking contexts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[201]"
          >
            {/* dvh = dynamic viewport height, updates as Safari toolbar shows/hides */}
            <div className="bg-gray-900 rounded-t-3xl shadow-2xl border-t-2 border-cyan-400/30 max-h-[80dvh] overflow-hidden">
              {/* Kirby neon glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-sm" />
              </div>

              {/* Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-cyan-400/20 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
                  {title}
                </h2>
                {/* p-3 gives a 44px+ tap target (Apple HIG minimum) */}
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-gray-800 rounded-lg transition-colors active:scale-95"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content — dvh matches the container */}
              <div className="overflow-y-auto max-h-[calc(80dvh-80px)] px-6 py-4 custom-scrollbar">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
