import { useState, useEffect } from 'react';
import { Plus, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Store } from '../../types/store';

interface PhotoUrlManagerProps {
  store: Store;
  onSuccess: () => void;
  pendingFormData?: any; // Form data to save alongside photos
  currentPhotos?: string[]; // Optional: current photos from parent state
}

export function PhotoUrlManager({ store, onSuccess, pendingFormData, currentPhotos }: PhotoUrlManagerProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    store.photos && store.photos.length > 0 ? store.photos : ['']
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update photoUrls when currentPhotos changes (e.g., after migration)
  useEffect(() => {
    if (currentPhotos && currentPhotos.length > 0) {
      setPhotoUrls(currentPhotos);
    }
  }, [currentPhotos]);

  const addPhotoUrl = () => {
    setPhotoUrls([...photoUrls, '']);
  };

  const removePhotoUrl = (index: number) => {
    if (photoUrls.length > 1) {
      setPhotoUrls(photoUrls.filter((_, i) => i !== index));
    }
  };

  const updatePhotoUrl = (index: number, value: string) => {
    const newUrls = [...photoUrls];
    newUrls[index] = value;
    setPhotoUrls(newUrls);
  };

  const handleSave = async () => {
    const validUrls = photoUrls.filter(url => url.trim() !== '');

    if (validUrls.length === 0) {
      setError('Please enter at least one photo URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare update data - include photos and any pending form data
      const updateData: any = { photos: validUrls };

      // If there's pending form data (description, etc.), include it
      if (pendingFormData) {
        Object.assign(updateData, pendingFormData);
      }

      const { error: updateError } = await supabase
        .from('stores')
        .update(updateData)
        .eq('id', store.id);

      if (updateError) throw updateError;

      setSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update photos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Photo URLs</h3>

      <p className="text-sm text-gray-600 mb-4">
        Paste image URLs for <strong>{store.name}</strong>. Use high-quality images from Google Maps, Unsplash, or your own hosting.
      </p>

      <div className="space-y-3 mb-4">
        {photoUrls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updatePhotoUrl(index, e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={loading}
            />
            {photoUrls.length > 1 && (
              <button
                onClick={() => removePhotoUrl(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addPhotoUrl}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
        disabled={loading}
      >
        <Plus className="w-4 h-4" />
        Add Another Photo
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Photos updated successfully!</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        {loading ? 'Saving...' : 'Save Photos'}
      </button>
    </div>
  );
}
