import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  hero_image: string | null;
  content: string;
  category: string | null;
  referenced_stores: string[];
  published_at: string;
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
    content: '',
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        hero_image: post.hero_image || '',
        content: post.content,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        hero_image: formData.hero_image || null,
        content: formData.content,
        category: null,
        referenced_stores: [],
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
          placeholder="Best Vintage Shops in Tokyo"
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
          placeholder="best-vintage-shops-tokyo"
        />
        <p className="text-xs text-gray-500 mt-1">
          URL-friendly version of the title (auto-generated if left blank)
        </p>
      </div>

      {/* Hero Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hero Image URL
        </label>
        <input
          type="url"
          value={formData.hero_image}
          onChange={e => setFormData(prev => ({ ...prev, hero_image: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Content (Markdown) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content (Markdown) *
        </label>
        <textarea
          value={formData.content}
          onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
          rows={20}
          required
          placeholder={`# Heading

Your article content in **Markdown** format.

## Section 2

You can use:
- Lists
- **Bold text**
- *Italic text*
- [Links](https://example.com)

## Section 3

More content here...`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Write your article content using Markdown syntax
        </p>
      </div>

      {/* Preview (showing first 500 chars) */}
      {formData.content && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap">
            {formData.content.slice(0, 500)}
            {formData.content.length > 500 && '...'}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
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
    </form>
  );
}

