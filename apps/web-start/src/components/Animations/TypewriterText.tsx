import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  delay?: number;
}

export function TypewriterText({ text, speed = 30, className = '', delay = 0 }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const startDelay = setTimeout(() => {
      let currentIndex = 0;

      const timer = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(startDelay);
  }, [text, speed, delay]);

  return <span className={className}>{displayedText}</span>;
}
