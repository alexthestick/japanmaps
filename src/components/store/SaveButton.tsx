import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toggleSaveStore, isStoreSaved } from '../../utils/savedStores';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface SaveButtonProps {
  storeId: string;
  className?: string;
  showLabel?: boolean;
  variant?: 'icon' | 'button';
}

export function SaveButton({ storeId, className = '', showLabel = false, variant = 'icon' }: SaveButtonProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load initial state
  useEffect(() => {
    if (user) {
      // Load from Supabase for logged-in users
      supabase
        .from('saved_stores')
        .select('store_id')
        .eq('user_id', user.id)
        .eq('store_id', storeId)
        .maybeSingle()
        .then(({ data }) => setIsSaved(!!data));
    } else {
      // Fall back to localStorage for guests
      setIsSaved(isStoreSaved(storeId));

      const handleChange = () => setIsSaved(isStoreSaved(storeId));
      window.addEventListener('savedStoresChanged', handleChange);
      return () => window.removeEventListener('savedStoresChanged', handleChange);
    }
  }, [storeId, user]);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      // Prompt login for guests
      navigate('/login');
      return;
    }

    if (loading) return;
    setLoading(true);

    if (isSaved) {
      // Unsave
      const { error } = await supabase
        .from('saved_stores')
        .delete()
        .eq('user_id', user.id)
        .eq('store_id', storeId);

      if (!error) {
        setIsSaved(false);
        // Keep localStorage in sync too
        toggleSaveStore(storeId);
      }
    } else {
      // Save
      const { error } = await supabase
        .from('saved_stores')
        .insert({ user_id: user.id, store_id: storeId });

      if (!error) {
        setIsSaved(true);
        // Keep localStorage in sync too
        if (!isStoreSaved(storeId)) toggleSaveStore(storeId);
      }
    }

    setLoading(false);
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all disabled:opacity-60 ${
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
      disabled={loading}
      className={`group relative p-2 rounded-full transition-all disabled:opacity-60 ${
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
