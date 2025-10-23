import { MapPin, Heart, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Japan Clothing Map</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          Your curated guide to discovering the best clothing stores across Japan - from hidden 
          vintage gems to premier archive shops.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Curated Selection</h3>
            <p className="text-gray-600">
              Every store is hand-picked and verified for quality and authenticity.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
            <p className="text-gray-600">
              Built by enthusiasts, for enthusiasts. Your suggestions make us better.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Always Growing</h3>
            <p className="text-gray-600">
              New stores added regularly as we explore more of Japan's fashion scene.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Our Story</h2>
        <p className="text-gray-700 mb-4">
          Japan Clothing Map started from a simple need: finding the best clothing stores while 
          traveling through Japan. After countless hours searching Reddit threads, Instagram posts, 
          and Google Maps, I realized there had to be a better way.
        </p>
        <p className="text-gray-700 mb-4">
          This platform is designed to be the resource I wish I had - a visual, organized, and 
          community-driven map that makes discovering amazing stores effortless. Whether you're 
          hunting for rare archive pieces, exploring vintage shops, or just want to know where 
          locals shop, we've got you covered.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">What We Cover</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>Archive and designer clothing stores</li>
          <li>Vintage and secondhand shops</li>
          <li>Streetwear boutiques</li>
          <li>Independent and concept stores</li>
          <li>Hidden gems off the beaten path</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Get Involved</h2>
        <p className="text-gray-700 mb-4">
          Know a great store that's not on our map? We'd love to hear about it! Use our 
          suggestion form to share your favorite spots. Every submission helps make this 
          resource better for the entire community.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Questions or Feedback?</h3>
          <p className="text-blue-800 mb-4">
            I'm always looking to improve this platform. Reach out with your ideas, suggestions, 
            or just to say hi!
          </p>
          <a
            href="mailto:hello@example.com"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Email: hello@example.com
          </a>
        </div>
      </div>
    </div>
  );
}


