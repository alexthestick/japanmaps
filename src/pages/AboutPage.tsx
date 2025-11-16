import { MapPin, Heart, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Lost in Transit</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          Your curated guide to discovering the best of Japan - from hidden vintage gems and premier archive shops to amazing food, coffee, and cultural experiences.
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
          Lost in Transit started out from my personal travels of going to Japan and exploring the fashion scene out there. I was enamored with how many different clothing stores, boutiques, shops, and hidden gems could be found in the country. Specifically with archive, used designer, and vintage clothing, there is such a huge concentration of these stores wherever you go it seems. I documented my trips on my personal YouTube account and wanted to show love to all the spots I found. I have had multiple experiences where I didn't even purchase anything but the hospitality, the customer service and just the experience of being in the stores made me feel something.
        </p>
        <p className="text-gray-700 mb-4">
          Previously, I would keep all the places I like saved on a bloated Google Maps folder but it wasn't until a recent Disneyland trip that inspired the creation of making this site. After all, shopping for clothes in Japan feels like Disneyland to me. This website is a love letter to the fashion scene in Japan and I hope to continue to keep on finding all the gems that this country has to offer.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">What We Cover</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>Archive and designer clothing stores</li>
          <li>Vintage and secondhand shops</li>
          <li>Streetwear boutiques</li>
          <li>Independent and concept stores</li>
          <li>Hidden gems</li>
          <li>Food & Coffee</li>
          <li>Museums</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Get Involved</h2>
        <p className="text-gray-700 mb-4">
          Know a great store that's not on our map? We'd love to hear about it! Use our
          suggestion form to share your favorite spots. Every submission helps make this
          resource better for the entire community. If you would like to help contribute to the website,
          please email me for more info. If you would also like to donate to the cause my Venmo is <strong>@alex-coluna</strong>.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Questions or Feedback?</h3>
          <p className="text-blue-800 mb-4">
            I'm always looking to improve this platform. Reach out with your ideas, suggestions, 
            or just to say hi!
          </p>
          <a
            href="mailto:alex91748@yahoo.com"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Email: alex91748@yahoo.com
          </a>
        </div>
      </div>
    </div>
  );
}


