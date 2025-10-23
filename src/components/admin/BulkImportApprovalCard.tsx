import { useState } from 'react';
import { Check, X, SkipForward, AlertCircle, Edit2, Loader, Search } from 'lucide-react';
import type { BulkImportQueueItem } from '../../types/bulkImport';
import type { MainCategory, SubCategory } from '../../types/store';
import { MAIN_CATEGORIES, FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, COFFEE_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES, MUSEUM_SUB_CATEGORIES } from '../../lib/constants';
import { Button } from '../common/Button';

interface BulkImportApprovalCardProps {
  item: BulkImportQueueItem;
  onApprove: (mainCategory: MainCategory, subCategories: SubCategory[], customDescription?: string, city?: string, neighborhood?: string) => void;
  onSkip: () => void;
  onMarkForReview: () => void;
  onRetryWithPlaceId?: (placeId: string) => void;
  isProcessing?: boolean;
}

export function BulkImportApprovalCard({
  item,
  onApprove,
  onSkip,
  onMarkForReview,
  onRetryWithPlaceId,
  isProcessing = false,
}: BulkImportApprovalCardProps) {
  const [mainCategory, setMainCategory] = useState<MainCategory>('Food');
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [description, setDescription] = useState(item.enhancedData?.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showManualPlaceId, setShowManualPlaceId] = useState(false);
  const [manualPlaceId, setManualPlaceId] = useState('');

  // City and Neighborhood inputs
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  // Get sub-categories based on main category
  const getSubCategories = (): readonly string[] => {
    switch (mainCategory) {
      case 'Fashion':
        return FASHION_SUB_CATEGORIES;
      case 'Food':
        return FOOD_SUB_CATEGORIES;
      case 'Coffee':
        return COFFEE_SUB_CATEGORIES;
      case 'Home Goods':
        return HOME_GOODS_SUB_CATEGORIES;
      case 'Museum':
        return MUSEUM_SUB_CATEGORIES;
      default:
        return [];
    }
  };

  const availableSubCategories = getSubCategories();

  // Toggle sub-category selection
  const toggleSubCategory = (category: string) => {
    setSubCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle approve
  const handleApprove = () => {
    if (!city.trim()) {
      alert('Please enter a city');
      return;
    }

    // Require sub-categories only for Fashion and Food
    if ((mainCategory === 'Fashion' || mainCategory === 'Food') && subCategories.length === 0) {
      alert(`Please select at least one ${mainCategory} sub-category`);
      return;
    }

    onApprove(
      mainCategory,
      subCategories as SubCategory[],
      isEditingDescription ? description : undefined,
      city.trim(),
      neighborhood.trim() || undefined
    );
  };

  // Handle manual Place ID input
  const handleManualPlaceIdSubmit = () => {
    if (!manualPlaceId.trim()) {
      alert('Please enter a Place ID or Google Maps URL');
      return;
    }

    // Extract Place ID from URL if needed
    let placeId = manualPlaceId.trim();

    // If it's a URL, extract the Place ID
    if (placeId.includes('maps.google.com') || placeId.includes('google.com/maps')) {
      const chijMatch = placeId.match(/ChIJ[\w-]+/);
      if (chijMatch) {
        placeId = chijMatch[0];
      } else {
        alert('Could not extract Place ID from URL. Please paste the ChIJ... format Place ID directly.');
        return;
      }
    }

    // Validate it looks like a Place ID
    if (!placeId.startsWith('ChIJ')) {
      alert('Invalid Place ID format. Should start with "ChIJ"');
      return;
    }

    // Call retry handler
    if (onRetryWithPlaceId) {
      onRetryWithPlaceId(placeId);
      setShowManualPlaceId(false);
      setManualPlaceId('');
    }
  };

  // Keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleApprove();
    } else if (e.key === 's' && e.metaKey) {
      e.preventDefault();
      onSkip();
    }
  };

  // Status badge
  const renderStatusBadge = () => {
    switch (item.status) {
      case 'searching':
        return (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Loader className="w-4 h-4 animate-spin" />
            Searching for Place ID...
          </div>
        );
      case 'enhancing':
        return (
          <div className="flex items-center gap-2 text-purple-600 text-sm">
            <Loader className="w-4 h-4 animate-spin" />
            AI enhancing description...
          </div>
        );
      case 'duplicate':
        return (
          <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 px-3 py-1 rounded-full">
            <AlertCircle className="w-4 h-4" />
            Duplicate detected
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-1 rounded-full">
              <X className="w-4 h-4" />
              Error: {item.error}
            </div>
            <p className="text-xs text-red-600">
              👇 Enter Place ID manually below to retry
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white rounded-lg border-2 border-gray-200 shadow-lg p-6 space-y-6"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {item.placeName || item.csvData.title}
          </h2>
          <p className="text-gray-600 mt-1">
            {item.placeAddress || item.csvData.address || 'Address not found'}
          </p>
          {item.csvData.neighborhood && (
            <p className="text-gray-500 text-sm mt-1">
              📍 {item.csvData.neighborhood}
            </p>
          )}
        </div>
        {renderStatusBadge()}
      </div>

      {/* Manual Place ID Input - Show when failed or when user wants to override */}
      {(item.status === 'failed' || showManualPlaceId) && (
        <div className={`border-2 rounded-lg p-4 space-y-3 ${
          item.status === 'failed'
            ? 'bg-red-50 border-red-300'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${
              item.status === 'failed' ? 'text-red-900' : 'text-blue-900'
            }`}>
              <Search className="w-4 h-4" />
              {item.status === 'failed' ? '⚠️ Manual Place ID Required' : 'Manual Place ID Input'}
            </h3>
            {!item.status.includes('failed') && (
              <button
                onClick={() => setShowManualPlaceId(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
          <p className={`text-sm ${item.status === 'failed' ? 'text-red-700 font-medium' : 'text-blue-700'}`}>
            {item.status === 'failed'
              ? '🔍 Search this store on Google Maps, copy the URL, and paste it below:'
              : 'Paste a Google Maps URL or Place ID (ChIJ format)'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualPlaceId}
              onChange={(e) => setManualPlaceId(e.target.value)}
              placeholder="ChIJ... or https://maps.google.com/..."
              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleManualPlaceIdSubmit();
                }
              }}
            />
            <Button
              onClick={handleManualPlaceIdSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              <Search className="w-4 h-4 mr-2" />
              Fetch Data
            </Button>
          </div>
        </div>
      )}

      {/* Show "Can't find it?" button when not in failed state and manual input is hidden */}
      {item.status !== 'failed' && !showManualPlaceId && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowManualPlaceId(true)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Search className="w-3 h-3" />
            Wrong store? Enter Place ID manually
          </button>
        </div>
      )}

      {/* Photos */}
      {item.placeDetails?.photos && item.placeDetails.photos.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Photos ({item.placeDetails.photos.length})
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {item.placeDetails.photos.slice(0, 5).map((photo: any, idx: number) => (
              <img
                key={idx}
                src={`https://places.googleapis.com/v1/${photo.name}/media?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&maxHeightPx=200&maxWidthPx=200`}
                alt={`Photo ${idx + 1}`}
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <button
            onClick={() => setIsEditingDescription(!isEditingDescription)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            {isEditingDescription ? 'Cancel Edit' : 'Edit'}
          </button>
        </div>

        {isEditingDescription ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              {description || 'No description available'}
            </p>
          </div>
        )}
      </div>

      {/* City and Neighborhood */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Tokyo, Osaka, Kyoto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Neighborhood
          </label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="e.g., Shibuya, Harajuku"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Main Category *
        </label>
        <div className="flex gap-2">
          {MAIN_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setMainCategory(cat);
                setSubCategories([]); // Reset sub-categories when main changes
              }}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                mainCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Categories */}
      {availableSubCategories.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {mainCategory} Categories * (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSubCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleSubCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  subCategories.includes(cat)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        {item.enhancedData?.instagram && (
          <div>
            <p className="text-xs text-gray-500">Instagram</p>
            <p className="text-sm font-medium text-gray-900">
              {item.enhancedData.instagram}
            </p>
          </div>
        )}
        {item.placeDetails?.website && (
          <div>
            <p className="text-xs text-gray-500">Website</p>
            <a
              href={item.placeDetails.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline truncate block"
            >
              {item.placeDetails.website}
            </a>
          </div>
        )}
        {item.placeDetails?.rating && (
          <div>
            <p className="text-xs text-gray-500">Rating</p>
            <p className="text-sm font-medium text-gray-900">
              ⭐ {item.placeDetails.rating} ({item.placeDetails.userRatingCount} reviews)
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleApprove}
          disabled={
            isProcessing || ((mainCategory === 'Fashion' || mainCategory === 'Food') && subCategories.length === 0)
          }
          className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300"
        >
          <Check className="w-5 h-5 mr-2" />
          Approve & Save
          <span className="ml-2 text-xs opacity-75">(Enter)</span>
        </Button>

        <Button
          onClick={onSkip}
          disabled={isProcessing}
          variant="outline"
          className="flex-1"
        >
          <SkipForward className="w-5 h-5 mr-2" />
          Skip
          <span className="ml-2 text-xs opacity-75">(⌘S)</span>
        </Button>

        <Button
          onClick={onMarkForReview}
          disabled={isProcessing}
          variant="outline"
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          Mark for Review
        </Button>
      </div>

      {/* Validation Warning */}
      {(mainCategory === 'Fashion' || mainCategory === 'Food') && subCategories.length === 0 && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          Please select at least one {mainCategory} category to approve
        </div>
      )}
    </div>
  );
}
