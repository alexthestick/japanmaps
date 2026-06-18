/**
 * QuestDetailSheet
 *
 * Bottom sheet showing the full store list for a single neighborhood quest.
 * Opened from QuestMenuSheet when the user taps a quest row.
 *
 * Layout:
 *   - Header: back button + quest neighborhood name + close button
 *   - Progress summary: "X of Y stores stamped" + gold progress bar
 *   - Scrollable store list:
 *       ✓ (gold, stamped)  or  ○ (dim, unstamped)
 *       Store name, tap → onStoreTap(storeId, lat, lng) + closes sheet
 *   - Footer: "Read the guide →" links to /blog/{questSlug}
 *
 * z-[202] — same as QuestMenuSheet; they never coexist (menu closes before
 * detail opens via the onQuestTap handler in HomePage).
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, BookOpen, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { QuestProgress, QuestStore } from '../../hooks/useNeighborhoodQuests';

const GOLD = '#f59e0b';
const GOLD_DIM = 'rgba(245,158,11,0.12)';
const GOLD_BORDER = 'rgba(245,158,11,0.22)';

interface QuestDetailSheetProps {
  isOpen: boolean;
  /** The quest to display — null means don't render content */
  quest: QuestProgress | null;
  /** Set of all store IDs the user has ever stamped */
  stampedStoreIds: Set<string>;
  /** Called to go back to QuestMenuSheet */
  onBack: () => void;
  /** Called to close everything */
  onClose: () => void;
  /** Called when user taps a store — parent flies map to it + closes sheets */
  onStoreTap: (store: QuestStore) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StoreRow({
  store,
  isStamped,
  onTap,
}: {
  store: QuestStore;
  isStamped: boolean;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 active:bg-white/5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Stamp indicator */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: isStamped ? GOLD_DIM : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${isStamped ? GOLD_BORDER : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {isStamped ? (
          <span style={{ fontSize: 12, color: GOLD, lineHeight: 1 }}>✓</span>
        ) : (
          <MapPin
            className="w-3 h-3"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          />
        )}
      </div>

      {/* Store name */}
      <span
        className="flex-1 text-[13px] font-medium leading-tight truncate"
        style={{
          color: isStamped ? 'rgba(245,158,11,0.75)' : 'rgba(255,255,255,0.75)',
          textDecoration: isStamped ? 'line-through' : 'none',
          textDecorationColor: 'rgba(245,158,11,0.4)',
        }}
      >
        {store.storeName}
      </span>

      {/* Fly-to hint */}
      {!isStamped && (
        <span
          className="text-[10px] flex-shrink-0 font-medium"
          style={{ color: 'rgba(255,255,255,0.18)' }}
        >
          ↗
        </span>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function QuestDetailSheet({
  isOpen,
  quest,
  stampedStoreIds,
  onBack,
  onClose,
  onStoreTap,
}: QuestDetailSheetProps) {
  const navigate = useNavigate();

  const progressPct = quest && quest.total > 0
    ? Math.min(100, (quest.stamped / quest.total) * 100)
    : 0;

  // Sort: unstamped first, stamped at bottom
  const sortedStores = quest
    ? [...quest.questStores].sort((a, b) => {
        const aStamped = stampedStoreIds.has(a.storeId) ? 1 : 0;
        const bStamped = stampedStoreIds.has(b.storeId) ? 1 : 0;
        return aStamped - bStamped;
      })
    : [];

  return (
    <AnimatePresence>
      {isOpen && quest && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[201]"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed left-0 right-0 bottom-0 z-[202] flex flex-col rounded-t-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(6, 8, 14, 0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              maxHeight: '85vh',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div
                className="rounded-full"
                style={{ width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>

            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Back button */}
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                aria-label="Back to quests"
              >
                <ArrowLeft className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.55)' }} />
              </button>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-0.5"
                  style={{ color: 'rgba(245,158,11,0.6)' }}
                >
                  Neighborhood Quest
                </p>
                <h2
                  className="text-[16px] font-black italic text-white leading-tight truncate"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {quest.neighborhood}
                </h2>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.45)' }} />
              </button>
            </div>

            {/* Progress summary */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {quest.isComplete
                    ? `All ${quest.total} stores stamped ✓`
                    : `${quest.stamped} of ${quest.total} stores stamped`}
                </span>
                <span
                  className="text-[12px] font-black tabular-nums"
                  style={{ color: GOLD }}
                >
                  {Math.round(progressPct)}%
                </span>
              </div>

              {/* Gold progress bar */}
              <div
                className="rounded-full overflow-hidden"
                style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
                  style={{
                    height: '100%',
                    borderRadius: 9999,
                    backgroundColor: GOLD,
                    boxShadow: progressPct > 0 ? `0 0 8px ${GOLD}88` : 'none',
                  }}
                />
              </div>
            </div>

            {/* Store list */}
            <div className="overflow-y-auto flex-1">
              {sortedStores.map((store) => (
                <StoreRow
                  key={store.storeId}
                  store={store}
                  isStamped={stampedStoreIds.has(store.storeId)}
                  onTap={() => onStoreTap(store)}
                />
              ))}
            </div>

            {/* Footer: Read guide CTA */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <button
                onClick={() => {
                  onClose();
                  navigate(`/blog/${quest.questSlug}`);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-[13px] transition-all duration-200 active:scale-[0.98]"
                style={{
                  backgroundColor: GOLD_DIM,
                  color: GOLD,
                  border: `1px solid ${GOLD_BORDER}`,
                }}
              >
                <BookOpen className="w-4 h-4" />
                Read the guide →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
