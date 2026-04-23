import { Sun, Moon } from 'lucide-react';

interface MapStyleToggleProps {
  mode: 'day' | 'night';
  onChange: (mode: 'day' | 'night') => void;
  placement?: 'overlay' | 'inline';
  compact?: boolean;
}

export function MapStyleToggle({ mode, onChange, placement = 'overlay', compact = true }: MapStyleToggleProps) {
  const wrapperBase = 'pointer-events-auto bg-gray-900/95 backdrop-blur-md border-2 border-cyan-400/40 rounded-full shadow-md overflow-hidden inline-flex relative';
  // On mobile, bottom-4 alone would be clipped by the iPhone home indicator.
  // We keep the class for desktop (md:bottom-auto) and use inline style for mobile.
  const overlayPos = 'absolute right-3 md:right-4 md:bottom-auto md:top-24 z-10';
  const inlinePos = '';
  const wrapperClass = placement === 'overlay' ? `${wrapperBase} ${overlayPos}` : `${wrapperBase} ${inlinePos}`;

  const padX = compact ? 'px-2.5' : 'px-3';
  const padY = compact ? 'py-1.5' : 'py-2';
  const textCls = compact ? 'text-xs' : 'text-sm';
  const iconSize = compact ? 'w-4 h-4' : 'w-4 h-4';
  const showLabels = !compact;

  return (
    <div
      className={wrapperClass}
      style={{
        boxShadow: '0 0 20px rgba(34, 217, 238, 0.3)',
        // On mobile (overlay mode), keep the toggle above the iOS home indicator
        ...(placement === 'overlay' && { bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }),
      }}
    >
      {/* Film grain */}
      <div className="absolute inset-0 film-grain opacity-10 pointer-events-none rounded-full" />
      <button
        onClick={() => onChange('day')}
        className={`${padX} ${padY} inline-flex items-center gap-1 ${textCls} relative z-10 transition-all ${mode === 'day' ? 'text-white bg-gradient-to-r from-cyan-500/30 to-blue-500/30' : 'text-gray-300 hover:bg-gray-800'}`}
        aria-label="Day style"
        title="Day"
      >
        <Sun className={iconSize} />
        {showLabels && 'Day'}
      </button>
      <button
        onClick={() => onChange('night')}
        className={`${padX} ${padY} inline-flex items-center gap-1 ${textCls} relative z-10 transition-all ${mode === 'night' ? 'text-white bg-gradient-to-r from-cyan-500/30 to-blue-500/30' : 'text-gray-300 hover:bg-gray-800'}`}
        aria-label="Night style"
        title="Night"
      >
        <Moon className={iconSize} />
        {showLabels && 'Night'}
      </button>
    </div>
  );
}


