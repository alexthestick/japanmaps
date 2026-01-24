import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { toPng } from 'html-to-image';
import { Button } from '../common/Button';

interface DraggableElement {
  id: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export function SocialPostCreator() {
  const [storeImage, setStoreImage] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [showCorners, setShowCorners] = useState(true);
  const [showTrainIcon, setShowTrainIcon] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Draggable positions
  const [storeNamePos, setStoreNamePos] = useState({ x: 50, y: 850 });
  const [locationPos, setLocationPos] = useState({ x: 50, y: 900 });
  const [logoPos, setLogoPos] = useState({ x: 50, y: 50 });

  // Text styles
  const [storeNameSize, setStoreNameSize] = useState(60);
  const [locationSize, setLocationSize] = useState(32);
  const [storeNameColor, setStoreNameColor] = useState('#FFFFFF');
  const [locationColor, setLocationColor] = useState('#00D9FF');

  async function handleExport() {
    if (!canvasRef.current) return;

    try {
      const dataUrl = await toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: 1080,
        height: 1080,
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `${storeName.toLowerCase().replace(/\s+/g, '-')}-post.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStoreImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Social Media Post Creator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">Or paste image URL below:</p>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setStoreImage(e.target.value);
              }}
              placeholder="https://example.com/store-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
            />
          </div>

          {/* Store Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="'BOUT"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tokyo • Asakusabashi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Design Toggles */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Design Options</h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="corners"
                checked={showCorners}
                onChange={(e) => setShowCorners(e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="corners" className="text-sm text-gray-700">
                Show corner brackets
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="train"
                checked={showTrainIcon}
                onChange={(e) => setShowTrainIcon(e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="train" className="text-sm text-gray-700">
                Show L-Train-T icon
              </label>
            </div>
          </div>

          {/* Text Styling */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Text Styling</h3>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Store Name Size</label>
              <input
                type="range"
                min="30"
                max="100"
                value={storeNameSize}
                onChange={(e) => setStoreNameSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{storeNameSize}px</span>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Store Name Color</label>
              <input
                type="color"
                value={storeNameColor}
                onChange={(e) => setStoreNameColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Location Size</label>
              <input
                type="range"
                min="20"
                max="60"
                value={locationSize}
                onChange={(e) => setLocationSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{locationSize}px</span>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Location Color</label>
              <input
                type="color"
                value={locationColor}
                onChange={(e) => setLocationColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={!storeImage || !storeName}
            className="w-full"
          >
            Export as Image (1080x1080)
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Drag text elements on the canvas to position them
          </p>
        </div>

        {/* Right Panel - Canvas Preview */}
        <div className="sticky top-6">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-xl border-4 border-gray-200">
            <div
              ref={canvasRef}
              className="relative w-full h-full"
              style={{
                width: '1080px',
                height: '1080px',
                transform: 'scale(0.5)',
                transformOrigin: 'top left',
              }}
            >
              {/* Background Image */}
              {storeImage && (
                <img
                  src={storeImage}
                  alt="Store"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                />
              )}

              {/* Dark Overlay for better text visibility */}
              <div className="absolute inset-0 bg-black/20" style={{ pointerEvents: 'none' }} />

              {/* Corner Brackets */}
              {showCorners && (
                <>
                  {/* Top Left */}
                  <div className="absolute top-6 left-6 w-24 h-24 border-l-4 border-t-4 border-cyan-400" style={{ pointerEvents: 'none' }} />

                  {/* Top Right */}
                  <div className="absolute top-6 right-6 w-24 h-24 border-r-4 border-t-4 border-cyan-400" style={{ pointerEvents: 'none' }} />

                  {/* Bottom Left */}
                  <div className="absolute bottom-6 left-6 w-24 h-24 border-l-4 border-b-4 border-cyan-400" style={{ pointerEvents: 'none' }} />

                  {/* Bottom Right */}
                  <div className="absolute bottom-6 right-6 w-24 h-24 border-r-4 border-b-4 border-cyan-400" style={{ pointerEvents: 'none' }} />
                </>
              )}

              {/* L-Train-T Icon */}
              {showTrainIcon && (
                <div className="absolute top-6 right-6" style={{ pointerEvents: 'none' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* L */}
                    <text x="5" y="35" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="40" fontWeight="900" fill="#00D9FF">L</text>

                    {/* Train Icon */}
                    <g transform="translate(28, 8)">
                      <rect x="4" y="8" width="18" height="16" rx="2" fill="#00D9FF" />
                      <rect x="6" y="10" width="6" height="6" fill="#1a1a1a" />
                      <rect x="14" y="10" width="6" height="6" fill="#1a1a1a" />
                      <circle cx="8" cy="26" r="2" fill="#00D9FF" />
                      <circle cx="18" cy="26" r="2" fill="#00D9FF" />
                      <rect x="10" y="4" width="6" height="4" fill="#00D9FF" />
                    </g>

                    {/* T */}
                    <text x="50" y="35" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="40" fontWeight="900" fill="#00D9FF">T</text>
                  </svg>
                </div>
              )}

              {/* Draggable Logo (Lost in Transit) */}
              <Draggable
                position={logoPos}
                onStop={(e, data) => setLogoPos({ x: data.x, y: data.y })}
                bounds="parent"
              >
                <div className="absolute cursor-move">
                  <div className="text-cyan-400 font-black text-3xl tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    LOST IN TRANSIT
                  </div>
                </div>
              </Draggable>

              {/* Draggable Store Name */}
              {storeName && (
                <Draggable
                  position={storeNamePos}
                  onStop={(e, data) => setStoreNamePos({ x: data.x, y: data.y })}
                  bounds="parent"
                >
                  <div className="absolute cursor-move">
                    <div
                      className="font-black tracking-tight"
                      style={{
                        fontSize: `${storeNameSize}px`,
                        color: storeNameColor,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                      }}
                    >
                      '{storeName}
                    </div>
                  </div>
                </Draggable>
              )}

              {/* Draggable Location */}
              {location && (
                <Draggable
                  position={locationPos}
                  onStop={(e, data) => setLocationPos({ x: data.x, y: data.y })}
                  bounds="parent"
                >
                  <div className="absolute cursor-move">
                    <div
                      className="font-semibold"
                      style={{
                        fontSize: `${locationSize}px`,
                        color: locationColor,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
                      }}
                    >
                      {location}
                    </div>
                  </div>
                </Draggable>
              )}

              {/* Placeholder when no image */}
              {!storeImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="text-4xl mb-4">📸</p>
                    <p className="text-2xl">Upload a store image to begin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
