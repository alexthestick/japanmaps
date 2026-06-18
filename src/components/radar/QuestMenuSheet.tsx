/**
 * QuestMenuSheet
 *
 * Bottom sheet listing all neighborhood quests. Opens when the user taps
 * the trophy button in radar mode.
 *
 * Layout:
 *   - Header: "Neighborhood Quests" + close button
 *   - Current neighborhood quest pinned at the top (if one exists)
 *   - Remaining quests sorted: in-progress first (by % desc), then unstarted
 *   - Each row: neighborhood name · city · X/Y progress · gold progress bar
 *   - COMPLETE badge replaces progress bar for finished quests
 *   - Tap any row → onQuestTap(neighborhood)
 *
 * z-[202] — above BottomSheet (z-[201]) so it can coexist during the
 * brief animation overlap when transitioning to QuestDetailSheet.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Trophy } from 'lucide-react';
import type { QuestProgress } from '../../hooks/useNeighborhoodQuests';

const GOLD = '#f59e0b';
const GOLD_DIM = 'rgba(245,158,11,0.12)';
const GOLD_BORDER = 'rgba(245,158,11,0.25)';

interface QuestMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** All computed quests keyed by neighborhood */
  questsByNeighborhood: Map<string, QuestProgress>;
  /** Current GPS neighborhood — pinned at top */
  currentNeighborhood: string | null;
  /** The quest the user has explicitly accepted (null = none) */
  activeQuestNeighborhood: string | null;
  /** Tap a quest row to open its detail sheet */
  onQuestTap: (neighborhood: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(q: QuestProgress): number {
  return q.total > 0 ? (q.stamped / q.total) * 100 : 0;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuestRow({
  quest,
  isPinned,
  isActive,
  onClick,
}: {
  quest: QuestProgress;
  isPinned: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const progressPct = pct(quest);

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 transition-colors duration-150 active:bg-white/5"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: isPinned ? 'rgba(245,158,11,0.06)' : 'transparent',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Trophy / status icon */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: quest.isComplete ? GOLD_DIM : 'rgba(255,255,255,0.05)',
            border: `1px solid ${quest.isComplete ? GOLD_BORDER : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {quest.isComplete ? (
            <span style={{ fontSize: 14, color: GOLD }}>★</span>
          ) : (
            <Trophy
              className="w-4 h-4"
              style={{ color: quest.stamped > 0 ? GOLD : 'rgba(255,255,255,0.25)' }}
            />
          )}
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          {/* Neighborhood name */}
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[13px] font-bold leading-tight truncate"
              style={{ color: quest.isComplete ? GOLD : 'rgba(255,255,255,0.9)' }}
            >
              {quest.neighborhood}
            </span>
            {isPinned && (
              <span
                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(34,217,238,0.12)',
                  color: '#22D9EE',
                  border: '1px solid rgba(34,217,238,0.25)',
                }}
              >
                Here
              </span>
            )}
            {isActive && !quest.isComplete && (
              <span
                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(245,158,11,0.15)',
                  color: GOLD,
                  border: `1px solid ${GOLD_BORDER}`,
                }}
              >
                ★ Active
              </span>
            )}
            {quest.isComplete && (
              <span
                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: GOLD_DIM,
                  color: GOLD,
                  border: `1px solid ${GOLD_BORDER}`,
                }}
              >
                Complete
              </span>
            )}
          </div>

          {/* Progress bar */}
          {!quest.isComplete ? (
            <div
              className="rounded-full overflow-hidden"
              style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.07)' }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  borderRadius: 9999,
                  backgroundColor: quest.stamped > 0 ? GOLD : 'rgba(255,255,255,0.15)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          ) : (
            <div
              className="rounded-full overflow-hidden"
              style={{ height: 3, backgroundColor: GOLD_DIM }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 9999,
                  backgroundColor: GOLD,
                  boxShadow: `0 0 6px ${GOLD}88`,
                }}
              />
            </div>
          )}
        </div>

        {/* Counter + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: quest.isComplete ? GOLD : 'rgba(255,255,255,0.35)' }}
          >
            {quest.stamped}/{quest.total}
          </span>
          <ChevronRight
            className="w-4 h-4"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          />
        </div>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function QuestMenuSheet({
  isOpen,
  onClose,
  questsByNeighborhood,
  currentNeighborhood,
  activeQuestNeighborhood,
  onQuestTap,
}: QuestMenuSheetProps) {
  // Split: pinned (current neighborhood) + rest sorted by progress
  const allQuests = [...questsByNeighborhood.values()];

  const pinnedQuest = currentNeighborhood
    ? questsByNeighborhood.get(currentNeighborhood) ?? null
    : null;

  const otherQuests = allQuests
    .filter((q) => q.neighborhood !== currentNeighborhood)
    .sort((a, b) => {
      // Complete last, then sort by progress % desc, then alphabetical
      if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
      return pct(b) - pct(a);
    });

  return (
    <AnimatePresence>
      {isOpen && (
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
              maxHeight: '80vh',
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
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4" style={{ color: GOLD }} />
                <span className="text-[15px] font-black text-white tracking-tight">
                  Neighborhood Quests
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.45)' }} />
              </button>
            </div>

            {/* Quest list */}
            <div className="overflow-y-auto flex-1">
              {/* Pinned: current neighborhood */}
              {pinnedQuest && (
                <>
                  <div
                    className="px-4 pt-3 pb-1"
                    style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}
                  >
                    Current Area
                  </div>
                  <QuestRow
                    quest={pinnedQuest}
                    isPinned
                    isActive={activeQuestNeighborhood === pinnedQuest.neighborhood}
                    onClick={() => onQuestTap(pinnedQuest.neighborhood)}
                  />
                </>
              )}

              {/* Other quests */}
              {otherQuests.length > 0 && (
                <>
                  <div
                    className="px-4 pt-3 pb-1"
                    style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}
                  >
                    {pinnedQuest ? 'Other Areas' : 'All Quests'}
                  </div>
                  {otherQuests.map((q) => (
                    <QuestRow
                      key={q.neighborhood}
                      quest={q}
                      isPinned={false}
                      isActive={activeQuestNeighborhood === q.neighborhood}
                      onClick={() => onQuestTap(q.neighborhood)}
                    />
                  ))}
                </>
              )}

              {allQuests.length === 0 && (
                <div
                  className="flex flex-col items-center justify-center py-16 px-8 text-center"
                >
                  <Trophy className="w-10 h-10 mb-4" style={{ color: 'rgba(255,255,255,0.12)' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No quests available yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
