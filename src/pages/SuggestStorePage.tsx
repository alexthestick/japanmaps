import { useNavigate } from 'react-router-dom';
import { SuggestStoreForm } from '../components/forms/SuggestStoreForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export function SuggestStorePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Map
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggest a Store</h1>
        <p className="text-gray-600">
          Know a great clothing store that should be on the map? Share it with us! 
          We review all suggestions and add the best ones to our curated collection.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <SuggestStoreForm onSuccess={() => navigate('/')} />
      </div>
    </div>
  );
}


