import { ReactNode } from 'react';

interface RainbowStripeProps {
  children: ReactNode;
  className?: string;
}

export function RainbowStripe({ children, className = '' }: RainbowStripeProps) {
  return (
    <div className={`group relative ${className}`}>
      {/* Moving rainbow stripe effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent animate-rainbow-slide" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent animate-rainbow-slide-delay-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-rainbow-slide-delay-2" />
      </div>
      {children}
    </div>
  );
}
