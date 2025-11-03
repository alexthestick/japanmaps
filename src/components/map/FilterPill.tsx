import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface FilterPillProps {
  label: string | ReactNode;
  active?: boolean;
  hasDropdown?: boolean;
  onClick: () => void;
}

/**
 * Filter pill button for mobile filter bar
 * Used for subcategories, location selection, etc.
 */
export function FilterPill({ label, active = false, hasDropdown = false, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-4 py-2 rounded-full
        text-sm font-semibold whitespace-nowrap flex-shrink-0
        transition-all duration-200
        ${active
          ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400/50'
          : 'bg-gray-800/60 text-gray-300 border border-gray-600/40'
        }
      `}
      style={{
        boxShadow: active
          ? '0 0 15px rgba(34, 217, 238, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      {typeof label === 'string' ? <span>{label}</span> : label}
      {hasDropdown && (
        <ChevronDown
          className={`w-3.5 h-3.5 ${active ? 'text-cyan-300' : 'text-gray-400'}`}
        />
      )}
    </button>
  );
}
