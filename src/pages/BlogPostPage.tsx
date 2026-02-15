import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/common/Loader';
import { ParallaxGuideSection } from '../components/common/ParallaxGuideSection';
import { SEOHead } from '../components/seo';
import type { ParallaxStoreSection } from '../types/blog';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#8230;/g, '\u2026')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

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
  article_type: 'standard' | 'parallax_store_guide';
  intro_content: string | null;
  sections_data: ParallaxStoreSection[] | null;
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
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

  // Generate SEO data
  const seoDescription = post.intro_content
    ? post.intro_content.slice(0, 160)
    : post.content.slice(0, 160);

  const blogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url: `https://lostintransitjp.com/blog/${post.slug}`,
    description: seoDescription,
    image: post.hero_image || 'https://ik.imagekit.io/wscyshoygv/og-default.jpg',
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Organization',
      name: 'Lost in Transit JP',
      url: 'https://lostintransitjp.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lost in Transit JP',
      url: 'https://lostintransitjp.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lostintransitjp.com/blog/${post.slug}`,
    },
  };

  // Render Parallax Store Guide with Bulletin Board styling
  if (post.article_type === 'parallax_store_guide') {
    return (
      <>
        {/* SEO Head */}
        <SEOHead
          title={post.title}
          description={seoDescription}
          image={post.hero_image || undefined}
          url={`/blog/${post.slug}`}
          type="article"
          jsonLd={blogPostSchema}
        />

        <article className="min-h-screen relative py-6 md:py-12">
        {/* Realistic Wood Grain Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.03 0'/%3E%3C/filter%3E%3C/defs%3E%3Crect fill='%23B8956A' width='600' height='600'/%3E%3C!-- Main grain lines --%3E%3Cpath d='M0 30 Q150 28 300 30 T600 30' stroke='%23A17D50' stroke-width='3' fill='none' opacity='0.6'/%3E%3Cpath d='M0 32 Q150 30 300 32 T600 32' stroke='%238B6942' stroke-width='1' fill='none' opacity='0.4'/%3E%3Cpath d='M0 75 Q150 73 300 75 T600 75' stroke='%239A7B4F' stroke-width='4' fill='none' opacity='0.5'/%3E%3Cpath d='M0 78 Q150 76 300 78 T600 78' stroke='%237D5E3F' stroke-width='1.5' fill='none' opacity='0.35'/%3E%3Cpath d='M0 130 Q150 127 300 130 T600 130' stroke='%23A17D50' stroke-width='2.5' fill='none' opacity='0.55'/%3E%3Cpath d='M0 133 Q150 131 300 133 T600 133' stroke='%238B6942' stroke-width='1' fill='none' opacity='0.3'/%3E%3Cpath d='M0 185 Q150 183 300 185 T600 185' stroke='%239A7B4F' stroke-width='3.5' fill='none' opacity='0.6'/%3E%3Cpath d='M0 188 Q150 186 300 188 T600 188' stroke='%237D5E3F' stroke-width='1.2' fill='none' opacity='0.4'/%3E%3Cpath d='M0 245 Q150 242 300 245 T600 245' stroke='%23A17D50' stroke-width='2' fill='none' opacity='0.5'/%3E%3Cpath d='M0 305 Q150 303 300 305 T600 305' stroke='%239A7B4F' stroke-width='3' fill='none' opacity='0.55'/%3E%3Cpath d='M0 308 Q150 306 300 308 T600 308' stroke='%238B6942' stroke-width='1.5' fill='none' opacity='0.35'/%3E%3Cpath d='M0 370 Q150 368 300 370 T600 370' stroke='%23A17D50' stroke-width='2.8' fill='none' opacity='0.6'/%3E%3Cpath d='M0 435 Q150 432 300 435 T600 435' stroke='%239A7B4F' stroke-width='3.2' fill='none' opacity='0.5'/%3E%3Cpath d='M0 438 Q150 436 300 438 T600 438' stroke='%237D5E3F' stroke-width='1.3' fill='none' opacity='0.38'/%3E%3Cpath d='M0 500 Q150 498 300 500 T600 500' stroke='%23A17D50' stroke-width='2.5' fill='none' opacity='0.55'/%3E%3Cpath d='M0 565 Q150 563 300 565 T600 565' stroke='%239A7B4F' stroke-width='3' fill='none' opacity='0.52'/%3E%3C!-- Fine detail lines --%3E%3Cpath d='M0 50 Q150 49.5 300 50 T600 50' stroke='%238B6942' stroke-width='0.8' fill='none' opacity='0.25'/%3E%3Cpath d='M0 95 Q150 94.5 300 95 T600 95' stroke='%237D5E3F' stroke-width='0.6' fill='none' opacity='0.2'/%3E%3Cpath d='M0 155 Q150 154.5 300 155 T600 155' stroke='%238B6942' stroke-width='0.7' fill='none' opacity='0.22'/%3E%3Cpath d='M0 220 Q150 219.5 300 220 T600 220' stroke='%239A7B4F' stroke-width='0.9' fill='none' opacity='0.28'/%3E%3Cpath d='M0 280 Q150 279.5 300 280 T600 280' stroke='%237D5E3F' stroke-width='0.6' fill='none' opacity='0.2'/%3E%3Cpath d='M0 345 Q150 344.5 300 345 T600 345' stroke='%238B6942' stroke-width='0.8' fill='none' opacity='0.24'/%3E%3Cpath d='M0 405 Q150 404.5 300 405 T600 405' stroke='%239A7B4F' stroke-width='0.7' fill='none' opacity='0.26'/%3E%3Cpath d='M0 470 Q150 469.5 300 470 T600 470' stroke='%237D5E3F' stroke-width='0.6' fill='none' opacity='0.21'/%3E%3Cpath d='M0 535 Q150 534.5 300 535 T600 535' stroke='%238B6942' stroke-width='0.8' fill='none' opacity='0.23'/%3E%3C!-- Wood knots --%3E%3Cellipse cx='180' cy='110' rx='25' ry='12' fill='%237D5E3F' opacity='0.3'/%3E%3Cellipse cx='180' cy='110' rx='15' ry='7' fill='%236B4F3A' opacity='0.25'/%3E%3Cellipse cx='420' cy='280' rx='30' ry='15' fill='%237D5E3F' opacity='0.28'/%3E%3Cellipse cx='420' cy='280' rx='18' ry='9' fill='%236B4F3A' opacity='0.22'/%3E%3Cellipse cx='90' cy='390' rx='22' ry='11' fill='%237D5E3F' opacity='0.32'/%3E%3Cellipse cx='90' cy='390' rx='12' ry='6' fill='%236B4F3A' opacity='0.26'/%3E%3Crect width='600' height='600' filter='url(%23noise)' /%3E%3C/svg%3E")`,
            backgroundColor: '#B8956A',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Sage Green Frame */}
          <div className="max-w-7xl mx-auto px-3 md:px-8">
            <div
              className="p-3 md:p-8"
              style={{
                background: 'linear-gradient(135deg, #9CAF88 0%, #8BA177 50%, #7A9B6C 100%)',
                borderRadius: '8px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)',
              }}
            >
              {/* Super Light Yellow Bulletin Board Background */}
              <div
                className="p-4 md:p-16 relative"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23FFFACD' width='200' height='200'/%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23F5E6A8' opacity='0.7'/%3E%3Ccircle cx='45' cy='35' r='1' fill='%23EDD89E' opacity='0.6'/%3E%3Ccircle cx='80' cy='15' r='1.2' fill='%23F5E6A8' opacity='0.7'/%3E%3Ccircle cx='60' cy='50' r='0.8' fill='%23EDD89E' opacity='0.6'/%3E%3Ccircle cx='95' cy='45' r='1.3' fill='%23F5E6A8' opacity='0.7'/%3E%3Ccircle cx='25' cy='70' r='1.1' fill='%23EDD89E' opacity='0.6'/%3E%3Ccircle cx='120' cy='30' r='1' fill='%23F5E6A8' opacity='0.7'/%3E%3Ccircle cx='150' cy='60' r='1.4' fill='%23EDD89E' opacity='0.6'/%3E%3Ccircle cx='180' cy='25' r='0.9' fill='%23F5E6A8' opacity='0.7'/%3E%3Ccircle cx='110' cy='80' r='1.2' fill='%23EDD89E' opacity='0.6'/%3E%3C/svg%3E")`,
                  backgroundColor: '#FFFACD',
                  borderRadius: '4px',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                {/* Decorative Pins Scattered on Green Cork - More visible */}
                <div className="absolute top-12 left-16 w-5 h-5 rounded-full opacity-60" style={{ background: 'radial-gradient(circle at 30% 30%, #E63946, #B91C1C)', boxShadow: '0 3px 6px rgba(0,0,0,0.4)' }}>
                  <div className="w-2 h-2 bg-white/60 rounded-full absolute top-1 left-1" />
                </div>
                <div className="absolute top-24 right-32 w-5 h-5 rounded-full opacity-60" style={{ background: 'radial-gradient(circle at 30% 30%, #FFC107, #FFA000)', boxShadow: '0 3px 6px rgba(0,0,0,0.4)' }}>
                  <div className="w-2 h-2 bg-white/60 rounded-full absolute top-1 left-1" />
                </div>
                <div className="absolute bottom-32 left-24 w-5 h-5 rounded-full opacity-60" style={{ background: 'radial-gradient(circle at 30% 30%, #8BC34A, #689F38)', boxShadow: '0 3px 6px rgba(0,0,0,0.4)' }}>
                  <div className="w-2 h-2 bg-white/60 rounded-full absolute top-1 left-1" />
                </div>
                <div className="absolute top-1/3 right-16 w-5 h-5 rounded-full opacity-60" style={{ background: 'radial-gradient(circle at 30% 30%, #2196F3, #1976D2)', boxShadow: '0 3px 6px rgba(0,0,0,0.4)' }}>
                  <div className="w-2 h-2 bg-white/60 rounded-full absolute top-1 left-1" />
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-5 h-5 rounded-full opacity-60" style={{ background: 'radial-gradient(circle at 30% 30%, #FF5722, #E64A19)', boxShadow: '0 3px 6px rgba(0,0,0,0.4)' }}>
                  <div className="w-2 h-2 bg-white/60 rounded-full absolute top-1 left-1" />
                </div>
                <div className="absolute top-2/3 left-1/3 w-5 h-5 rounded-full opacity-60" style={{ background: 'radial-gradient(circle at 30% 30%, #9C27B0, #7B1FA2)', boxShadow: '0 3px 6px rgba(0,0,0,0.4)' }}>
                  <div className="w-2 h-2 bg-white/60 rounded-full absolute top-1 left-1" />
                </div>

                {/* Dual Bulletin Board Hero Section - 70/30 Split */}
                <div className="grid grid-cols-1 md:grid-cols-10 gap-4 md:gap-10 mb-8 md:mb-24 mt-3 md:mt-6">
                  {/* Right: Hero Image (HUGE - 70%) */}
                  {post.hero_image && (
                    <div className="md:col-span-7 relative order-1 md:order-2">
                      <div
                        className="bg-white p-2 md:p-3 pb-10 md:pb-14 shadow-2xl relative"
                        style={{
                          transform: 'rotate(2deg)',
                          boxShadow: '0 15px 60px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.3)',
                        }}
                      >
                        {/* Washi Tape at top */}
                        <div
                          className="absolute -top-3 left-1/4 w-16 md:w-24 h-5 md:h-6 opacity-80"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent), linear-gradient(90deg, #FFB6C1 0%, #FFB6C1 100%)',
                            transform: 'rotate(-3deg)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        />
                        <div
                          className="absolute -top-3 right-1/4 w-16 md:w-24 h-5 md:h-6 opacity-80"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent), linear-gradient(90deg, #87CEEB 0%, #87CEEB 100%)',
                            transform: 'rotate(4deg)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        />

                        {/* Hero Image - Responsive: 4:3 mobile, taller on desktop */}
                        <div className="parallax-hero-image overflow-hidden bg-gray-100 md:h-[600px]" style={{ aspectRatio: '4/3' }}>
                          <style>{`
                            @media (min-width: 768px) {
                              .parallax-hero-image {
                                aspect-ratio: auto !important;
                                height: 600px;
                              }
                            }
                          `}</style>
                          <img
                            src={post.hero_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Polaroid caption */}
                        <div className="mt-2 md:mt-4 text-center">
                          <p
                            className="text-xs md:text-sm italic"
                            style={{
                              color: '#666',
                              fontFamily: 'Comic Sans MS, cursive',
                            }}
                          >
                            {post.title}
                          </p>
                        </div>

                        {/* Corner curl effect */}
                        <div
                          className="absolute bottom-2 right-2 w-8 h-8 bg-gray-200 opacity-50"
                          style={{
                            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                            transform: 'rotate(0deg)',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Left: Title + Intro Text (30%) - WHITE */}
                  <div className="md:col-span-3 relative order-2 md:order-1 mt-0 md:mt-6">
                    <div
                      className="bg-white p-4 md:p-6 lg:p-8 shadow-2xl relative"
                      style={{
                        transform: 'rotate(-2deg)',
                        boxShadow: '0 15px 60px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.3)',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence baseFrequency='0.04' numOctaves='5' /%3E%3CfeColorMatrix values='0 0 0 0 0.96, 0 0 0 0 0.96, 0 0 0 0 0.96, 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23paper)' opacity='0.25'/%3E%3C/svg%3E")`,
                      }}
                    >
                      {/* Push Pin */}
                      <div
                        className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 w-6 md:w-7 h-6 md:h-7 rounded-full shadow-lg z-10"
                        style={{
                          background: 'radial-gradient(circle at 30% 30%, #E63946, #B91C1C)',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        <div className="w-2 h-2 bg-white/50 rounded-full absolute top-1.5 md:top-2 left-1.5 md:left-2" />
                      </div>

                      {/* Title */}
                      <h1
                        className="text-xl md:text-2xl lg:text-3xl font-black mb-3 md:mb-4"
                        style={{
                          color: '#2C1810',
                          fontFamily: 'Georgia, serif',
                          lineHeight: '1.2',
                        }}
                      >
                        {post.title}
                      </h1>

                      {/* Date */}
                      <p
                        className="text-xs mb-3 md:mb-4"
                        style={{
                          color: '#666',
                          fontFamily: 'Comic Sans MS, cursive',
                        }}
                      >
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>

                      {/* Intro Content */}
                      {post.intro_content && (
                        <p
                          className="text-sm md:text-base leading-relaxed whitespace-pre-line"
                          style={{
                            color: '#3C3C3C',
                            fontFamily: 'Georgia, serif',
                            lineHeight: '1.7',
                          }}
                        >
                          {decodeHtmlEntities(post.intro_content)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parallax Store Sections */}
                {post.sections_data && post.sections_data.map((section, index) => (
                  <ParallaxGuideSection
                    key={index}
                    title={section.store_name}
                    description={section.description}
                    image={section.image}
                    address={section.address}
                    mapLink={section.map_link}
                    reverse={section.reverse}
                  />
                ))}

                {/* Back to Blog Button */}
                <div className="mt-12 md:mt-16 lg:mt-24 text-center">
                  <Link
                    to="/blog"
                    className="inline-block bg-yellow-100 px-6 md:px-8 py-3 md:py-4 font-bold hover:bg-yellow-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-base md:text-lg"
                    style={{
                      color: '#2C1810',
                      fontFamily: 'Comic Sans MS, cursive',
                      transform: 'rotate(-1.5deg)',
                    }}
                  >
                    ← Back to All Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
      </>
    );
  }

  // Render Standard Article (bulletin board style - fallback)
  return (
    <>
      {/* SEO Head */}
      <SEOHead
        title={post.title}
        description={seoDescription}
        image={post.hero_image || undefined}
        url={`/blog/${post.slug}`}
        type="article"
        jsonLd={blogPostSchema}
      />

      <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(135deg, #D4A574 0%, #C69C6D 50%, #B8956A 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v1H0zM0 20h100v1H0zM0 40h100v1H0zM0 60h100v1H0zM0 80h100v1H0z' fill='%23000' fill-opacity='0.1'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
        }}
      />

      <div className="max-w-4xl mx-auto px-3 md:px-4 py-8 md:py-16 relative z-10">
        <div
          className="bg-gradient-to-br from-white to-gray-50 shadow-2xl p-6 md:p-12 relative"
          style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="absolute -top-3 md:-top-4 left-6 md:left-12 w-6 md:w-7 h-6 md:h-7 rounded-full shadow-lg"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #E63946, #B91C1C)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.3)'
            }}
          >
            <div className="w-2 h-2 bg-white/50 rounded-full absolute top-1.5 left-1.5" />
          </div>
          <div
            className="absolute -top-3 md:-top-4 right-6 md:right-12 w-6 md:w-7 h-6 md:h-7 rounded-full shadow-lg"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #457B9D, #2C5F7C)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.3)'
            }}
          >
            <div className="w-2 h-2 bg-white/50 rounded-full absolute top-1.5 left-1.5" />
          </div>

          {post.hero_image && (
            <div className="standard-hero-image relative mb-4 md:mb-8 -mx-6 md:-mx-12 -mt-6 md:-mt-12 overflow-hidden md:h-[50vh]" style={{ aspectRatio: '16/9' }}>
              <style>{`
                @media (min-width: 768px) {
                  .standard-hero-image {
                    aspect-ratio: auto !important;
                    height: 50vh;
                    min-height: 400px;
                  }
                }
              `}</style>
              <img
                src={post.hero_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mb-6 md:mb-8">
            <p
              className="text-xs md:text-sm mb-3 md:mb-4"
              style={{
                color: '#666',
                fontFamily: 'Comic Sans MS, cursive',
              }}
            >
              {new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <h1
              className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6"
              style={{
                color: '#2C1810',
                fontFamily: 'Georgia, serif',
                lineHeight: '1.2',
              }}
            >
              {post.title}
            </h1>
          </div>

          <div
            className="prose prose-sm md:prose-lg max-w-none"
            style={{
              color: '#3C3C3C',
              fontFamily: 'Georgia, serif',
              lineHeight: '1.7',
              fontSize: '1rem',
            }}
          >
            <p className="whitespace-pre-line text-base md:text-lg leading-relaxed">{decodeHtmlEntities(post.content)}</p>
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <Link
              to="/blog"
              className="inline-block bg-yellow-100 px-6 py-3 font-bold hover:bg-yellow-200 transition-all shadow-md hover:shadow-lg text-base"
              style={{
                color: '#2C1810',
                fontFamily: 'Comic Sans MS, cursive',
                transform: 'rotate(-1deg)',
              }}
            >
              ← Back to All Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
