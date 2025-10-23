import { Sun, Moon } from 'lucide-react';

interface MapStyleToggleProps {
  mode: 'day' | 'night';
  onChange: (mode: 'day' | 'night') => void;
  placement?: 'overlay' | 'inline';
  compact?: boolean;
}

export function MapStyleToggle({ mode, onChange, placement = 'overlay', compact = true }: MapStyleToggleProps) {
  const wrapperBase = 'pointer-events-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md overflow-hidden inline-flex';
  const overlayPos = 'absolute right-3 md:right-4 bottom-4 md:bottom-auto md:top-24 z-10';
  const inlinePos = '';
  const wrapperClass = placement === 'overlay' ? `${wrapperBase} ${overlayPos}` : `${wrapperBase} ${inlinePos}`;

  const padX = compact ? 'px-2.5' : 'px-3';
  const padY = compact ? 'py-1.5' : 'py-2';
  const textCls = compact ? 'text-xs' : 'text-sm';
  const iconSize = compact ? 'w-4 h-4' : 'w-4 h-4';
  const showLabels = !compact;

  return (
    <div className={wrapperClass}>
      <button
        onClick={() => onChange('day')}
        className={`${padX} ${padY} inline-flex items-center gap-1 ${textCls} ${mode === 'day' ? 'text-blue-600 bg-white' : 'text-gray-600 hover:bg-gray-50'}`}
        aria-label="Day style"
        title="Day"
      >
        <Sun className={iconSize} />
        {showLabels && 'Day'}
      </button>
      <button
        onClick={() => onChange('night')}
        className={`${padX} ${padY} inline-flex items-center gap-1 ${textCls} ${mode === 'night' ? 'text-blue-600 bg-white' : 'text-gray-600 hover:bg-gray-50'}`}
        aria-label="Night style"
        title="Night"
      >
        <Moon className={iconSize} />
        {showLabels && 'Night'}
      </button>
    </div>
  );
}


