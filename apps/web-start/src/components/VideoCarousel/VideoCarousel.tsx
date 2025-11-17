import { useState, useEffect } from 'react';

interface VideoCarouselProps {
  videos: string[];
  autoPlayInterval?: number;
  className?: string;
  posterImage?: string;
}

export function VideoCarousel({
  videos,
  autoPlayInterval = 10000,
  className = '',
  posterImage
}: VideoCarouselProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    if (videos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [videos.length, autoPlayInterval]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-full overflow-hidden">
        {videos.map((video, index) => (
          <video
            key={video}
            src={video}
            poster={posterImage}
            preload={index === 0 ? 'auto' : 'metadata'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            loop
            muted
            playsInline
          />
        ))}

        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/70" />
      </div>
    </div>
  );
}
