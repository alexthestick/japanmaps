import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { toPng } from 'html-to-image';
import { Button } from '../common/Button';
import { supabase } from '../../lib/supabase';
import type { Store } from '../../types/store';

type FormatType = 'portrait' | 'story';

export function SocialPostCreator() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [loadingStores, setLoadingStores] = useState(false);

  // Format selection
  const [format, setFormat] = useState<FormatType>('portrait');
  const canvasWidth = 1080;
  const canvasHeight = format === 'portrait' ? 1350 : 1920;

  const [storeImage, setStoreImage] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [showCorners, setShowCorners] = useState(true);
  const [showTrainIcon, setShowTrainIcon] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showCategoryIcon, setShowCategoryIcon] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Fashion');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageUrlLoading, setImageUrlLoading] = useState(false);
  const [imageUrlError, setImageUrlError] = useState<string>('');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Draggable positions - adjusted based on format
  const [storeNamePos, setStoreNamePos] = useState({ x: 50, y: format === 'portrait' ? 1150 : 1600 });
  const [locationPos, setLocationPos] = useState({ x: 50, y: format === 'portrait' ? 1220 : 1700 });
  const [logoPos, setLogoPos] = useState({ x: 50, y: 50 });
  const [iconPos, setIconPos] = useState({ x: 950, y: 50 });
  const [categoryIconPos, setCategoryIconPos] = useState({ x: 50, y: format === 'portrait' ? 1270 : 1750 });

  // Text styles
  const [storeNameSize, setStoreNameSize] = useState(60);
  const [locationSize, setLocationSize] = useState(32);
  const [storeNameColor, setStoreNameColor] = useState('#FFFFFF');
  const [locationColor, setLocationColor] = useState('#00D9FF');

  // Logo styles
  const [logoSize, setLogoSize] = useState(36);
  const [logoColor, setLogoColor] = useState('#00D9FF');
  const [iconColor, setIconColor] = useState('#00D9FF');

  // Category icon styles
  const [categoryIconSize, setCategoryIconSize] = useState(60);
  const [categoryIconColor, setCategoryIconColor] = useState('#00D9FF');

  // Corner bracket size
  const [cornerSize, setCornerSize] = useState(24);

  // Custom caption
  const [showCaption, setShowCaption] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [captionPos, setCaptionPos] = useState({ x: 50, y: format === 'portrait' ? 600 : 900 });
  const [captionSize, setCaptionSize] = useState(48);
  const [captionColor, setCaptionColor] = useState('#FFFFFF');

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, []);

  // Update fields when store is selected
  useEffect(() => {
    if (selectedStore) {
      setStoreName(selectedStore.name);
      setLocation(`${selectedStore.city}${selectedStore.neighborhood ? ' • ' + selectedStore.neighborhood : ''}`);

      // Set first photo if available
      if (selectedStore.photos && selectedStore.photos.length > 0) {
        setSelectedPhotoIndex(0);
        setStoreImage(selectedStore.photos[0]);
      }
    }
  }, [selectedStore]);

  // Update image when photo index changes
  useEffect(() => {
    if (selectedStore && selectedStore.photos && selectedStore.photos[selectedPhotoIndex]) {
      setStoreImage(selectedStore.photos[selectedPhotoIndex]);
    }
  }, [selectedPhotoIndex, selectedStore]);

  // Adjust positions when format changes
  useEffect(() => {
    if (format === 'story') {
      setStoreNamePos({ x: 50, y: 1600 });
      setLocationPos({ x: 50, y: 1700 });
      setCaptionPos({ x: 50, y: 900 });
    } else {
      // portrait 4:5
      setStoreNamePos({ x: 50, y: 1150 });
      setLocationPos({ x: 50, y: 1220 });
      setCaptionPos({ x: 50, y: 600 });
    }
  }, [format]);

  async function fetchStores() {
    try {
      setLoadingStores(true);
      const { data, error } = await supabase.rpc('get_stores_with_coordinates');

      if (error) throw error;

      const transformedStores: Store[] = (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        city: s.city,
        neighborhood: s.neighborhood || undefined,
        country: s.country,
        latitude: s.latitude,
        longitude: s.longitude,
        mainCategory: s.main_category || 'Fashion',
        categories: s.categories,
        priceRange: s.price_range || undefined,
        description: s.description || undefined,
        photos: s.photos || [],
        website: s.website || undefined,
        instagram: s.instagram || undefined,
        hours: s.hours || undefined,
        verified: s.verified,
        submittedBy: s.submitted_by || undefined,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        haulCount: s.haul_count || 0,
        saveCount: s.save_count || 0,
        google_place_id: s.google_place_id || undefined,
      }));

      // Sort alphabetically
      transformedStores.sort((a, b) => a.name.localeCompare(b.name));
      setStores(transformedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoadingStores(false);
    }
  }

  async function handleExport() {
    if (!canvasRef.current) return;

    try {
      // Temporarily remove the transform for export
      const originalTransform = canvasRef.current.style.transform;
      canvasRef.current.style.transform = 'none';

      const dataUrl = await toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: canvasWidth,
        height: canvasHeight,
        skipFonts: true,
      });

      // Restore the transform
      canvasRef.current.style.transform = originalTransform;

      // Download the image
      const link = document.createElement('a');
      const formatSuffix = format === 'story' ? 'story' : 'post';
      link.download = `${storeName.toLowerCase().replace(/\s+/g, '-')}-${formatSuffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');

      // Make sure to restore transform even if export fails
      if (canvasRef.current) {
        canvasRef.current.style.transform = `scale(${scaleRatio})`;
      }
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

  async function fetchImageAsBase64(url: string): Promise<string> {
    // Try multiple CORS proxies in sequence
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://proxy.cors.sh/${url}`,
    ];

    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) continue;
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) continue;
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch {
        continue;
      }
    }
    throw new Error('All proxies failed');
  }

  async function handleImageUrlLoad(url: string) {
    setImageUrl(url);
    setImageUrlError('');
    if (!url) {
      setStoreImage('');
      return;
    }
    setImageUrlLoading(true);
    try {
      const base64 = await fetchImageAsBase64(url);
      setStoreImage(base64);
      setImageUrlLoading(false);
    } catch {
      setImageUrlLoading(false);
      setStoreImage('');
      setImageUrlError('This site blocks external access. Please download the image and upload it directly using the file picker above.');
    }
  }

  const scaleRatio = format === 'portrait' ? 0.4 : 0.28;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Social Media Post Creator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Controls */}
        <div className="space-y-5">
          {/* Format Selector */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-5 rounded-lg border-2 border-cyan-200">
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">📐</span> Post Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('portrait')}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  format === 'portrait'
                    ? 'border-cyan-500 bg-cyan-500 text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                }`}
              >
                <div className="text-2xl mb-1">🖼️</div>
                <div className="text-sm">Portrait</div>
                <div className="text-xs opacity-75">1080×1350 (4:5)</div>
              </button>
              <button
                onClick={() => setFormat('story')}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  format === 'story'
                    ? 'border-cyan-500 bg-cyan-500 text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                }`}
              >
                <div className="text-2xl mb-1">📱</div>
                <div className="text-sm">Story</div>
                <div className="text-xs opacity-75">1080×1920 (9:16)</div>
              </button>
            </div>
          </div>

          {/* Store Selector */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-lg">🏪</span> Select Store
            </label>
            <select
              value={selectedStore?.id || ''}
              onChange={(e) => {
                const store = stores.find(s => s.id === e.target.value);
                setSelectedStore(store || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={loadingStores}
            >
              <option value="">
                {loadingStores ? 'Loading stores...' : 'Choose a store...'}
              </option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} - {store.city}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Selector */}
          {selectedStore && selectedStore.photos && selectedStore.photos.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-lg">📸</span> Store Photos ({selectedStore.photos.length})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {selectedStore.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedPhotoIndex === index
                        ? 'border-cyan-500 ring-2 ring-cyan-500 shadow-md'
                        : 'border-gray-300 hover:border-cyan-300'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${selectedStore.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Image Upload */}
          <details className="border border-gray-200 rounded-lg bg-white">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800 p-4 hover:bg-gray-50 rounded-lg">
              <span className="text-lg">⬆️</span> Or upload custom image
            </summary>
            <div className="px-4 pb-4 space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <p className="text-xs text-gray-500">Or paste image URL (Google Photos, etc.):</p>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleImageUrlLoad(e.target.value)}
                placeholder="https://lh3.googleusercontent.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              {imageUrlLoading && (
                <p className="text-xs text-cyan-600">Loading image...</p>
              )}
              {imageUrlError && (
                <p className="text-xs text-amber-600">{imageUrlError}</p>
              )}
            </div>
          </details>

          {/* Text Content */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-lg">✏️</span> Text Content
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="BOUT"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Tokyo • Asakusabashi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Design Elements */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-lg">🎨</span> Design Elements
            </h3>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="logo"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="logo" className="text-sm text-gray-700">
                Show LOST IN TRANSIT logo
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="categoryIcon"
                checked={showCategoryIcon}
                onChange={(e) => setShowCategoryIcon(e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="categoryIcon" className="text-sm text-gray-700">
                Show category icon
              </label>
            </div>
            {showCategoryIcon && (
              <div className="ml-6">
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Fashion">Fashion</option>
                  <option value="Food">Food</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Home Goods">Home Goods</option>
                  <option value="Museum">Museum</option>
                  <option value="Spots">Spots</option>
                </select>
              </div>
            )}
          </div>

          {/* Custom Caption */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-lg">💬</span> Custom Caption
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showCaption"
                checked={showCaption}
                onChange={(e) => setShowCaption(e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="showCaption" className="text-sm text-gray-700">
                Add custom caption overlay
              </label>
            </div>
            {showCaption && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Caption Text</label>
                  <textarea
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="Enter your caption..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Font Size: {captionSize}px</label>
                  <input
                    type="range"
                    min="24"
                    max="120"
                    value={captionSize}
                    onChange={(e) => setCaptionSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={captionColor}
                      onChange={(e) => setCaptionColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => setCaptionColor('#FFFFFF')}
                      className={`px-3 py-1 text-xs rounded border ${captionColor === '#FFFFFF' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300'}`}
                    >
                      White
                    </button>
                    <button
                      onClick={() => setCaptionColor('#00D9FF')}
                      className={`px-3 py-1 text-xs rounded border ${captionColor === '#00D9FF' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300'}`}
                    >
                      Cyan
                    </button>
                    <button
                      onClick={() => setCaptionColor('#000000')}
                      className={`px-3 py-1 text-xs rounded border ${captionColor === '#000000' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300'}`}
                    >
                      Black
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">
                  💡 Drag the caption on the canvas to position it
                </p>
              </div>
            )}
          </div>

          {/* Styling Controls */}
          <details className="border border-gray-200 rounded-lg bg-white" open>
            <summary className="cursor-pointer text-sm font-semibold text-gray-800 p-4 hover:bg-gray-50 rounded-lg">
              <span className="text-lg">🎨</span> Text & Logo Styling
            </summary>
            <div className="px-4 pb-4 space-y-4">
              {/* Logo Controls */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">LOST IN TRANSIT Logo</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Size</label>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{logoSize}px</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={logoColor}
                      onChange={(e) => setLogoColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* L-Train-T Icon Color */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">L-Train-T Icon</p>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Color</label>
                  <input
                    type="color"
                    value={iconColor}
                    onChange={(e) => setIconColor(e.target.value)}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Category Icon */}
              {showCategoryIcon && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Category Icon</p>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Size</label>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={categoryIconSize}
                        onChange={(e) => setCategoryIconSize(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{categoryIconSize}px</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={categoryIconColor}
                        onChange={(e) => setCategoryIconColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Corner Brackets */}
              {showCorners && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Corner Brackets</p>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Size</label>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      value={cornerSize}
                      onChange={(e) => setCornerSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{cornerSize}px</span>
                  </div>
                </div>
              )}

              {/* Store Name */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Store Name</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Size</label>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      value={storeNameSize}
                      onChange={(e) => setStoreNameSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{storeNameSize}px</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={storeNameColor}
                      onChange={(e) => setStoreNameColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Location</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Size</label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={locationSize}
                      onChange={(e) => setLocationSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{locationSize}px</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={locationColor}
                      onChange={(e) => setLocationColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={!storeImage || !storeName}
            className="w-full py-4 text-lg font-semibold"
          >
            📥 Export as Image ({canvasWidth}×{canvasHeight})
          </Button>

          <p className="text-xs text-gray-500 text-center italic">
            💡 Drag text elements on the canvas to position them
          </p>
        </div>

        {/* Right Panel - Canvas Preview */}
        <div className="sticky top-6 self-start">
          <div
            className="bg-gray-100 rounded-lg overflow-visible shadow-xl border-4 border-gray-200 mx-auto"
            style={{
              width: format === 'portrait' ? '432px' : '303px',
              height: format === 'portrait' ? '540px' : '540px',
              position: 'relative',
            }}
          >
            <div
              ref={canvasRef}
              className="relative"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${scaleRatio})`,
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

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/20" style={{ pointerEvents: 'none' }} />

              {/* Corner Brackets */}
              {showCorners && (
                <>
                  <div
                    className="absolute top-6 left-6 border-l-4 border-t-4 border-cyan-400"
                    style={{
                      width: `${cornerSize * 4}px`,
                      height: `${cornerSize * 4}px`,
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    className="absolute top-6 right-6 border-r-4 border-t-4 border-cyan-400"
                    style={{
                      width: `${cornerSize * 4}px`,
                      height: `${cornerSize * 4}px`,
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    className="absolute bottom-6 left-6 border-l-4 border-b-4 border-cyan-400"
                    style={{
                      width: `${cornerSize * 4}px`,
                      height: `${cornerSize * 4}px`,
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    className="absolute bottom-6 right-6 border-r-4 border-b-4 border-cyan-400"
                    style={{
                      width: `${cornerSize * 4}px`,
                      height: `${cornerSize * 4}px`,
                      pointerEvents: 'none',
                    }}
                  />
                </>
              )}

              {/* L-Train-T Icon - Draggable */}
              {showTrainIcon && (
                <Draggable
                  position={iconPos}
                  onStop={(e, data) => setIconPos({ x: data.x, y: data.y })}
                  bounds="parent"
                >
                  <div className="absolute cursor-move">
                    <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* L */}
                      <text x="0" y="40" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="48" fontWeight="900" fill={iconColor}>L</text>

                      {/* Train Icon - Scaled to match letter height */}
                      <g transform="translate(38, 5)">
                        <rect x="0" y="8" width="24" height="22" rx="2" fill={iconColor} />
                        <rect x="3" y="11" width="8" height="8" fill="#1a1a1a" />
                        <rect x="13" y="11" width="8" height="8" fill="#1a1a1a" />
                        <circle cx="6" cy="32" r="2.5" fill={iconColor} />
                        <circle cx="18" cy="32" r="2.5" fill={iconColor} />
                        <rect x="8" y="2" width="8" height="6" fill={iconColor} />
                      </g>

                      {/* T */}
                      <text x="72" y="40" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="48" fontWeight="900" fill={iconColor}>T</text>
                    </svg>
                  </div>
                </Draggable>
              )}

              {/* Draggable Logo */}
              {showLogo && (
                <Draggable
                  position={logoPos}
                  onStop={(e, data) => setLogoPos({ x: data.x, y: data.y })}
                  bounds="parent"
                >
                  <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                    <div
                      className="font-black tracking-wider"
                      style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: `${logoSize}px`,
                        color: logoColor,
                        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                      }}
                    >
                      LOST IN TRANSIT
                    </div>
                  </div>
                </Draggable>
              )}

              {/* Draggable Store Name */}
              {storeName && (
                <Draggable
                  position={storeNamePos}
                  onStop={(e, data) => setStoreNamePos({ x: data.x, y: data.y })}
                  bounds="parent"
                >
                  <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                    <div
                      className="font-black tracking-tight"
                      style={{
                        fontSize: `${storeNameSize}px`,
                        color: storeNameColor,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                      }}
                    >
                      {storeName}
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
                  <div className="absolute cursor-move" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                    <div
                      className="font-semibold"
                      style={{
                        fontSize: `${locationSize}px`,
                        color: locationColor,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                      }}
                    >
                      {location}
                    </div>
                  </div>
                </Draggable>
              )}

              {/* Draggable Category Icon */}
              {showCategoryIcon && (
                <Draggable
                  position={categoryIconPos}
                  onStop={(e, data) => setCategoryIconPos({ x: data.x, y: data.y })}
                  bounds="parent"
                >
                  <div className="absolute cursor-move">
                    <svg
                      width={categoryIconSize}
                      height={categoryIconSize}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={categoryIconColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {selectedCategory === 'Fashion' && (
                        <>
                          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                        </>
                      )}
                      {selectedCategory === 'Food' && (
                        <>
                          <path d="m16 2-2.3 12.3a2 2 0 0 1-2 1.7H8.3a2 2 0 0 1-2-1.7L4 2" />
                          <path d="M7 22h10" />
                          <path d="M12 16v6" />
                        </>
                      )}
                      {selectedCategory === 'Coffee' && (
                        <>
                          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                          <line x1="6" x2="6" y1="2" y2="4" />
                          <line x1="10" x2="10" y1="2" y2="4" />
                          <line x1="14" x2="14" y1="2" y2="4" />
                        </>
                      )}
                      {selectedCategory === 'Home Goods' && (
                        <>
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </>
                      )}
                      {selectedCategory === 'Museum' && (
                        <>
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M7 7h10" />
                          <path d="M7 12h10" />
                          <path d="M7 17h10" />
                        </>
                      )}
                      {selectedCategory === 'Spots' && (
                        <>
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </>
                      )}
                    </svg>
                  </div>
                </Draggable>
              )}

              {/* Draggable Custom Caption */}
              {showCaption && captionText && (
                <Draggable
                  position={captionPos}
                  onStop={(e, data) => setCaptionPos({ x: data.x, y: data.y })}
                  bounds="parent"
                >
                  <div className="absolute cursor-move" style={{ display: 'inline-block' }}>
                    <div
                      className="font-bold"
                      style={{
                        fontSize: `${captionSize}px`,
                        color: captionColor,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        textShadow: '3px 3px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)',
                        lineHeight: 1.2,
                        whiteSpace: 'pre-wrap',
                        display: 'inline-block',
                      }}
                    >
                      {captionText}
                    </div>
                  </div>
                </Draggable>
              )}

              {/* Placeholder */}
              {!storeImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="text-6xl mb-4">📸</p>
                    <p className="text-3xl font-semibold">Select a store to begin</p>
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
