import { useState } from 'react';
import { Image, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { migrateStorePhotosViaEdge } from '../../utils/edgePhotoFetcher';
import { supabase } from '../../lib/supabase';

interface BulkPhotoMigrationProps {
  storeId: string;
  storeName: string;
  googlePlaceId?: string;
  currentPhotoCount: number;
  onMigrationComplete?: (photoUrls: string[]) => void;
}

export function BulkPhotoMigration({
  storeId,
  storeName,
  googlePlaceId,
  currentPhotoCount,
  onMigrationComplete,
}: BulkPhotoMigrationProps) {
  const [migrating, setMigrating] = useState(false);
  const [dryRun, setDryRun] = useState(false); // Default to FALSE - users want to actually migrate
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  const handleMigrate = async () => {
    if (!googlePlaceId) {
      setResult({
        success: false,
        count: 0,
        message: 'No Google Place ID found for this store',
      });
      return;
    }

    setMigrating(true);
    setResult(null);
    setProgress(null);

    try {
      const photoUrls = await migrateStorePhotosViaEdge(
        storeId,
        googlePlaceId,
        dryRun,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      setProgress(null);

      if (photoUrls.length > 0) {
        // Update store photos in database if not dry run
        if (!dryRun && onMigrationComplete) {
          onMigrationComplete(photoUrls);
        }

        setResult({
          success: true,
          count: photoUrls.length,
          message: dryRun
            ? `Validated ${photoUrls.length} photos successfully! Turn off Dry Run to upload.`
            : `Successfully migrated ${photoUrls.length} photos to Supabase!`,
        });
      } else {
        setResult({
          success: false,
          count: 0,
          message: 'No photos found for this store on Google Maps',
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      setResult({
        success: false,
        count: 0,
        message: error instanceof Error ? error.message : 'Failed to migrate photos',
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <Image className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">Fetch Google Photos</h4>
          <p className="text-sm text-gray-600 mt-1">
            Store: <strong>{storeName}</strong> • Current photos: {currentPhotoCount}
          </p>
        </div>
      </div>

      {/* Dry Run Toggle */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 mt-0.5"
            disabled={migrating}
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              🧪 Dry Run (test mode)
            </span>
            <p className="text-xs text-gray-600 mt-1">
              {dryRun
                ? '⚠️ Testing only - photos will NOT be saved to database'
                : '✓ Photos will be downloaded and saved to database'}
            </p>
          </div>
        </label>
      </div>

      {/* Progress */}
      {progress && (
        <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Loader className="w-4 h-4 animate-spin" />
            <span>
              Fetching photos: {progress.current}/{progress.total}
            </span>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            )}
            <p
              className={`text-sm ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.message}
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={handleMigrate}
        disabled={migrating || !googlePlaceId}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          dryRun
            ? 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300'
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300'
        } disabled:cursor-not-allowed`}
      >
        {migrating ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            {dryRun ? 'Testing...' : 'Migrating...'}
          </>
        ) : (
          <>
            <Image className="w-4 h-4" />
            {dryRun ? 'Test Photo Migration' : 'Migrate Photos to Supabase'}
          </>
        )}
      </button>

      {!googlePlaceId && (
        <p className="mt-2 text-xs text-red-600">
          ⚠️ This store doesn't have a Google Place ID. Cannot fetch photos.
        </p>
      )}
    </div>
  );
}
