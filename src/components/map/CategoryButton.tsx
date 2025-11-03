import { type MainCategory } from '../../types/store';

interface CategoryButtonProps {
  icon: string;
  label: MainCategory | 'All';
  active: boolean;
  onClick: () => void;
}

/**
 * Category button for mobile filter bar
 * Displays icon + label with Kirby-style neon glow when active
 */
export function CategoryButton({ icon, label, active, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 px-4 py-2 rounded-xl
        transition-all duration-200 flex-shrink-0
        ${active
          ? 'bg-cyan-500/20 border-2 border-cyan-400'
          : 'bg-gray-800/50 border border-gray-600/30'
        }
      `}
      style={{
        boxShadow: active
          ? '0 0 20px rgba(34, 217, 238, 0.4), inset 0 0 10px rgba(34, 217, 238, 0.1)'
          : 'none',
        minWidth: '80px',
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`text-xs font-bold uppercase tracking-wide ${
          active ? 'text-cyan-300' : 'text-gray-400'
        }`}
        style={{
          textShadow: active ? '0 0 8px rgba(34, 217, 238, 0.5)' : 'none'
        }}
      >
        {label}
      </span>
    </button>
  );
}
