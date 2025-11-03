import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import type { ParallaxStoreSection } from '../../types/blog';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  hero_image: string | null;
  content: string;
  intro_content: string | null;
  category: string | null;
  referenced_stores: string[];
  published_at: string;
  article_type: 'standard' | 'parallax_store_guide';
  sections_data: ParallaxStoreSection[] | null;
}

interface BlogPostEditorProps {
  post?: BlogPost | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BlogPostEditor({ post, onSuccess, onCancel }: BlogPostEditorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    hero_image: '',
    intro_content: '',
    sections: [] as ParallaxStoreSection[],
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        hero_image: post.hero_image || '',
        intro_content: post.intro_content || '',
        sections: post.sections_data || [],
      });
    }
  }, [post]);

  function generateSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function handleTitleChange(title: string) {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlugFromTitle(title),
    }));
  }

  function addSection() {
    setFormData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          store_name: '',
          description: '',
          image: '',
          address: '',
          map_link: '',
          reverse: false,
        },
      ],
    }));
  }

  function updateSection(index: number, field: keyof ParallaxStoreSection, value: string | boolean) {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      ),
    }));
  }

  function removeSection(index: number) {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    const newSections = [...formData.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

    setFormData(prev => ({ ...prev, sections: newSections }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        hero_image: formData.hero_image || null,
        intro_content: formData.intro_content || null,
        content: '', // Keep empty for parallax articles
        category: null,
        referenced_stores: [],
        article_type: 'parallax_store_guide' as const,
        sections_data: formData.sections,
      };

      if (post) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);

        if (error) throw error;
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info Section */}
      <div className="space-y-6 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Article Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
            placeholder="Best Archive Stores in Japan"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
            placeholder="best-archive-stores-japan"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL-friendly version (auto-generated from title)
          </p>
        </div>

        {/* Hero Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Image URL *
          </label>
          <input
            type="url"
            value={formData.hero_image}
            onChange={e => setFormData(prev => ({ ...prev, hero_image: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
            placeholder="https://example.com/hero-image.jpg"
          />
          {formData.hero_image && (
            <div className="mt-2">
              <img
                src={formData.hero_image}
                alt="Hero preview"
                className="w-full h-40 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {/* Intro Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Introduction Paragraph *
          </label>
          <textarea
            value={formData.intro_content}
            onChange={e => setFormData(prev => ({ ...prev, intro_content: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={6}
            required
            placeholder="Write your introduction paragraph here. This will appear before the store sections..."
          />
          <p className="text-xs text-gray-500 mt-1">
            This text appears at the top of the article before the parallax sections
          </p>
        </div>
      </div>

      {/* Store Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Store Sections</h3>
          <Button
            type="button"
            onClick={addSection}
            className="text-sm"
          >
            + Add Store Section
          </Button>
        </div>

        {formData.sections.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No store sections yet</p>
            <Button type="button" onClick={addSection}>
              Add Your First Store
            </Button>
          </div>
        )}

        {formData.sections.map((section, index) => (
          <div
            key={index}
            className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                Section {index + 1}
                {section.store_name && `: ${section.store_name}`}
              </h4>
              <div className="flex gap-2">
                {/* Move buttons */}
                <button
                  type="button"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === formData.sections.length - 1}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                value={section.store_name}
                onChange={e => updateSection(index, 'store_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
                placeholder="PAT MARKET TOKYO"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={section.description}
                onChange={e => updateSection(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={5}
                required
                placeholder="Write your description about this store..."
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                value={section.image}
                onChange={e => updateSection(index, 'image', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
                placeholder="https://example.com/store-image.jpg"
              />
              {section.image && (
                <div className="mt-2">
                  <img
                    src={section.image}
                    alt="Store preview"
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <input
                type="text"
                value={section.address || ''}
                onChange={e => updateSection(index, 'address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="3-chōme-27-8 Jingūmae, Shibuya, Tokyo 150-0001"
              />
            </div>

            {/* Map Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Link (Optional)
              </label>
              <input
                type="url"
                value={section.map_link || ''}
                onChange={e => updateSection(index, 'map_link', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>

            {/* Reverse Layout */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`reverse-${index}`}
                checked={section.reverse || false}
                onChange={e => updateSection(index, 'reverse', e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor={`reverse-${index}`} className="text-sm text-gray-700">
                Reverse layout (image on right)
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          disabled={loading || formData.sections.length === 0}
          className="flex-1"
        >
          {loading ? 'Saving...' : post ? 'Update Article' : 'Create Article'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      {formData.sections.length === 0 && (
        <p className="text-sm text-amber-600 text-center">
          Please add at least one store section before saving
        </p>
      )}
    </form>
  );
}
