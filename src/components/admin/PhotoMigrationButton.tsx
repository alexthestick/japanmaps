import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { migrateStorePhotos } from '../../utils/migrateGooglePhotos';
import type { Store } from '../../types/store';

interface PhotoMigrationButtonProps {
  store: Store;
  onSuccess?: () => void;
}

export function PhotoMigrationButton({ store, onSuccess }: PhotoMigrationButtonProps) {
  const [migrating, setMigrating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasGooglePhotos = store.photos.some(url => url.includes('google'));

  const handleMigrate = async () => {
    setMigrating(true);
    setError(null);
    setSuccess(false);

    try {
      // Migrate all Google photos to Supabase
      const newUrls = await migrateStorePhotos(store.id, store.photos);

      // Update store with new URLs
      const { error: updateError } = await supabase
        .from('stores')
        .update({ photos: newUrls })
        .eq('id', store.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to migrate photos');
    } finally {
      setMigrating(false);
    }
  };

  if (!hasGooglePhotos) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-900">
            Google Photos Detected
          </h4>
          <p className="text-sm text-yellow-700 mt-1">
            Some photos are hosted on Google and may expire or break. Migrate them to Supabase for permanent hosting.
          </p>

          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Photos migrated successfully!
            </div>
          )}

          <button
            onClick={handleMigrate}
            disabled={migrating || success}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {migrating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Migrating Photos...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Migration Complete
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Migrate to Supabase Storage
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
