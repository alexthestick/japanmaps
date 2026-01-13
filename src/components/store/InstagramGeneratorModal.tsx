import { useState, useRef } from 'react';
import { X, Download, Check } from 'lucide-react';
import { Button } from '../common/Button';
import { InstagramCard } from './InstagramCard';
import type { Store } from '../../types/store';
import html2canvas from 'html2canvas';

interface InstagramGeneratorModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
}

export function InstagramGeneratorModal({ store, isOpen, onClose }: InstagramGeneratorModalProps) {
  const photos = store.photos && store.photos.length > 0
    ? store.photos
    : ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop'];

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [format, setFormat] = useState<'story' | 'post'>('post');
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);

    try {
      // Wait a bit for images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher quality
        useCORS: true, // Handle cross-origin images
        allowTaint: true,
        backgroundColor: '#0f172a',
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${store.name.replace(/[^a-zA-Z0-9]/g, '_')}_${format}.png`;
        link.click();
        URL.revokeObjectURL(url);

        setIsGenerating(false);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Generate Instagram Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Photo</h3>
            <div className="grid grid-cols-4 gap-3">
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-all ${
                    selectedPhotoIndex === idx
                      ? 'border-cyan-500 ring-2 ring-cyan-300'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedPhotoIndex === idx && (
                    <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                      <div className="bg-cyan-500 rounded-full p-2">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Format</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('post')}
                className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                  format === 'post'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Post (1:1)
              </button>
              <button
                onClick={() => setFormat('story')}
                className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                  format === 'story'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Story (9:16)
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview</h3>
            <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
              <div
                className="bg-white rounded-lg shadow-xl overflow-hidden"
                style={{
                  width: format === 'story' ? '270px' : '400px',
                  height: format === 'story' ? '480px' : '400px',
                }}
              >
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={photos[selectedPhotoIndex]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                  {/* Corner decorations */}
                  <div className="absolute inset-0 pointer-events-none p-2">
                    <svg className="absolute top-2 left-2 w-6 h-6 text-cyan-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M 8 32 L 8 8 L 32 8" />
                    </svg>
                    <svg className="absolute top-2 right-2 w-6 h-6 text-cyan-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M 32 8 L 56 8 L 56 32" />
                    </svg>
                    <svg className="absolute bottom-2 left-2 w-6 h-6 text-cyan-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M 8 32 L 8 56 L 32 56" />
                    </svg>
                    <svg className="absolute bottom-2 right-2 w-6 h-6 text-cyan-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M 56 32 L 56 56 L 32 56" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/30">
                      <h3 className="text-lg font-bold text-white mb-1">'{store.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <p className="text-xs text-gray-300 uppercase tracking-wide">
                          {store.city} {store.neighborhood && `• ${store.neighborhood}`}
                        </p>
                      </div>
                      {store.categories && store.categories.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {store.categories.slice(0, 2).map((cat, idx) => (
                            <div key={idx} className="px-2 py-1 bg-cyan-500/20 border border-cyan-400 rounded-full">
                              <span className="text-[10px] font-semibold text-cyan-300">{cat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-cyan-400 font-medium border-t border-cyan-400/20 pt-2">
                        lostintransitjp.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={isGenerating}
            >
              <Download className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Image'}
            </Button>
            <Button onClick={onClose} variant="outline" className="px-6">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden full-size card for rendering */}
      <div className="fixed -left-[10000px] -top-[10000px]">
        <div ref={cardRef}>
          <InstagramCard
            store={store}
            photoUrl={photos[selectedPhotoIndex]}
            format={format}
          />
        </div>
      </div>
    </div>
  );
}
