import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleSaveStore, isStoreSaved } from '../../utils/savedStores';

interface SaveButtonProps {
  storeId: string;
  className?: string;
  showLabel?: boolean;
  variant?: 'icon' | 'button';
}

export function SaveButton({ storeId, className = '', showLabel = false, variant = 'icon' }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isStoreSaved(storeId));

    // Listen for changes
    const handleChange = () => {
      setIsSaved(isStoreSaved(storeId));
    };

    window.addEventListener('savedStoresChanged', handleChange);
    return () => window.removeEventListener('savedStoresChanged', handleChange);
  }, [storeId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSaveStore(storeId);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
          isSaved
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        } ${className}`}
      >
        <Heart className={`w-5 h-5 transition-all ${isSaved ? 'fill-current' : ''}`} />
        {isSaved ? 'Saved' : 'Save Store'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`group relative p-2 rounded-full transition-all ${
        isSaved
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
      } ${className}`}
      title={isSaved ? 'Unsave store' : 'Save store'}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isSaved ? 'fill-current scale-110' : 'group-hover:scale-110'
        }`}
      />
      {showLabel && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {isSaved ? 'Unsave' : 'Save'}
        </span>
      )}
    </button>
  );
}
