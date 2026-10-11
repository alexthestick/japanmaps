import { useState } from 'react';
import { Sparkles, MapPin, AlertCircle, Download, Loader } from 'lucide-react';
import { importStoreFromGoogle, extractCity, extractNeighborhood, detectMainCategory } from '../../utils/importStore';

interface GoogleMapsStoreExtractorProps {
  onApplyData: (data: ExtractedStoreData) => void;
}

export interface ExtractedStoreData {
  name: string;
  address: string;
  city: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  description: string;
  hours?: string;
  website?: string;
  priceRange?: string;
  categories?: string[];
  mainCategory?: string;
  instagram?: string;
  placeId?: string;
}

export function GoogleMapsStoreExtractor({ onApplyData }: GoogleMapsStoreExtractorProps) {
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedStoreData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!googleMapsUrl.trim()) {
      setError('Please enter a Google Maps URL or Place ID');
      return;
    }

    setLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      // Step 1: Import store from serverless function
      console.log('🔄 Importing store via serverless function...');
      const importResult = await importStoreFromGoogle(googleMapsUrl);

      console.log('✅ Import result:', importResult);

      // Extract city and neighborhood from address.
      const city = extractCity(importResult.address);
      const neighborhood = extractNeighborhood(importResult.address);
      const mainCategory = detectMainCategory(importResult.types);

      // Build extracted data without copying Google photos.
      const data: ExtractedStoreData = {
        name: importResult.name,
        address: importResult.address,
        city,
        neighborhood,
        latitude: importResult.location.latitude,
        longitude: importResult.location.longitude,
        description: importResult.description,
        hours: importResult.hours,
        website: importResult.website,
        instagram: importResult.instagram,
        mainCategory,
        categories: importResult.suggestedCategories,
        placeId: importResult.placeId,
      };

      setExtractedData(data);
      console.log('✅ Extracted data ready:', data);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to extract store information. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (extractedData) {
      onApplyData(extractedData);
      setGoogleMapsUrl('');
      setExtractedData(null);
    }
  };

  const handleReset = () => {
    setGoogleMapsUrl('');
    setExtractedData(null);
    setError(null);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Store Info Extractor</h3>
          <p className="text-sm text-gray-600">Auto-fill store details from Google Maps</p>
        </div>
      </div>

      {!extractedData ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps URL or Place ID
            </label>
            <input
              type="text"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/... OR ChIJN1t_tDeuEmsRUsoyG83frY4"
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
              disabled={loading}
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">
                💡 <strong>Option 1:</strong> Paste any Google Maps link (e.g., https://maps.app.goo.gl/...)
              </p>
              <p className="text-xs text-gray-600">
                💡 <strong>Option 2:</strong> Paste the Place ID directly (e.g., ChIJN1t_tDeuEmsRUsoyG83frY4)
              </p>
              <p className="text-xs text-purple-600 font-medium">
                ✨ Place IDs are more accurate! Find them in the URL or use Google's Place ID Finder.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">Google photos can't be stored. Add your own or the store's photos.</p>

          <button
            onClick={handleExtract}
            disabled={loading || !googleMapsUrl.trim()}
            className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Extracting Store Info...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Extract Store Info
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Extraction Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-5 border-2 border-purple-200 space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Extracted Information (editable)
              </h4>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={extractedData.name}
                onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={extractedData.address}
                onChange={(e) => setExtractedData({ ...extractedData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={extractedData.latitude}
                  onChange={(e) => setExtractedData({ ...extractedData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={extractedData.longitude}
                  onChange={(e) => setExtractedData({ ...extractedData, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
              </div>
            </div>

            {/* AI Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Sparkles className="w-3 h-3 inline mr-1 text-purple-600" />
                AI-Generated Description
                <span className="ml-2 text-xs text-purple-600 font-normal">✨ Powered by Claude AI</span>
              </label>
              <textarea
                value={extractedData.description}
                onChange={(e) => setExtractedData({ ...extractedData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Hours */}
            {extractedData.hours && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="text"
                  value={extractedData.hours}
                  onChange={(e) => setExtractedData({ ...extractedData, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}

            {/* Website */}
            {extractedData.website && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={extractedData.website}
                  onChange={(e) => setExtractedData({ ...extractedData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Apply to Form
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
