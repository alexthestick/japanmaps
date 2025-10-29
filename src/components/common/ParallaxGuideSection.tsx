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

  // Parallax movement for the image
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const opacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  return (
    <section
      ref={ref}
      className={`relative flex flex-col ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center md:items-start gap-10 my-32 max-w-6xl mx-auto px-4`}
    >
      {/* Text content */}
      <motion.div
        className="md:w-1/2 space-y-6"
        style={{ opacity }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-3xl md:text-4xl font-black text-gray-900">{title}</h2>
        <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
          {description}
        </p>
        {address && (
          <p className="text-sm text-gray-500">
            <strong>Address:</strong> {address}
          </p>
        )}
        {mapLink && (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-cyan-500 font-semibold hover:underline transition-colors"
          >
            View on Google Maps →
          </a>
        )}
      </motion.div>

      {/* Parallax image */}
      <div className="md:w-1/2 overflow-hidden rounded-2xl shadow-xl">
        <motion.img
          src={image}
          alt={title}
          style={{ y }}
          className="w-full h-[500px] object-cover rounded-2xl"
        />
      </div>
    </section>
  );
}

