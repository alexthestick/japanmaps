import { RefreshCw } from 'lucide-react';

interface SearchAreaButtonProps {
  onClick: () => void;
}

export function SearchAreaButton({ onClick }: SearchAreaButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-[100px] left-1/2 -translate-x-1/2 z-20
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        px-4 py-2.5
        rounded-full
        shadow-lg
        border border-gray-200 dark:border-gray-700
        flex items-center gap-2
        font-medium text-[13px]
        animate-in fade-in slide-in-from-bottom-2 duration-200
        active:scale-95 transition-all
        hover:shadow-xl
      "
      style={{
        touchAction: 'manipulation',
        width: '140px'
      }}
    >
      <RefreshCw className="w-4 h-4" />
      <span>Search area</span>
    </button>
  );
}
