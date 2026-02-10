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
  const [format, setFormat] = useState<'story' | 'portrait'>('portrait');
  const [template, setTemplate] = useState<'topBar' | 'minimal'>('minimal');
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
        link.download = `${store.name.replace(/[^a-zA-Z0-9]/g, '_')}_${format === 'portrait' ? '4x5' : 'story'}.png`;
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

          {/* Template Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Style</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setTemplate('minimal')}
                className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                  template === 'minimal'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Minimal
              </button>
              <button
                onClick={() => setTemplate('topBar')}
                className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                  template === 'topBar'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Top Bar
              </button>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Format</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('portrait')}
                className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                  format === 'portrait'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Portrait (4:5)
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
                  height: format === 'story' ? '480px' : '500px',
                }}
              >
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={photos[selectedPhotoIndex]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {template === 'topBar' ? (
                    // Top Bar Template Preview
                    <>
                      <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-gradient-to-b from-black/40 to-transparent">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-cyan-400" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                            LOST IN TRANSIT
                          </span>
                          <svg className="w-3 h-3 text-cyan-400/60" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4">
                            <path d="M 32 8 L 56 8 L 56 32" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-2xl font-black text-white mb-1 uppercase" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                          {store.name}
                        </h3>
                        <p className="text-xs text-cyan-400 font-bold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                          {store.neighborhood ? `${store.neighborhood}, ` : ''}{store.city}
                        </p>
                      </div>
                    </>
                  ) : (
                    // Minimal Template Preview
                    <>
                      <div className="absolute top-2 right-2">
                        <span className="text-[8px] font-black text-white/80" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                          L✈T
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-2xl font-black text-white mb-1 uppercase" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                          {store.name}
                        </h3>
                        <p className="text-xs text-white/90 font-bold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                          {store.city}{store.neighborhood ? ` • ${store.neighborhood}` : ''}
                        </p>
                      </div>
                    </>
                  )}
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
            template={template}
          />
        </div>
      </div>
    </div>
  );
}
