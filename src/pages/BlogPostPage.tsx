import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader } from '../components/common/Loader';
import { ArchiveStoresJapan } from './ArchiveStoresJapan';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  hero_image: string | null;
  content: string;
  category: string | null;
  referenced_stores: string[];
  published_at: string;
  updated_at: string;
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  // Special handling for parallax editorial pages
  if (slug === 'best-archive-clothing-stores-in-japan') {
    return <ArchiveStoresJapan />;
  }

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
      fetchRelatedPosts(slug);
    }
  }, [slug]);

  async function fetchPost(slug: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRelatedPosts(currentSlug: string) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Loader message="Loading article..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
        <Link
          to="/blog"
          className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-full hover:bg-cyan-600 transition-colors"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Image */}
      {post.hero_image && (
        <div className="relative h-[60vh] -mt-16 mb-8">
          <img 
            src={post.hero_image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-white/80 text-sm">
                {new Date(post.published_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <h1 className="text-5xl font-black text-white">
              {post.title}
            </h1>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-lg prose-cyan">
          {/* Meta info (if no hero image) */}
          {!post.hero_image && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-600 text-sm">
                  {new Date(post.published_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <h1 className="text-5xl font-black text-gray-900 mb-6">
                {post.title}
              </h1>
            </div>
          )}

          {/* Markdown Content */}
          <div className="markdown-content prose prose-lg prose-cyan max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Referenced Stores (placeholder for future) */}
          {post.referenced_stores && post.referenced_stores.length > 0 && (
            <div className="mt-12 p-6 bg-gray-50 rounded-xl border-l-4 border-cyan-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Related Stores
              </h3>
              <p className="text-gray-600">
                Store linking feature coming soon!
              </p>
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              More Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-gray-200"
                >
                  {relatedPost.hero_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={relatedPost.hero_image} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-500 text-xs">
                        {new Date(relatedPost.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-cyan-500 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedPost.content.slice(0, 100)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            ← Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
