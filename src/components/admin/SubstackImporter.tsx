import { useState } from 'react';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import type { ParallaxStoreSection } from '../../types/blog';

interface SubstackPost {
  title: string;
  slug: string;
  link: string;
  publishedAt: string;
  intro: string;
  heroImage: string | null;
  sections: ParallaxStoreSection[];
  rawImages: string[];
}

interface SubstackImporterProps {
  onImport: (data: {
    title: string;
    slug: string;
    hero_image: string;
    intro_content: string;
    sections: ParallaxStoreSection[];
  }) => void;
}

export function SubstackImporter({ onImport }: SubstackImporterProps) {
  const [posts, setPosts] = useState<SubstackPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<SubstackPost | null>(null);

  async function fetchPosts() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/fetch-substack-posts');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.posts);
    } catch (err: any) {
      console.error('Error fetching Substack posts:', err);
      setError(err.message || 'Failed to fetch posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleImport(post: SubstackPost) {
    onImport({
      title: post.title,
      slug: post.slug,
      hero_image: post.heroImage || '',
      intro_content: post.intro,
      sections: post.sections,
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Import from Substack</h3>
          <p className="text-sm text-gray-600 mt-1">
            Fetch your latest Substack posts and import them to your blog
          </p>
        </div>
        <Button onClick={fetchPosts} disabled={loading}>
          {loading ? 'Fetching...' : posts.length > 0 ? 'Refresh Posts' : 'Fetch Posts'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
          <Loader message="Fetching your Substack posts..." />
        </div>
      )}

      {/* Posts List */}
      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-cyan-400 transition-colors"
            >
              {/* Post Header */}
              <div className="flex gap-4 mb-4">
                {/* Thumbnail */}
                {post.heroImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={post.heroImage}
                      alt={post.title}
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}

                {/* Post Info */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{post.title}</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Published: {new Date(post.publishedAt).toLocaleDateString()} • Slug: <code className="bg-gray-100 px-1 rounded">{post.slug}</code>
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                    {post.intro}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>📝 {post.sections.length} store sections</span>
                    <span>🖼️ {post.rawImages.length} images</span>
                  </div>
                </div>
              </div>

              {/* Store Sections Preview */}
              {post.sections.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Store Sections:</p>
                  <div className="space-y-1">
                    {post.sections.map((section, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        {i + 1}. {section.store_name}
                        {section.address && (
                          <span className="text-gray-500"> • {section.address.substring(0, 40)}...</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleImport(post)}
                >
                  Import This Post
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPost(selectedPost?.slug === post.slug ? null : post)}
                >
                  {selectedPost?.slug === post.slug ? 'Hide Details' : 'View Details'}
                </Button>
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View on Substack →
                </a>
              </div>

              {/* Expanded Details */}
              {selectedPost?.slug === post.slug && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Intro Content:</p>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 whitespace-pre-line">
                      {post.intro}
                    </p>
                  </div>

                  {post.sections.map((section, i) => (
                    <div key={i} className="bg-white p-4 rounded border border-gray-200">
                      <div className="flex items-start gap-3 mb-2">
                        {section.image && (
                          <img
                            src={section.image}
                            alt={section.store_name}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">{section.store_name}</p>
                          {section.address && (
                            <p className="text-xs text-gray-600 mb-1">📍 {section.address}</p>
                          )}
                          {section.map_link && (
                            <a
                              href={section.map_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Map →
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600 mb-4">No posts loaded yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Click "Fetch Posts" to load your latest Substack articles
          </p>
        </div>
      )}
    </div>
  );
}
