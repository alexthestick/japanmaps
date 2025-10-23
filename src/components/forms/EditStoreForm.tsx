import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { PhotoUrlManager } from '../admin/PhotoUrlManager';
import { PhotoMigrationButton } from '../admin/PhotoMigrationButton';
import { GoogleMapsStoreExtractor, type ExtractedStoreData } from '../admin/GoogleMapsStoreExtractor';
import { BulkPhotoMigration } from '../admin/BulkPhotoMigration';
import { FetchPlaceIdButton, type PlaceDetails } from '../admin/FetchPlaceIdButton';
import { MAIN_CATEGORIES, MAIN_CATEGORY_ICONS, FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES, PRICE_RANGES } from '../../lib/constants';
import { formatLocationForDB } from '../../utils/helpers';
import type { Store } from '../../types/store';

const baseStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  neighborhood: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  mainCategory: z.string().min(1, 'Main category is required'),
  categories: z.array(z.string()),
  priceRange: z.string().optional(),
  description: z.string().optional(),
  photoUrls: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  hours: z.string().optional(),
  verified: z.boolean().optional(),
});

const storeSchema = baseStoreSchema.superRefine((data, ctx) => {
  const needsSubcategories = ['Fashion', 'Food', 'Home Goods'].includes(data.mainCategory);
  if (needsSubcategories && (!data.categories || data.categories.length < 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['categories'],
      message: 'Select at least one category',
    });
  }
});

type StoreFormData = z.infer<typeof storeSchema>;

interface EditStoreFormProps {
  store: Store;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditStoreForm({ store, onSuccess, onCancel }: EditStoreFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(store.categories);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>(store.mainCategory || 'Fashion');
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [googlePlaceId, setGooglePlaceId] = useState<string | undefined>(store.google_place_id);
  const [storePhotos, setStorePhotos] = useState<string[]>(store.photos || []);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [autoMigratePhotos, setAutoMigratePhotos] = useState(false);
  const [showAutoFillMessage, setShowAutoFillMessage] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null); // Store AI-enhanced data for preview
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store.name,
      address: store.address,
      city: store.city,
      neighborhood: store.neighborhood || '',
      country: store.country,
      latitude: store.latitude,
      longitude: store.longitude,
      mainCategory: store.mainCategory || 'Fashion',
      categories: store.categories,
      priceRange: store.priceRange || '',
      description: store.description || '',
      photoUrls: store.photos.join('\n'),
      website: store.website || '',
      instagram: store.instagram || '',
      hours: store.hours || '',
      verified: store.verified,
    },
  });

  useEffect(() => {
    setSelectedCategories(store.categories);
  }, [store]);

  // Auto-trigger photo migration when place details are fetched
  useEffect(() => {
    if (autoMigratePhotos && googlePlaceId && placeDetails?.photos && placeDetails.photos.length > 0) {
      // Automatically migrate photos
      const migratePhotos = async () => {
        try {
          const { migrateStorePhotosViaEdge } = await import('../../utils/edgePhotoFetcher');
          const photoUrls = await migrateStorePhotosViaEdge(
            store.id,
            googlePlaceId,
            false, // Not a dry run - actually upload
            () => {} // No progress callback needed for auto-migration
          );

          if (photoUrls.length > 0) {
            // Update store with new photos
            const updatedPhotos = [...(store.photos || []), ...photoUrls];
            const { error } = await supabase
              .from('stores')
              .update({ photos: updatedPhotos })
              .eq('id', store.id);

            if (!error) {
              store.photos = updatedPhotos;
              setStorePhotos(updatedPhotos);
            }
          }
        } catch (error) {
          console.error('Auto photo migration failed:', error);
        }
      };

      migratePhotos();
      setAutoMigratePhotos(false); // Reset flag
    }
  }, [autoMigratePhotos, googlePlaceId, placeDetails, store.id, store.photos]);

  // Track form changes to save alongside photos
  useEffect(() => {
    const subscription = setInterval(() => {
      const formValues = getValues();
      const updateData = {
        name: formValues.name,
        address: formValues.address,
        city: formValues.city,
        neighborhood: formValues.neighborhood || null,
        country: formValues.country,
        location: `SRID=4326;POINT(${formValues.longitude} ${formValues.latitude})`,
        main_category: formValues.mainCategory,
        categories: selectedCategories,
        price_range: formValues.priceRange || null,
        description: formValues.description || null,
        website: formValues.website || null,
        instagram: formValues.instagram || null,
        hours: formValues.hours || null,
        verified: formValues.verified ?? true,
      };
      setPendingFormData(updateData);
    }, 1000); // Update every second

    return () => clearInterval(subscription);
  }, [getValues, selectedCategories]);

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    setValue('categories', newCategories);
  };

  const handleApplyPlaceDetails = async (details: PlaceDetails) => {
    // Show loading message
    setShowAutoFillMessage(true);

    // Store place details for photo migration
    setPlaceDetails(details);

    // Trigger automatic photo migration if photos are available
    if (details.photos && details.photos.length > 0) {
      setAutoMigratePhotos(true);
    }

    // Enhance with AI (get description, Instagram, price range, categories)
    try {
      console.log('🔍 Starting AI enhancement with details:', details);
      const { enhancePlaceDetailsWithAI } = await import('../../utils/aiPlaceEnhancer');
      const enhanced = await enhancePlaceDetailsWithAI(details as any, (selectedMainCategory as any) || 'Fashion');

      console.log('✅ AI enhancement successful:', enhanced);

      // Store enhanced data for preview (DON'T auto-fill yet)
      setEnhancedData({
        ...details,
        ...enhanced,
      });

      // Show preview card
      setShowPreview(true);
      setShowAutoFillMessage(false);
    } catch (error) {
      console.error('❌ AI enhancement failed - showing preview with basic data:', error);

      // Still show preview with basic data (fallback)
      setEnhancedData({
        name: details.name,
        address: details.address,
        latitude: details.latitude,
        longitude: details.longitude,
        description: details.editorialSummary || details.description || `${details.name} is a clothing store located at ${details.address}.`,
        hours: details.hours,
        website: details.website,
        rating: details.rating,
        userRatingCount: details.userRatingCount,
        photos: details.photos,
      });

      setShowPreview(true);
      setShowAutoFillMessage(false);
    }
  };

  // NEW: Function to apply the previewed data to the form
  const applyEnhancedDataToForm = () => {
    if (!enhancedData) return;

    console.log('📝 Applying enhanced data to form:', enhancedData);

    // Apply basic fields (ALWAYS apply, overwrite existing)
    if (enhancedData.hours) {
      setValue('hours', enhancedData.hours);
      console.log('✓ Applied hours:', enhancedData.hours);
    }
    if (enhancedData.website) {
      setValue('website', enhancedData.website);
      console.log('✓ Applied website:', enhancedData.website);
    }
    if (enhancedData.latitude && enhancedData.longitude) {
      setValue('latitude', enhancedData.latitude);
      setValue('longitude', enhancedData.longitude);
      console.log('✓ Applied coordinates:', enhancedData.latitude, enhancedData.longitude);
    }
    if (enhancedData.address) {
      setValue('address', enhancedData.address);
      console.log('✓ Applied address:', enhancedData.address);
    }

    // Apply AI-enhanced fields (ALWAYS apply, overwrite existing)
    if (enhancedData.description) {
      setValue('description', enhancedData.description);
      console.log('✓ Applied description:', enhancedData.description.substring(0, 50) + '...');
    }
    if (enhancedData.instagram) {
      setValue('instagram', enhancedData.instagram);
      console.log('✓ Applied instagram:', enhancedData.instagram);
    }
    if (enhancedData.priceRange) {
      setValue('priceRange', enhancedData.priceRange);
      console.log('✓ Applied priceRange:', enhancedData.priceRange);
    }
    if (enhancedData.categories && enhancedData.categories.length > 0) {
      const mappedCategories = enhancedData.categories.filter((cat: string) =>
        ['streetwear', 'vintage', 'luxury', 'contemporary', 'casual', 'minimalist', 'designer', 'secondhand', 'sneakers', 'accessories'].includes(cat)
      );
      if (mappedCategories.length > 0) {
        setSelectedCategories(mappedCategories);
        setValue('categories', mappedCategories);
        console.log('✓ Applied categories:', mappedCategories);
      }
    }

    console.log('✅ All data applied successfully!');

    // Close preview
    setShowPreview(false);
    setEnhancedData(null);
  };

  const handleApplyExtractedData = (data: ExtractedStoreData) => {
    // Auto-fill form fields with extracted data
    setValue('name', data.name);
    setValue('address', data.address);
    setValue('latitude', data.latitude);
    setValue('longitude', data.longitude);
    setValue('description', data.description);

    if (data.hours) setValue('hours', data.hours);
    if (data.website) setValue('website', data.website);
    if (data.priceRange) setValue('priceRange', data.priceRange);
    if (data.categories && data.categories.length > 0) {
      setSelectedCategories(data.categories);
      setValue('categories', data.categories);
    }

    alert('Store info applied! Review and save when ready.');
  };

  const onSubmit = async (data: StoreFormData) => {
    setIsSubmitting(true);
    try {
      // Parse manual photo URLs from the text input
      const manualPhotoUrls = data.photoUrls
        ? data.photoUrls.split('\n').map(url => url.trim()).filter(url => url)
        : [];

      // Merge with existing migrated photos (storePhotos state contains the migrated ones)
      // Only add manual URLs that aren't already in the migrated photos
      const uniqueManualUrls = manualPhotoUrls.filter(url => !storePhotos.includes(url));
      const photos = [...storePhotos, ...uniqueManualUrls];

      const updateData = {
        name: data.name,
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood || null,
        country: data.country,
        location: `SRID=4326;POINT(${data.longitude} ${data.latitude})`,
        main_category: data.mainCategory,
        categories: data.categories,
        price_range: data.priceRange && ['$', '$$', '$$$'].includes(data.priceRange) ? data.priceRange : null,
        description: data.description || null,
        photos,
        website: data.website || null,
        instagram: data.instagram || null,
        hours: data.hours || null,
        verified: data.verified ?? true,
      };

      console.log('Updating store:', store.id);
      console.log('Update data:', updateData);

      const { data: result, error } = await (supabase.from('stores') as any)
        .update(updateData)
        .eq('id', store.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update result:', result);
      alert('Store updated successfully!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating store:', error);
      alert(`Failed to update store: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
    {/* AI Store Extractor - Place at top for easy access */}
    <div className="mb-6">
      <GoogleMapsStoreExtractor onApplyData={handleApplyExtractedData} />
    </div>

    {/* Auto-fill loading message */}
    {showAutoFillMessage && (
      <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800">
          <CheckCircle className="w-5 h-5 animate-spin" />
          <p className="font-medium">✨ AI is enhancing store data... (analyzing reviews, extracting details)</p>
        </div>
      </div>
    )}

    {/* AI-Enhanced Data Preview Card */}
    {showPreview && enhancedData && (
      <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
            ✨ AI-Enhanced Store Data
          </h3>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Description */}
          {enhancedData.description && (
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">📝 AI-Generated Description:</p>
              <p className="text-gray-700 text-sm leading-relaxed">{enhancedData.description}</p>
            </div>
          )}

          {/* Grid of other fields */}
          <div className="grid grid-cols-2 gap-3">
            {enhancedData.instagram && (
              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">📷 Instagram:</p>
                <p className="text-sm text-gray-700">{enhancedData.instagram}</p>
              </div>
            )}

            {enhancedData.priceRange && (
              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">💰 Price Range:</p>
                <p className="text-sm text-gray-700">{enhancedData.priceRange}</p>
              </div>
            )}

            {enhancedData.website && (
              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">🌐 Website:</p>
                <p className="text-sm text-gray-700 truncate">{enhancedData.website}</p>
              </div>
            )}

            {enhancedData.hours && (
              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">🕐 Hours:</p>
                <p className="text-xs text-gray-700 line-clamp-2">{enhancedData.hours.split('\n')[0]}...</p>
              </div>
            )}
          </div>

          {/* Categories */}
          {enhancedData.categories && enhancedData.categories.length > 0 && (
            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-2">🏷️ Fashion Categories:</p>
              <div className="flex flex-wrap gap-2">
                {enhancedData.categories.map((cat: string) => (
                  <span key={cat} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Photos count */}
          {storePhotos.length > 0 && (
            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-1">📸 Photos Migrated:</p>
              <p className="text-sm text-gray-700">{storePhotos.length} photo{storePhotos.length > 1 ? 's' : ''} successfully uploaded</p>
            </div>
          )}
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={applyEnhancedDataToForm}
          className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
        >
          ✓ Apply to Form
        </button>
      </div>
    )}

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('name')}
        label="Store Name *"
        type="text"
        error={errors.name?.message}
      />

      <Input
        {...register('address')}
        label="Address *"
        type="text"
        error={errors.address?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('city')}
          label="City *"
          type="text"
          error={errors.city?.message}
        />

        <Input
          {...register('neighborhood')}
          label="Neighborhood"
          type="text"
        />
      </div>

      <Input
        {...register('country')}
        label="Country *"
        type="text"
        error={errors.country?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('latitude', { valueAsNumber: true })}
          label="Latitude *"
          type="number"
          step="any"
          placeholder="35.6895"
          error={errors.latitude?.message}
        />

        <Input
          {...register('longitude', { valueAsNumber: true })}
          label="Longitude *"
          type="number"
          step="any"
          placeholder="139.6917"
          error={errors.longitude?.message}
        />
      </div>

      {/* Main Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Main Category * (📍 Icon on Map)
        </label>
        <div className="flex gap-3">
          {MAIN_CATEGORIES.map(mainCat => (
            <label key={mainCat} className="flex items-center px-4 py-2 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                {...register('mainCategory')}
                type="radio"
                value={mainCat}
                className="mr-2"
                onChange={(e) => setSelectedMainCategory(e.target.value)}
              />
              <span className="font-medium">{MAIN_CATEGORY_ICONS[mainCat as keyof typeof MAIN_CATEGORY_ICONS]} {mainCat}</span>
            </label>
          ))}
        </div>
        {errors.mainCategory && (
          <p className="text-red-500 text-sm mt-1">{errors.mainCategory.message}</p>
        )}
      </div>

      {/* Sub-Categories for Fashion */}
      {selectedMainCategory === 'Fashion' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fashion Categories * (select at least one)
          </label>
          <div className="flex flex-wrap gap-2">
            {FASHION_SUB_CATEGORIES.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {errors.categories && (
            <p className="text-red-500 text-sm mt-1">{errors.categories.message}</p>
          )}
        </div>
      )}

      {/* Sub-Categories for Food */}
      {selectedMainCategory === 'Food' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Categories * (select at least one)
          </label>
          <div className="flex flex-wrap gap-2">
            {FOOD_SUB_CATEGORIES.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {errors.categories && (
            <p className="text-red-500 text-sm mt-1">{errors.categories.message}</p>
          )}
        </div>
      )}

      {/* Sub-Categories for Home Goods */}
      {selectedMainCategory === 'Home Goods' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Home Goods Categories * (select at least one)
          </label>
          <div className="flex flex-wrap gap-2">
            {HOME_GOODS_SUB_CATEGORIES.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {errors.categories && (
            <p className="text-red-500 text-sm mt-1">{errors.categories.message}</p>
          )}
        </div>
      )}

      {/* Coffee has no sub-categories - show message */}
      {selectedMainCategory === 'Coffee' && (
        <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
          <p className="text-sm text-brown-800">
            ☕ Coffee shops don't have sub-categories. Just save with the Coffee main category.
          </p>
        </div>
      )}

      {/* Museum has no sub-categories - show message */}
      {selectedMainCategory === 'Museum' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-800">
            🏛️ Museums don't have sub-categories. Just save with the Museum main category.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex gap-2">
          {PRICE_RANGES.map(price => (
            <label key={price} className="flex items-center">
              <input
                {...register('priceRange')}
                type="radio"
                value={price}
                className="mr-2"
              />
              {price}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what makes this store special..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('instagram')}
          label="Instagram Handle"
          type="text"
          placeholder="@storename"
        />

        <Input
          {...register('website')}
          label="Website"
          type="url"
          placeholder="https://..."
          error={errors.website?.message}
        />
      </div>

      <Input
        {...register('hours')}
        label="Hours"
        type="text"
        placeholder="Mon-Sat: 11am-8pm"
      />

      <div className="flex items-center">
        <input
          {...register('verified')}
          type="checkbox"
          id="verified-edit"
          className="mr-2"
        />
        <label htmlFor="verified-edit" className="text-sm text-gray-700">
          Mark as verified
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>

    {/* Photo Management Section - Outside the form */}
    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
      {/* Photo Migration Warning */}
      <PhotoMigrationButton
        store={store}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
      />

      {/* Step 1: Fetch Google Place ID + Full Store Data */}
      <FetchPlaceIdButton
        store={store}
        onSuccess={(placeId, details) => {
          // Update both the store object and local state to trigger re-render
          store.google_place_id = placeId;
          setGooglePlaceId(placeId);

          // Auto-populate form fields if we got place details
          if (details) {
            handleApplyPlaceDetails(details);
          }
        }}
      />

      {/* Step 2: Bulk Photo Migration via Edge Function (only if Place ID exists) */}
      {googlePlaceId && (
        <>
          <BulkPhotoMigration
            storeId={store.id}
            storeName={store.name}
            googlePlaceId={googlePlaceId}
            currentPhotoCount={store.photos?.length || 0}
            onMigrationComplete={async (photoUrls) => {
              // Update store with new photos - merge with existing, avoiding duplicates
              const existingPhotos = store.photos || [];
              const newUniquePhotos = photoUrls.filter(url => !existingPhotos.includes(url));
              const updatedPhotos = [...existingPhotos, ...newUniquePhotos];
              
              const { error } = await supabase
                .from('stores')
                .update({ photos: updatedPhotos })
                .eq('id', store.id);

              if (!error) {
                // Update local store object AND state to show photos immediately
                store.photos = updatedPhotos;
                setStorePhotos(updatedPhotos);
                // Don't navigate away - let user continue editing or manually close
              }
            }}
          />

          {/* Show migrated photos preview */}
          {storePhotos.length > 0 && (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                ✓ {storePhotos.length} Photo{storePhotos.length > 1 ? 's' : ''} in Database
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {storePhotos.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-20 object-cover rounded border border-green-300"
                  />
                ))}
              </div>
              <p className="text-xs text-green-700 mt-2">
                These photos are saved to the database and will appear on the store page.
              </p>
            </div>
          )}
        </>
      )}

      {/* Manual Photo URL Manager (fallback) */}
      <PhotoUrlManager
        store={store}
        currentPhotos={storePhotos}
        pendingFormData={pendingFormData}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
      />
    </div>
    </div>
  );
}
