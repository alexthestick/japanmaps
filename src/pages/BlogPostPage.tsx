import { useParams } from 'react-router-dom';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog Post: {slug}</h1>
      
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-lg">
          Blog post content coming soon!
        </p>
      </div>
    </div>
  );
}


