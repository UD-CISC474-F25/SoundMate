import { ReactNode } from 'react';

interface AuroraRayProps {
  children: ReactNode;
  className?: string;
  rounded?: string;
}

export function AuroraRay({ children, className = '', rounded = 'rounded-xl' }: AuroraRayProps) {
  return (
    <div className={`group relative ${className}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden ${rounded} pointer-events-none`}>
        <div
          className="absolute inset-0 animate-aurora blur-2xl"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(244, 114, 182, 0.5) 25%, rgba(168, 85, 247, 0.5) 50%, rgba(96, 165, 250, 0.5) 75%, transparent 100%)'
          }}
        />
        <div
          className="absolute inset-0 animate-aurora-reverse blur-2xl"
          style={{
            background: 'linear-gradient(-90deg, transparent 0%, rgba(34, 211, 238, 0.4) 33%, rgba(139, 92, 246, 0.4) 66%, transparent 100%)'
          }}
        />
      </div>
      {children}
    </div>
  );
}
