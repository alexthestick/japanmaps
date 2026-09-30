import { useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  Instagram,
  MapPin,
  ExternalLink,
  Users,
  AlertTriangle,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import type { StoreSuggestion, MainCategory } from '../../types/store';
import { MAIN_CATEGORIES } from '../../lib/constants';
import { getSubCategoryOptions } from '../../utils/subCategoryOptions';
import { Button } from '../common/Button';
import { useSocialEmbed } from '../../hooks/useSocialEmbed';

interface SuggestionReviewCardProps {
  suggestion: StoreSuggestion;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  category: MainCategory;
  onCategoryChange: (category: MainCategory) => void;
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
  onApprove: () => void;
  onReject: () => void;
  onRevertToPending: () => void;
  isPromoting: boolean;
}

/**
 * One suggestion, one card. Collapsed by default so the queue stays
 * scannable and bulk-select stays cheap; expanding a card is the only
 * thing that triggers Google Places photo requests or loads the oEmbed
 * post — per Alex's "lazy photo fetch on card open" requirement, so a
 * 20-row queue doesn't burn Places Photo quota on candidates that get
 * bulk-rejected unseen.
 *
 * Per Alex's explicit design directive, the expanded view's core section
 * is "What They Sell" — notes + embedded source post + (future) IG bio —
 * with map pin / address / everything else demoted to a small secondary
 * strip below it.
 */
export function SuggestionReviewCard({
  suggestion,
  isExpanded,
  onToggleExpand,
  isSelected,
  onToggleSelect,
  category,
  onCategoryChange,
  categories,
  onCategoriesChange,
  onApprove,
  onReject,
  onRevertToPending,
  isPromoting,
}: SuggestionReviewCardProps) {
  const isPending = suggestion.status === 'pending';
  const isOrphanApproved = suggestion.status === 'approved' && !suggestion.promotedStoreId;
  const isPublished = suggestion.status === 'approved' && !!suggestion.promotedStoreId;
  const canApprove = suggestion.geocodeConfidence !== 'none';

  // Only build photo URLs (and only render the oEmbed post) once the card
  // is actually open — this is the "lazy fetch" boundary. Collapsed cards
  // never touch the Places Photo API or Meta's oEmbed HTML.
  const photoUrls = useMemo(() => {
    if (!isExpanded || !suggestion.googlePhotoNames?.length) return [];
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return [];
    return suggestion.googlePhotoNames
      .slice(0, 3)
      .map(
        (name) =>
          `https://places.googleapis.com/v1/${name}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=400`,
      );
  }, [isExpanded, suggestion.googlePhotoNames]);

  useSocialEmbed(isExpanded ? suggestion.oembedHtml : null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isExpanded || !isPending) return;
    const target = e.target as HTMLElement;
    // Don't hijack typing in the category <select> or anywhere else focusable.
    if (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      if (canApprove && !isPromoting) onApprove();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      if (!isPromoting) onReject();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onToggleExpand();
    }
  }

  return (
    <div
      className={`border rounded-lg transition-colors ${
        isSelected ? 'border-blue-400 bg-blue-50/40' : 'border-gray-200 bg-white'
      }`}
      onKeyDown={handleKeyDown}
    >
      {/* ── Collapsed header row — always visible, this is what makes the queue scannable ── */}
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
          aria-label={`Select ${suggestion.storeName}`}
        />

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <h3 className="font-semibold text-gray-900 truncate">{suggestion.storeName}</h3>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                {suggestion.city}
                {suggestion.country ? `, ${suggestion.country}` : ''}
                {suggestion.instagram && (
                  <span className="text-gray-500 inline-flex items-center gap-1">
                    {' · '}
                    <Instagram className="w-3.5 h-3.5 inline" />
                    {suggestion.instagram}
                  </span>
                )}
                {suggestion.followerCount != null && (
                  <span className="text-gray-500"> · {suggestion.followerCount.toLocaleString()} followers</span>
                )}
              </p>
              {/* Notes preview — visible even collapsed, since inventory signal is
                  what determines whether this is worth opening at all. */}
              {!isExpanded && suggestion.notes && (
                <p className="text-sm text-gray-700 ml-6 mt-1 truncate">
                  🛍️ {suggestion.notes}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  suggestion.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : suggestion.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {suggestion.status}
              </span>
              {suggestion.source === 'discovery_bot' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <Bot className="w-3 h-3" />
                  {suggestion.timesSeen > 1 ? `seen ${suggestion.timesSeen}×` : 'bot'}
                </span>
              )}
              {suggestion.geocodeConfidence === 'none' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3" />
                  no coords
                </span>
              )}
              {suggestion.possibleDuplicateOf && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  <AlertTriangle className="w-3 h-3" />
                  possible dup
                </span>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* ── Expanded review body ── */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Core section: what they sell */}
          <div className="border-2 border-gray-900 rounded-lg p-4 bg-gray-50">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              <ShoppingBag className="w-4 h-4" />
              What They Sell
            </h4>

            {suggestion.notes ? (
              <p className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed mb-4">
                {suggestion.notes}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic mb-4">
                No inventory notes on this submission — check the source post and photos below.
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Embedded source post */}
              {suggestion.oembedHtml ? (
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Source post</p>
                  <div
                    className="instagram-embed-wrapper max-w-full overflow-hidden rounded-md"
                    dangerouslySetInnerHTML={{ __html: suggestion.oembedHtml }}
                  />
                </div>
              ) : suggestion.sourceRef ? (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Source post</p>
                  <a
                    href={suggestion.sourceRef}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View original post <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Embed preview unavailable for this post.</p>
                </div>
              ) : null}

              {/* Google Places photos — the lazy-fetched part */}
              {photoUrls.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Photos (from Google Places)
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {photoUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`${suggestion.storeName} photo ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-md border border-gray-200"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!suggestion.oembedHtml && !suggestion.sourceRef && photoUrls.length === 0 && (
              <p className="text-xs text-gray-400">
                No source post or photos captured for this candidate.
              </p>
            )}
          </div>

          {/* Secondary: map pin / address / metadata — intentionally de-emphasized */}
          <div className="text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-3">
            {suggestion.address && (
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {suggestion.address}
                {suggestion.neighborhood ? ` (${suggestion.neighborhood})` : ''}
              </p>
            )}
            {suggestion.website && (
              <p className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <a
                  href={suggestion.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {suggestion.website}
                </a>
              </p>
            )}
            {suggestion.submitterEmail && (
              <p className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 shrink-0" />
                Submitted by {suggestion.submitterName || 'Anonymous'} ({suggestion.submitterEmail})
              </p>
            )}
            {suggestion.reason && <p>Reason: {suggestion.reason}</p>}
            {suggestion.googlePlaceId && (
              <p className="font-mono text-gray-400 truncate">{suggestion.googlePlaceId}</p>
            )}
          </div>

          {suggestion.geocodeConfidence === 'none' && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Google couldn't geocode this candidate — no coordinates, so it can't be approved yet.
              Add a location manually first.
            </p>
          )}

          {suggestion.possibleDuplicateOf && (
            <p className="text-sm text-orange-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Possible duplicate of an existing store (id: {suggestion.possibleDuplicateOf}) — worth
              checking before approving.
            </p>
          )}

          {/* Pending: category + approve/reject */}
          {isPending && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CategoryControls
                category={category}
                onCategoryChange={onCategoryChange}
                categories={categories}
                onCategoriesChange={onCategoriesChange}
              />
              <Button size="sm" disabled={isPromoting || !canApprove} onClick={onApprove}>
                {isPromoting ? 'Publishing…' : 'Approve & Publish'}
              </Button>
              <span className="text-xs text-gray-400">(A)</span>
              <Button size="sm" variant="outline" disabled={isPromoting} onClick={onReject}>
                Reject
              </Button>
              <span className="text-xs text-gray-400">(R)</span>
            </div>
          )}

          {/* Orphan: approved before promoteSuggestion existed, or a promote that
              failed after marking approved. */}
          {isOrphanApproved && (
            <div className="border border-amber-300 bg-amber-50 rounded-md p-3">
              <p className="text-sm text-amber-800 mb-2">
                ⚠️ Marked approved, but no store was ever created for this suggestion.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <CategoryControls
                  category={category}
                  onCategoryChange={onCategoryChange}
                  categories={categories}
                  onCategoriesChange={onCategoriesChange}
                />
                <Button size="sm" disabled={isPromoting || !canApprove} onClick={onApprove}>
                  {isPromoting ? 'Publishing…' : 'Promote now'}
                </Button>
                <Button size="sm" variant="outline" disabled={isPromoting} onClick={onRevertToPending}>
                  Revert to pending
                </Button>
              </div>
            </div>
          )}

          {isPublished && (
            <p className="text-sm text-green-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Published as a store.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Main-category select + sub-category pill picker, shared between the
 * pending and orphan-approved states below. Sub-category options depend
 * on the selected main category (Fashion/Food/Home Goods only — Coffee,
 * Museum and Spots have none, same as AddStoreForm.tsx / EditStoreForm.tsx).
 */
function CategoryControls({
  category,
  onCategoryChange,
  categories,
  onCategoriesChange,
}: {
  category: MainCategory;
  onCategoryChange: (category: MainCategory) => void;
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
}) {
  const subCategoryOptions = getSubCategoryOptions(category);

  const toggleSubCategory = (sub: string) => {
    onCategoriesChange(
      categories.includes(sub) ? categories.filter((c) => c !== sub) : [...categories, sub],
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as MainCategory)}
        className="text-sm border border-gray-300 rounded-md px-2 py-1.5"
      >
        {MAIN_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      {subCategoryOptions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {subCategoryOptions.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => toggleSubCategory(sub)}
              className={`px-2 py-1 rounded-full text-xs capitalize transition-colors ${
                categories.includes(sub)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
