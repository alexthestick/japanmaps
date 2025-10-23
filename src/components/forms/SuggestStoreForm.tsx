import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const suggestionSchema = z.object({
  submitterName: z.string().optional(),
  submitterEmail: z.string().email('Invalid email address'),
  storeName: z.string().min(1, 'Store name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().optional(),
  reason: z.string().min(10, 'Please provide at least 10 characters'),
  instagram: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

export function SuggestStoreForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
  });

  const onSubmit = async (data: SuggestionFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase.from('store_suggestions') as any).insert([
        {
          submitter_name: data.submitterName || null,
          submitter_email: data.submitterEmail,
          store_name: data.storeName,
          city: data.city,
          country: data.country,
          address: data.address || null,
          reason: data.reason,
          instagram: data.instagram || null,
          website: data.website || null,
        },
      ]);

      if (error) throw error;

      setSubmitSuccess(true);
      reset();
      setTimeout(() => {
        setSubmitSuccess(false);
        onSuccess?.();
      }, 3000);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-green-800 font-semibold mb-2">Thank you!</h3>
        <p className="text-green-700">
          Your store suggestion has been submitted and will be reviewed soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('submitterName')}
        label="Your Name (Optional)"
        type="text"
      />

      <Input
        {...register('submitterEmail')}
        label="Your Email *"
        type="email"
        error={errors.submitterEmail?.message}
      />

      <Input
        {...register('storeName')}
        label="Store Name *"
        type="text"
        error={errors.storeName?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('city')}
          label="City *"
          type="text"
          error={errors.city?.message}
        />

        <Input
          {...register('country')}
          label="Country *"
          type="text"
          error={errors.country?.message}
        />
      </div>

      <Input
        {...register('address')}
        label="Address or Google Maps Link"
        type="text"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Why are you recommending this store? *
        </label>
        <textarea
          {...register('reason')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us what makes this store special..."
        />
        {errors.reason && (
          <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
        )}
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

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
      </Button>
    </form>
  );
}

