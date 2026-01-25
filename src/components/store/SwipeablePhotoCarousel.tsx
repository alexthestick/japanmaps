import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface SwipeablePhotoCarouselProps {
  photos: string[];
  storeName: string;
  onPhotoClick: (index: number) => void;
}

export function SwipeablePhotoCarousel({ photos, storeName, onPhotoClick }: SwipeablePhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < photos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] bg-black overflow-hidden group">
      {/* Photo Container */}
      <div
        ref={carouselRef}
        className="relative w-full h-full flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            className="min-w-full h-full flex-shrink-0 relative"
            onClick={() => onPhotoClick(index)}
          >
            <img
              src={photo}
              alt={`${storeName} - Photo ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              style={{ objectPosition: 'center' }}
            />

            {/* Expand icon overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm p-3 rounded-full">
                <Maximize2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Desktop only */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-all z-10 border border-cyan-400/30 hover:border-cyan-400/60"
            style={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)' }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-all z-10 border border-cyan-400/30 hover:border-cyan-400/60"
            style={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)' }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'bg-cyan-400 w-8 h-2'
                  : 'bg-white/60 w-2 h-2 hover:bg-white/80'
              }`}
              style={
                index === currentIndex
                  ? { boxShadow: '0 0 15px rgba(34, 217, 238, 0.8)' }
                  : {}
              }
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Photo counter */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold border border-cyan-400/30 z-10">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
}
