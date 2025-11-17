import { useState, useEffect } from 'react';

interface ImageCarouselProps {
  images: string[];
  autoPlayInterval?: number;
  className?: string;
}

export function ImageCarousel({
  images,
  autoPlayInterval = 10000,
  className = ''
}: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Background"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/70" />
      </div>
    </div>
  );
}
