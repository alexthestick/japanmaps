import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface SearchAreaButtonProps {
  onClick: () => void;
}

export function SearchAreaButton({ onClick }: SearchAreaButtonProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = () => {
    setIsPulsing(true);
    // Brief pulse animation before executing onClick
    setTimeout(() => {
      onClick();
    }, 150);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        absolute left-1/2 -translate-x-1/2 z-25
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        px-3.5 py-2
        rounded-full
        shadow-lg
        border border-gray-200 dark:border-gray-700
        flex items-center gap-2
        font-medium text-[13px]
        animate-in fade-in slide-in-from-bottom-2 duration-200
        transition-all
        hover:shadow-xl
        ${isPulsing ? 'scale-110 shadow-[0_0_30px_rgba(34,217,238,0.6)]' : 'active:scale-95'}
      `}
      style={{
        touchAction: 'manipulation',
        width: '130px',
        // Mobile-only: absolute positioning at 80px from map container bottom + safe area
        bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom, 0px)))',
        transition: isPulsing ? 'all 0.15s ease-out' : 'all 0.2s ease-in-out',
      }}
    >
      <RefreshCw className={`w-4 h-4 ${isPulsing ? 'animate-spin' : ''}`} />
      <span>Search area</span>
    </button>
  );
}
