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

  // Random pin colors for variety
  const pinColors = ['#E63946', '#457B9D', '#F4A261', '#2A9D8F', '#E76F51'];
  const getRandomPin = () => pinColors[Math.floor(Math.random() * pinColors.length)];
  const getRandomRotation = () => {
    const rotations = ['-2deg', '-1deg', '0deg', '1deg', '2deg', '3deg'];
    return rotations[Math.floor(Math.random() * rotations.length)];
  };

  return (
    <div
      className="min-h-screen relative py-6 md:py-12"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.03 0'/%3E%3C/filter%3E%3C/defs%3E%3Crect fill='%23B8956A' width='600' height='600'/%3E%3C!-- Main grain lines --%3E%3Cpath d='M0 30 Q150 28 300 30 T600 30' stroke='%23A17D50' stroke-width='3' fill='none' opacity='0.6'/%3E%3Cpath d='M0 32 Q150 30 300 32 T600 32' stroke='%238B6942' stroke-width='1' fill='none' opacity='0.4'/%3E%3Cpath d='M0 75 Q150 73 300 75 T600 75' stroke='%239A7B4F' stroke-width='4' fill='none' opacity='0.5'/%3E%3Cpath d='M0 78 Q150 76 300 78 T600 78' stroke='%237D5E3F' stroke-width='1.5' fill='none' opacity='0.35'/%3E%3Cpath d='M0 130 Q150 127 300 130 T600 130' stroke='%23A17D50' stroke-width='2.5' fill='none' opacity='0.55'/%3E%3Cpath d='M0 133 Q150 131 300 133 T600 133' stroke='%238B6942' stroke-width='1' fill='none' opacity='0.3'/%3E%3Cpath d='M0 185 Q150 183 300 185 T600 185' stroke='%239A7B4F' stroke-width='3.5' fill='none' opacity='0.6'/%3E%3Cpath d='M0 188 Q150 186 300 188 T600 188' stroke='%237D5E3F' stroke-width='1.2' fill='none' opacity='0.4'/%3E%3Cpath d='M0 245 Q150 242 300 245 T600 245' stroke='%23A17D50' stroke-width='2' fill='none' opacity='0.5'/%3E%3Cpath d='M0 305 Q150 303 300 305 T600 305' stroke='%239A7B4F' stroke-width='3' fill='none' opacity='0.55'/%3E%3Cpath d='M0 308 Q150 306 300 308 T600 308' stroke='%238B6942' stroke-width='1.5' fill='none' opacity='0.35'/%3E%3Cpath d='M0 370 Q150 368 300 370 T600 370' stroke='%23A17D50' stroke-width='2.8' fill='none' opacity='0.6'/%3E%3Cpath d='M0 435 Q150 432 300 435 T600 435' stroke='%239A7B4F' stroke-width='3.2' fill='none' opacity='0.5'/%3E%3Cpath d='M0 438 Q150 436 300 438 T600 438' stroke='%237D5E3F' stroke-width='1.3' fill='none' opacity='0.38'/%3E%3Cpath d='M0 500 Q150 498 300 500 T600 500' stroke='%23A17D50' stroke-width='2.5' fill='none' opacity='0.55'/%3E%3Cpath d='M0 565 Q150 563 300 565 T600 565' stroke='%239A7B4F' stroke-width='3' fill='none' opacity='0.52'/%3E%3C!-- Fine detail lines --%3E%3Cpath d='M0 50 Q150 49.5 300 50 T600 50' stroke='%238B6942' stroke-width='0.8' fill='none' opacity='0.25'/%3E%3Cpath d='M0 95 Q150 94.5 300 95 T600 95' stroke='%237D5E3F' stroke-width='0.6' fill='none' opacity='0.2'/%3E%3Cpath d='M0 155 Q150 154.5 300 155 T600 155' stroke='%238B6942' stroke-width='0.7' fill='none' opacity='0.22'/%3E%3Cpath d='M0 220 Q150 219.5 300 220 T600 220' stroke='%239A7B4F' stroke-width='0.9' fill='none' opacity='0.28'/%3E%3Cpath d='M0 280 Q150 279.5 300 280 T600 280' stroke='%237D5E3F' stroke-width='0.6' fill='none' opacity='0.2'/%3E%3Cpath d='M0 345 Q150 344.5 300 345 T600 345' stroke='%238B6942' stroke-width='0.8' fill='none' opacity='0.24'/%3E%3Cpath d='M0 405 Q150 404.5 300 405 T600 405' stroke='%239A7B4F' stroke-width='0.7' fill='none' opacity='0.26'/%3E%3Cpath d='M0 470 Q150 469.5 300 470 T600 470' stroke='%237D5E3F' stroke-width='0.6' fill='none' opacity='0.21'/%3E%3Cpath d='M0 535 Q150 534.5 300 535 T600 535' stroke='%238B6942' stroke-width='0.8' fill='none' opacity='0.23'/%3E%3C!-- Wood knots --%3E%3Cellipse cx='180' cy='110' rx='25' ry='12' fill='%237D5E3F' opacity='0.3'/%3E%3Cellipse cx='180' cy='110' rx='15' ry='7' fill='%236B4F3A' opacity='0.25'/%3E%3Cellipse cx='420' cy='280' rx='30' ry='15' fill='%237D5E3F' opacity='0.28'/%3E%3Cellipse cx='420' cy='280' rx='18' ry='9' fill='%236B4F3A' opacity='0.22'/%3E%3Cellipse cx='90' cy='390' rx='22' ry='11' fill='%237D5E3F' opacity='0.32'/%3E%3Cellipse cx='90' cy='390' rx='12' ry='6' fill='%236B4F3A' opacity='0.26'/%3E%3Crect width='600' height='600' filter='url(%23noise)' /%3E%3C/svg%3E")`,
        backgroundColor: '#B8956A',
      }}
    >
      <div className="max-w-6xl mx-auto px-3 md:px-4 relative z-10">
        {/* Bulletin Board Container - Sage Green Frame */}
        <div
          className="relative"
          style={{
            background: 'linear-gradient(135deg, #9CAF88 0%, #7A9B6C 100%)',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)',
          }}
        >
          {/* Cork Board Inside */}
          <div
            className="relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23D4A574' width='200' height='200'/%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23C69C6D' opacity='0.6'/%3E%3Ccircle cx='45' cy='35' r='1' fill='%23B8956A' opacity='0.5'/%3E%3Ccircle cx='80' cy='15' r='1.2' fill='%23C69C6D' opacity='0.6'/%3E%3Ccircle cx='60' cy='50' r='0.8' fill='%23B8956A' opacity='0.5'/%3E%3Ccircle cx='95' cy='45' r='1.3' fill='%23C69C6D' opacity='0.6'/%3E%3Ccircle cx='25' cy='70' r='1.1' fill='%23B8956A' opacity='0.5'/%3E%3Ccircle cx='120' cy='30' r='1' fill='%23C69C6D' opacity='0.6'/%3E%3Ccircle cx='150' cy='60' r='1.4' fill='%23B8956A' opacity='0.5'/%3E%3Ccircle cx='180' cy='25' r='0.9' fill='%23C69C6D' opacity='0.6'/%3E%3Ccircle cx='110' cy='80' r='1.2' fill='%23B8956A' opacity='0.5'/%3E%3C/svg%3E")`,
              backgroundColor: '#D4A574',
              minHeight: '800px',
              padding: '16px',
              borderRadius: '4px',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            {/* Header Bar */}
            <div
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 md:p-6 mb-6 md:mb-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              }}
            >
              {/* Title */}
              <h1
                className="text-2xl md:text-4xl font-black"
                style={{
                  color: '#2C1810',
                  fontFamily: 'Georgia, serif',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                }}
              >
                Lost In Transit Bulletin Board
              </h1>

              {/* Search */}
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-600 w-full md:w-80 text-base"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  color: '#2C1810',
                }}
              />
            </div>

            {/* Blog Posts Grid */}
            {loading ? (
              <Loader message="Loading blog posts..." />
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div
                  className="inline-block bg-white px-8 py-6 shadow-lg"
                  style={{
                    transform: 'rotate(-2deg)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <p className="text-gray-800 text-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    No blog posts found.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {filteredPosts.map((post, index) => {
                  const rotation = getRandomRotation();
                  const pinColor = getRandomPin();

                  return (
                    <article
                      key={post.id}
                      className="bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer relative p-4 md:p-5"
                      style={{
                        transform: `rotate(${rotation})`,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 3px 10px rgba(0,0,0,0.2)',
                      }}
                    >
                      {/* Push Pin */}
                      <div
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full shadow-lg z-10"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${pinColor}, ${pinColor}dd)`,
                          boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        <div className="w-2 h-2 bg-white/50 rounded-full absolute top-1 left-1" />
                      </div>

                      <Link to={`/blog/${post.slug}`} className="block">
                        {post.hero_image && (
                          <div className="relative h-44 md:h-48 mb-4 overflow-hidden">
                            <img
                              src={post.hero_image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p
                            className="text-xs mb-2"
                            style={{
                              color: '#666',
                              fontFamily: 'Comic Sans MS, cursive',
                            }}
                          >
                            {new Date(post.published_at).toLocaleDateString()}
                          </p>
                          <h3
                            className="text-base md:text-lg font-bold mb-2 line-clamp-2"
                            style={{
                              color: '#2C1810',
                              fontFamily: 'Georgia, serif',
                            }}
                          >
                            {post.title}
                          </h3>
                          <p
                            className="text-sm line-clamp-3 leading-relaxed"
                            style={{
                              color: '#5C4033',
                              fontFamily: 'Arial, sans-serif',
                            }}
                          >
                            {post.content.slice(0, 120)}...
                          </p>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
