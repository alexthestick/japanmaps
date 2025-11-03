import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxGuideSectionProps {
  title: string;
  description: string;
  image: string;
  address?: string;
  mapLink?: string;
  reverse?: boolean;
}

export function ParallaxGuideSection({
  title,
  description,
  image,
  address,
  mapLink,
  reverse = false,
}: ParallaxGuideSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax movement for the image (subtle)
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);
  const opacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  // More dramatic rotations
  const imageRotation = reverse ? '2.5deg' : '-2deg';
  const textRotation = reverse ? '-1.5deg' : '1.5deg';

  // Random pin/tape colors
  const pinColors = ['#E63946', '#457B9D', '#F4A261', '#2A9D8F', '#E76F51'];
  const tapeColors = ['#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#DDA0DD'];
  const pinColor = pinColors[Math.floor(Math.random() * pinColors.length)];
  const tapeColor = tapeColors[Math.floor(Math.random() * tapeColors.length)];

  // Colorful note card backgrounds (inspired by reference image)
  const cardColors = [
    '#FFFBEA', // Cream
    '#FFF9C4', // Pale yellow
    '#FCE4EC', // Light pink
    '#E8F5E9', // Mint green
    '#F3E5F5', // Lavender
  ];
  const cardColor = cardColors[Math.floor(Math.random() * cardColors.length)];

  // Randomly choose pin or tape
  const useWashiTape = Math.random() > 0.5;

  // Variable image height for visual rhythm
  const imageHeight = description.length > 500 ? '700px' : '600px';

  return (
    <section
      ref={ref}
      className={`relative flex flex-col ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-start gap-8 md:gap-12 my-20 md:my-32 max-w-6xl mx-auto px-6`}
    >
      {/* Text content - Colorful note card */}
      <motion.div
        className="md:w-1/2 relative mt-6"
        style={{ opacity }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div
          className="shadow-2xl relative"
          style={{
            backgroundColor: cardColor,
            transform: `rotate(${textRotation})`,
            boxShadow: '0 15px 60px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.3)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence baseFrequency='0.04' numOctaves='5' /%3E%3CfeColorMatrix values='0 0 0 0 0.96, 0 0 0 0 0.96, 0 0 0 0 0.96, 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23paper)' opacity='0.2'/%3E%3C/svg%3E")`,
          }}
        >
          {useWashiTape ? (
            // Washi Tape
            <>
              <div
                className="absolute -top-3 left-1/4 w-20 h-6 opacity-80"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.4), transparent), linear-gradient(90deg, ${tapeColor} 0%, ${tapeColor} 100%)`,
                  transform: 'rotate(-4deg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
              <div
                className="absolute -top-3 right-1/4 w-20 h-6 opacity-80"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.4), transparent), linear-gradient(90deg, ${tapeColor} 0%, ${tapeColor} 100%)`,
                  transform: 'rotate(5deg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            </>
          ) : (
            // Push Pin
            <div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-7 h-7 rounded-full shadow-lg z-10"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${pinColor}, ${pinColor}dd)`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <div className="w-2 h-2 bg-white/50 rounded-full absolute top-2 left-2" />
            </div>
          )}

          {/* Store Name - White text on colored header bar */}
          <div
            className="px-8 py-4 -mx-0 -mt-0 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <h2
              className="text-2xl md:text-3xl font-black"
              style={{
                color: '#FFFFFF',
                fontFamily: 'Georgia, serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {title}
            </h2>
          </div>

          {/* Content area */}
          <div className="px-8 pb-8">
            {/* Description */}
            <p
              className="text-base md:text-lg leading-relaxed whitespace-pre-line mb-6"
              style={{
                color: '#2C1810',
                fontFamily: 'Georgia, serif',
              }}
            >
              {description}
            </p>

            {/* Address - Green text */}
            {address && (
              <div className="mb-4 p-3 bg-white/40 rounded"
                style={{
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: '#2E7D32',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  📍 {address}
                </p>
              </div>
            )}

            {/* Map Link - Styled as sticky note */}
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-yellow-300 px-4 py-2 mt-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                style={{
                  color: '#2C1810',
                  fontFamily: 'Comic Sans MS, cursive',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transform: 'rotate(-1deg)',
                }}
              >
                View on Map →
              </a>
            )}
          </div>

          {/* Corner curl effect */}
          <div
            className="absolute bottom-2 right-2 w-6 h-6 opacity-30"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
          />
        </div>
      </motion.div>

      {/* Parallax image - Polaroid style */}
      <div className="md:w-1/2 relative mt-6">
        <div
          className="bg-white p-3 pb-12 shadow-2xl relative"
          style={{
            transform: `rotate(${imageRotation})`,
            boxShadow: '0 15px 60px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          {useWashiTape ? (
            // Washi Tape on image
            <>
              <div
                className="absolute -top-3 left-1/3 w-24 h-6 opacity-85 z-10"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.4), transparent), linear-gradient(90deg, ${tapeColor} 0%, ${tapeColor} 100%)`,
                  transform: 'rotate(-5deg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
              <div
                className="absolute -top-3 right-1/3 w-24 h-6 opacity-85 z-10"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.4), transparent), linear-gradient(90deg, ${tapeColor} 0%, ${tapeColor} 100%)`,
                  transform: 'rotate(6deg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            </>
          ) : (
            // Push Pin on image
            <div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-7 h-7 rounded-full shadow-lg z-10"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${pinColor}, ${pinColor}dd)`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <div className="w-2 h-2 bg-white/50 rounded-full absolute top-2 left-2" />
            </div>
          )}

          {/* Image with parallax - Dynamic height */}
          <div className="overflow-hidden bg-gray-100">
            <motion.img
              src={image}
              alt={title}
              style={{ y }}
              className="w-full object-cover"
              style={{
                y,
                height: imageHeight,
              }}
            />
          </div>

          {/* Polaroid caption area */}
          <div className="mt-3 text-center">
            <p
              className="text-sm italic"
              style={{
                color: '#666',
                fontFamily: 'Comic Sans MS, cursive',
              }}
            >
              {title}
            </p>
          </div>

          {/* Corner curl effect */}
          <div
            className="absolute bottom-2 right-2 w-8 h-8 bg-gray-200 opacity-50"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
