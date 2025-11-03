import { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3;
  className?: string;
}

export function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const delayClass = delay === 0
    ? 'animate-fade-in'
    : `animate-fade-in-delay-${delay}`;

  return (
    <div className={`${delayClass} ${className}`}>
      {children}
    </div>
  );
}
