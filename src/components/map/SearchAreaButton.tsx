import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

interface SearchAreaButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export function SearchAreaButton({ onClick, isActive = false }: SearchAreaButtonProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = () => {
    if (!isActive) {
      setIsPulsing(true);
      setTimeout(() => {
        setIsPulsing(false);
        onClick();
      }, 150);
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        absolute left-1/2 -translate-x-1/2 z-25
        px-3.5 py-2
        rounded-full
        shadow-lg
        flex items-center gap-2
        font-medium text-[13px]
        animate-in fade-in slide-in-from-bottom-2 duration-200
        transition-all
        hover:shadow-xl
        ${isPulsing ? 'scale-110' : 'active:scale-95'}
      `}
      style={{
        touchAction: 'manipulation',
        width: isActive ? '110px' : '130px',
        bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom, 0px)))',
        transition: isPulsing ? 'all 0.15s ease-out' : 'all 0.2s ease-in-out',
        // Active state: cyan glow; inactive: standard pill
        backgroundColor: isActive ? 'rgba(34, 217, 238, 0.15)' : 'rgba(255, 255, 255, 0.95)',
        border: isActive ? '1px solid rgba(34, 217, 238, 0.5)' : '1px solid rgba(200,200,200,0.4)',
        color: isActive ? '#22d9ee' : 'rgb(17, 24, 39)',
        boxShadow: isActive
          ? `0 0 20px rgba(34, 217, 238, 0.3), 0 4px 12px rgba(0,0,0,0.3), ${isPulsing ? '0 0 30px rgba(34,217,238,0.6)' : ''}`
          : '0 4px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {isActive ? (
        <>
          <X className="w-4 h-4" />
          <span>Clear</span>
        </>
      ) : (
        <>
          <RefreshCw className={`w-4 h-4 ${isPulsing ? 'animate-spin' : ''}`} />
          <span>Search area</span>
        </>
      )}
    </button>
  );
}
