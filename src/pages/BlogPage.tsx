import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/common/Loader';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  hero_image: string | null;
  content: string;
  category: string | null;
  published_at: string;
}

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Featured post (most recent)
  const featuredPost = posts[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-gray-900 mb-4">Japan Maps Blog</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover hidden gems, neighborhood guides, and curated store recommendations across Japan's most exciting cities.
        </p>
      </div>

      {/* Featured Article */}
      {featuredPost && (
        <div className="mb-16">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {featuredPost.hero_image && (
              <img 
                src={featuredPost.hero_image} 
                alt={featuredPost.title}
                className="w-full h-96 object-cover"
              />
            )}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gray-400 text-sm">
                  {new Date(featuredPost.published_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">
                <Link 
                  to={`/blog/${featuredPost.slug}`}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed line-clamp-3 mb-6">
                {featuredPost.content.slice(0, 200)}...
              </p>
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-bold rounded-full hover:bg-cyan-600 transition-colors"
              >
                Read More →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Blog Posts Grid */}
      {loading ? (
        <Loader message="Loading blog posts..." />
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No blog posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-gray-200"
            >
              {post.hero_image && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.hero_image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-gray-500 text-xs">
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="hover:text-cyan-500 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {post.content.slice(0, 150)}...
                </p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-cyan-600 font-medium hover:text-cyan-700 transition-colors"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
