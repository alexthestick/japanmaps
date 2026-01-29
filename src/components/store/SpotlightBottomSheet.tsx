import { useState, useRef, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import { BottomSheetStoreDetail } from './BottomSheetStoreDetail';
import { SpotlightPeekContent } from '../map/SpotlightPeekContent';
import type { Store } from '../../types/store';
import 'react-spring-bottom-sheet/dist/style.css';

interface SpotlightBottomSheetProps {
  isSpotlightMode: boolean;
  spotlightedStores: Store[];
  selectedStore: Store | null;
  onStoreSelect: (store: Store) => void;
  onDismiss: () => void;
  onClose: () => void;
}

/**
 * PHASE 3 REDESIGN: Unified Bottom Sheet
 *
 * Two modes:
 * 1. Spotlight Peek Mode - Shows 5 recommended stores as horizontal cards
 * 2. Store Detail Mode - Shows individual store details
 *
 * User flow:
 * - Tap "Search This Area" → Peek with 5 cards
 * - Tap a card → Expand to show store details
 * - Swipe down from details → Back to peek
 * - Swipe down from peek → Dismiss spotlight
 */
export function SpotlightBottomSheet({
  isSpotlightMode,
  spotlightedStores,
  selectedStore,
  onStoreSelect,
  onDismiss,
  onClose,
}: SpotlightBottomSheetProps) {
  const sheetRef = useRef<any>();
  const [showPeek, setShowPeek] = useState(false);

  // Determine what to show
  const shouldShowPeek = isSpotlightMode && !selectedStore && spotlightedStores.length > 0;
  const shouldShowStoreDetail = selectedStore !== null;
  const shouldShowSheet = shouldShowPeek || shouldShowStoreDetail;

  // Auto-open peek when spotlight activates
  useEffect(() => {
    if (isSpotlightMode && !selectedStore && spotlightedStores.length > 0) {
      setShowPeek(true);
    } else if (!isSpotlightMode) {
      setShowPeek(false);
    }
  }, [isSpotlightMode, selectedStore, spotlightedStores.length]);

  const handleDismiss = () => {
    if (selectedStore) {
      // If showing store detail, go back to peek
      onClose();
    } else {
      // If showing peek, dismiss spotlight entirely
      setShowPeek(false);
      onDismiss();
    }
  };

  if (!shouldShowSheet) return null;

  // If showing store detail, use the existing BottomSheetStoreDetail
  if (shouldShowStoreDetail) {
    return (
      <BottomSheetStoreDetail
        store={selectedStore}
        onClose={onClose}
      />
    );
  }

  // Otherwise, show spotlight peek
  return (
    <BottomSheet
      open={showPeek}
      onDismiss={handleDismiss}
      ref={sheetRef}
      defaultSnap={({ maxHeight }) => maxHeight * 0.42} // Raised to 42% to clear Safari toolbar
      snapPoints={({ maxHeight }) => [
        maxHeight * 0.42, // LOCKED: Peek only - raised to show category pills above Safari UI
      ]}
      expandOnContentDrag={false} // CRITICAL: Prevent vertical drag expansion
      blocking={false}
      skipInitialTransition={false}
      header={
        <div className="w-full pt-2 pb-2 bg-gray-900">
          <div className="flex justify-center">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>
        </div>
      }
      className="bottom-sheet-custom spotlight-peek-locked"
    >
      <SpotlightPeekContent
        stores={spotlightedStores}
        onStoreSelect={onStoreSelect}
        onDismiss={handleDismiss}
      />
    </BottomSheet>
  );
}
