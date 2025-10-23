import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { MAIN_CATEGORIES, MAIN_CATEGORY_ICONS, FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES, PRICE_RANGES } from '../../lib/constants';
import { formatLocationForDB } from '../../utils/helpers';
import { GoogleMapsStoreExtractor, type ExtractedStoreData } from '../admin/GoogleMapsStoreExtractor';

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
  photoUrl: z.string().url().optional().or(z.literal('')),
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

interface AddStoreFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddStoreForm({ onSuccess, onCancel }: AddStoreFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('Fashion');
  const [extractedPhotos, setExtractedPhotos] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      mainCategory: 'Fashion',
      categories: [],
      verified: true,
      country: 'Japan',
    },
  });

  const handleApplyExtractedData = (data: ExtractedStoreData) => {
    setValue('name', data.name);
    setValue('address', data.address);
    setValue('latitude', data.latitude);
    setValue('longitude', data.longitude);
    setValue('description', data.description || '');
    setValue('hours', data.hours || '');
    setValue('website', data.website || '');
    setValue('priceRange', data.priceRange || '');

    // Store extracted photos
    if (data.photoUrls && data.photoUrls.length > 0) {
      setExtractedPhotos(data.photoUrls);
    }

    // Auto-fill categories if available
    if (data.categories && data.categories.length > 0) {
      setSelectedCategories(data.categories);
      setValue('categories', data.categories);
    }
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    setValue('categories', newCategories, { shouldValidate: true });
  };

  const handleMainCategoryChange = (newMainCategory: string) => {
    setSelectedMainCategory(newMainCategory);
    // Clear categories when main category changes
    // For Coffee and Museum, set empty array which is valid
    setSelectedCategories([]);
    setValue('categories', [], { shouldValidate: true });
  };

  const onSubmit = async (data: StoreFormData) => {
    console.log('✅ Form submitted successfully!');
    console.log('Store data:', data);
    console.log('Selected categories:', selectedCategories);
    
    setIsSubmitting(true);
    try {
      // Combine manual photo URL with extracted photos
      const photos = [
        ...(data.photoUrl ? [data.photoUrl] : []),
        ...extractedPhotos
      ];

      const storeData = {
        name: data.name,
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood || null,
        country: data.country,
        location: formatLocationForDB(data.latitude, data.longitude),
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

      console.log('Inserting store data:', storeData);

      const { error } = await (supabase.from('stores') as any).insert([storeData]);

      if (error) throw error;

      alert('Store added successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error adding store:', error);
      alert('Failed to add store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Store Extractor - Place at top for easy access */}
      <GoogleMapsStoreExtractor onApplyData={handleApplyExtractedData} />

      {/* Show extracted photos preview */}
      {extractedPhotos.length > 0 && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-2">
            ✓ {extractedPhotos.length} photos extracted and ready to save!
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {extractedPhotos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Extracted photo ${idx + 1}`}
                className="w-20 h-20 object-cover rounded border border-green-300"
              />
            ))}
          </div>
        </div>
      )}

      <form 
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('Form validation errors:', errors);
          alert('Form has validation errors! Check console for details.');
        })} 
        className="space-y-4"
      >
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
                onChange={(e) => handleMainCategoryChange(e.target.value)}
              />
              <span className="font-medium">{MAIN_CATEGORY_ICONS[mainCat as keyof typeof MAIN_CATEGORY_ICONS]} {mainCat}</span>
            </label>
          ))}
        </div>
        {errors.mainCategory && (
          <p className="text-red-500 text-sm mt-1">{errors.mainCategory.message}</p>
        )}
      </div>

      {/* Sub-Categories (Fashion) */}
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

      {/* Sub-Categories (Food) */}
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

      {/* Sub-Categories (Home Goods) */}
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

      {/* Coffee: No sub-categories */}
      {selectedMainCategory === 'Coffee' && (
        <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
          <p className="text-sm text-brown-800">
            ☕ Coffee shops don't have sub-categories. Just save with the Coffee main category.
          </p>
        </div>
      )}

      {/* Museum: No sub-categories */}
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

      <Input
        {...register('photoUrl')}
        label="Photo URL"
        type="url"
        placeholder="https://..."
        error={errors.photoUrl?.message}
      />

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
          id="verified"
          className="mr-2"
        />
        <label htmlFor="verified" className="text-sm text-gray-700">
          Mark as verified
        </label>
      </div>

      <div className="space-y-2">
        {/* Debug info */}
        <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
          Selected categories: {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'None'}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => {
              const formValues = watch();
              console.log('=== DEBUG FORM STATE ===');
              console.log('Current form values:', formValues);
              console.log('Selected categories state:', selectedCategories);
              console.log('Form errors:', errors);
              console.log('=======================');
              alert(`Form State:\nCategories in form: ${JSON.stringify(formValues.categories)}\nCategories in state: ${JSON.stringify(selectedCategories)}\nMain Category: ${formValues.mainCategory}`);
            }}
          >
            🔍 Debug
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1"
            onClick={() => {
              console.log('Submit button clicked!');
            }}
          >
            {isSubmitting ? 'Adding Store...' : 'Add Store'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
    </div>
  );
}

