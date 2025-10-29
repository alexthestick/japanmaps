import { ParallaxGuideSection } from '../components/common/ParallaxGuideSection';

export function ArchiveStoresJapan() {
  const heroImage = "https://avhtmmmblkjvinhhddzq.supabase.co/storage/v1/object/public/storage-photos/5424b468-8db4-4d65-90dc-66eebcb07490-0-1760459293537.jpeg";

  return (
    <article className="bg-white text-gray-900 min-h-screen">
      {/* Hero Image Banner */}
      <div className="relative h-[70vh] -mt-16 mb-16">
        <img 
          src={heroImage} 
          alt="Best Archive Stores in Japan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 md:bottom-16 md:left-16 md:right-16">
          <h1 className="text-4xl md:text-6xl font-black text-white">
            Best Archive Stores in Japan
          </h1>
        </div>
      </div>

      {/* Intro Paragraph in Styled Container */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <div className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 md:p-12 shadow-lg">
          {/* Decorative accent */}
          <div className="absolute top-0 left-8 w-1 h-24 bg-gradient-to-b from-cyan-500 to-pink-400 rounded-full"></div>
          
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
            Japan truly has one of the most unique and passionate archive clothing scenes in the world — from Tokyo to Osaka, you'll find rare pieces from coveted designers like Raf Simons, Undercover, Yohji Yamamoto, Issey Miyake and many more. Even beyond the designers we all love, there are stores curating other designers that you might not have known there was such deep passion for. Beyond the clothes it's the experience — walking into one of these often-hidden stores feels like stepping into archive clothing heaven.
          </p>
        </div>
      </div>

      <ParallaxGuideSection
        title="PAT MARKET TOKYO"
        description={`My favorite type of store in Japan is the one where it feels like you are walking into someone's apartment. The experience of walking into PAT MARKET TOKYO for the first time almost feels like a movie — hidden between residential alleys in Harajuku, leading to a two-story space filled with rare designer pieces and creative energy.`}
        image="https://avhtmmmblkjvinhhddzq.supabase.co/storage/v1/object/public/storage-photos/7bf4a15d-e71b-40df-8ca7-3d648262dd94-0-1760459074422.jpeg"
        address="3-chōme-27-8 Jingūmae, Shibuya, Tokyo 150-0001, Japan"
        mapLink="https://maps.app.goo.gl/ozL8bjTsQC7j6PJW6"
      />

      <ParallaxGuideSection
        title="Archive Store Tokyo"
        description={`A hidden space dedicated exclusively to iconic archive pieces — think Raf Simons, Helmut Lang, and Dior Homme from the Hedi Slimane era. You descend a small staircase into what feels like a private museum filled with rare runway artifacts and pieces older than most visitors.`}
        image="https://avhtmmmblkjvinhhddzq.supabase.co/storage/v1/object/public/storage-photos/34d13076-5233-406d-9807-295824b581f3-1-1761700401952.jpeg"
        address="1 Chome−12−16 Jinnan, Shibuya, Tokyo 150-0041, Japan"
        mapLink="https://maps.app.goo.gl/EE9maqazqvM1tnjW8"
        reverse
      />

      <ParallaxGuideSection
        title="COIL VINTAGE KYOTO"
        description={`Nestled in Kyoto's Shimogyo Ward, Coil offers a refined curation of vintage British and Japanese designers. The single-room layout, centerpiece table, and thoughtful presentation create one of the most charming shopping experiences in the city.`}
        image="https://avhtmmmblkjvinhhddzq.supabase.co/storage/v1/object/public/storage-photos/b3819bba-ff4d-4edd-b883-b81b93d78769-0-1760222136289.jpeg"
        address="98 Nushiyacho, Shimogyo Ward, Kyoto 600-8053, Japan"
        mapLink="https://maps.app.goo.gl/4SB6WyqEJvS5iUKD6"
      />
    </article>
  );
}

