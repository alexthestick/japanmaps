/**
 * SpotlightBottomSheet — Framer Motion rewrite
 *
 * Replaces the react-spring-bottom-sheet version which crashed on React 18.
 *
 * Two modes (same logic as original):
 *  1. Peek mode  — spotlight active, no store selected → fixed-height sheet at ~42dvh
 *  2. Detail mode — store selected → delegates to BottomSheetStoreDetail
 *
 * Swipe down the peek sheet to dismiss spotlight.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomSheetStoreDetail } from './BottomSheetStoreDetail';
import { SpotlightPeekContent } from '../map/SpotlightPeekContent';
import type { Store } from '../../types/store';

interface SpotlightBottomSheetProps {
  isSpotlightMode: boolean;
  spotlightedStores: Store[];
  selectedStore: Store | null;
  onStoreSelect: (store: Store) => void;
  onDismiss: () => void;
  onClose: () => void;
  isStamped?: boolean;
  isExploreMode?: boolean;
}

export function SpotlightBottomSheet({
  isSpotlightMode,
  spotlightedStores,
  selectedStore,
  onStoreSelect,
  onDismiss,
  onClose,
  isStamped,
  isExploreMode = false,
}: SpotlightBottomSheetProps) {
  const [showPeek, setShowPeek] = useState(false);

  const shouldShowPeek = isSpotlightMode && !selectedStore && spotlightedStores.length > 0;
  const shouldShowStoreDetail = selectedStore !== null;

  useEffect(() => {
    if (isSpotlightMode && !selectedStore && spotlightedStores.length > 0) {
      setShowPeek(true);
    } else if (!isSpotlightMode) {
      setShowPeek(false);
    }
  }, [isSpotlightMode, selectedStore, spotlightedStores.length]);

  const handleDismiss = () => {
    if (selectedStore) {
      onClose();
    } else {
      setShowPeek(false);
      onDismiss();
    }
  };

  // Store detail mode — delegate entirely
  if (shouldShowStoreDetail) {
    return <BottomSheetStoreDetail store={selectedStore} onClose={onClose} isStamped={isStamped} isExploreMode={isExploreMode} />;
  }

  // Peek mode — fixed height Framer Motion sheet, swipe down to dismiss
  return (
    <AnimatePresence>
      {shouldShowPeek && showPeek && (
        <motion.div
          key="spotlight-peek"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0 }}   // can't drag upward
          dragElastic={{ top: 0, bottom: 0.25 }}
          onDragEnd={(_, info) => {
            // Dismiss on fast downward flick or drag past 80px threshold
            if (info.velocity.y > 400 || info.offset.y > 80) {
              handleDismiss();
            }
          }}
          className="fixed bottom-0 left-0 right-0 z-[201] bg-gray-900 rounded-t-3xl"
          style={{ height: '42dvh', touchAction: 'none' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>

          {/* Content — fills remaining height */}
          <div className="h-[calc(42dvh-28px)] overflow-hidden">
            <SpotlightPeekContent
              stores={spotlightedStores}
              onStoreSelect={onStoreSelect}
              onDismiss={handleDismiss}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
