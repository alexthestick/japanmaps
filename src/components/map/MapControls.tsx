import { RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

interface MapControlsProps {
  onReset: () => void;
}

export function MapControls({ onReset }: MapControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10">
      <Button
        variant="secondary"
        size="sm"
        onClick={onReset}
        className="shadow-lg flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset View
      </Button>
    </div>
  );
}


