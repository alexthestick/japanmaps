import { useState, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface VisitButtonProps {
  storeId: string;
  visitCount?: number;
  className?: string;
  variant?: 'icon' | 'button';
}

export function VisitButton({ storeId, visitCount = 0, className = '', variant = 'button' }: VisitButtonProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [hasVisited, setHasVisited] = useState(false);
  const [count, setCount] = useState(visitCount);
  const [loading, setLoading] = useState(false);

  // Check if user has already visited
  useEffect(() => {
    if (!user) return;
    supabase
      .from('store_visits')
      .select('store_id')
      .eq('user_id', user.id)
      .eq('store_id', storeId)
      .maybeSingle()
      .then(({ data }) => setHasVisited(!!data));
  }, [storeId, user]);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (loading) return;
    setLoading(true);

    if (hasVisited) {
      // Un-check-in
      const { error } = await supabase
        .from('store_visits')
        .delete()
        .eq('user_id', user.id)
        .eq('store_id', storeId);

      if (!error) {
        setHasVisited(false);
        setCount(prev => Math.max(0, prev - 1));
      }
    } else {
      // Check in
      const { error } = await supabase
        .from('store_visits')
        .insert({ user_id: user.id, store_id: storeId });

      if (!error) {
        setHasVisited(true);
        setCount(prev => prev + 1);
      }
    }

    setLoading(false);
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        title={hasVisited ? "You've been here" : "Mark as visited"}
        className={`group flex items-center gap-1.5 text-sm font-medium transition-all disabled:opacity-60 ${
          hasVisited ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
        } ${className}`}
      >
        <MapPin className={`h-4 w-4 transition-all ${hasVisited ? 'fill-current' : 'group-hover:scale-110'}`} />
        {count > 0 && <span className="text-xs">{count}</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-all disabled:opacity-60 ${
        hasVisited
          ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      } ${className}`}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : hasVisited ? (
        <Check className="h-4 w-4" />
      ) : (
        <MapPin className="h-4 w-4" />
      )}
      {hasVisited ? "I've been here" : 'Mark as visited'}
      {count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${hasVisited ? 'bg-green-500/20' : 'bg-gray-200'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
