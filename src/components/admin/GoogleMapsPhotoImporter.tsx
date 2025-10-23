import { useState } from 'react';
import { Image, AlertCircle, CheckCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Store } from '../../types/store';

interface GoogleMapsPhotoImporterProps {
  store: Store;
  onSuccess: () => void;
}

export function GoogleMapsPhotoImporter({ store, onSuccess }: GoogleMapsPhotoImporterProps) {
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(googleMapsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGoogleMaps = () => {
    if (googleMapsUrl.trim()) {
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Image className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">Import Photos from Google Maps</h3>
          <p className="text-sm text-gray-600">Quick guide to extract photo URLs from Google Maps</p>
        </div>
      </div>

      {/* Store the Google Maps URL for quick reference */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Maps URL (for reference)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
            className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {googleMapsUrl.trim() && (
            <>
              <button
                onClick={openGoogleMaps}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </button>
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
        <h4 className="font-bold text-gray-900 mb-3 text-sm">📋 How to Extract Photo URLs:</h4>

        <ol className="space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <div>
              <p className="font-medium text-gray-900">Open the store on Google Maps</p>
              <p className="text-gray-600 text-xs mt-1">
                Search for the store and make sure you can see the photos section
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <p className="font-medium text-gray-900">Click on any photo to open the gallery</p>
              <p className="text-gray-600 text-xs mt-1">
                This will open the photo viewer where you can see all images
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <p className="font-medium text-gray-900">For each photo you want to save:</p>
              <ul className="list-disc list-inside text-gray-600 text-xs mt-1 ml-4 space-y-1">
                <li>Right-click on the photo</li>
                <li>Select <strong>"Open image in new tab"</strong></li>
                <li>The new tab will show a URL like: <code className="bg-gray-100 px-1 py-0.5 rounded">https://lh3.googleusercontent.com/p/...</code></li>
                <li>Copy the entire URL from your browser's address bar</li>
              </ul>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              4
            </span>
            <div>
              <p className="font-medium text-gray-900">Paste each URL in the "Photo URLs" section below</p>
              <p className="text-gray-600 text-xs mt-1">
                Click "Add Another Photo" for each additional image
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              5
            </span>
            <div>
              <p className="font-medium text-gray-900">Click "Save Photos" when done!</p>
              <p className="text-gray-600 text-xs mt-1">
                Your photos will appear on the store detail page
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Pro Tip */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm font-medium text-yellow-900 mb-1">💡 Pro Tip</p>
        <p className="text-xs text-yellow-800">
          The photo URLs should start with <code className="bg-yellow-100 px-1 py-0.5 rounded">https://lh3.googleusercontent.com/</code> or <code className="bg-yellow-100 px-1 py-0.5 rounded">https://lh5.googleusercontent.com/</code>
          <br />
          These are <strong>permanent, direct links</strong> that will always work without needing an API key!
        </p>
      </div>

      {/* Why This Method */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <details className="text-sm">
          <summary className="font-medium text-gray-900 cursor-pointer">
            Why can't we auto-extract? 🤔
          </summary>
          <p className="text-xs text-gray-600 mt-2">
            Google Maps blocks automated extraction due to CORS security policies.
            While this manual method takes a few extra clicks, it's actually more reliable and ensures you get
            high-quality, permanent image URLs that will never expire or require API authentication.
          </p>
        </details>
      </div>
    </div>
  );
}
