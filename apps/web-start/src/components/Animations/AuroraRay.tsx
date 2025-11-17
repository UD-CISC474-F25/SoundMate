import { ReactNode } from 'react';

interface AuroraRayProps {
  children: ReactNode;
  className?: string;
  rounded?: string;
  variant?: 'cool' | 'warm';
  intensity?: 'normal' | 'subtle';
}

export function AuroraRay({ children, className = '', rounded = 'rounded-xl', variant = 'cool', intensity = 'normal' }: AuroraRayProps) {
  const gradients = {
    cool: {
      normal: {
        primary: 'linear-gradient(90deg, transparent 0%, rgba(244, 114, 182, 0.5) 25%, rgba(168, 85, 247, 0.5) 50%, rgba(96, 165, 250, 0.5) 75%, transparent 100%)',
        secondary: 'linear-gradient(-90deg, transparent 0%, rgba(34, 211, 238, 0.4) 33%, rgba(139, 92, 246, 0.4) 66%, transparent 100%)'
      },
      subtle: {
        primary: 'linear-gradient(90deg, transparent 0%, rgba(244, 114, 182, 0.15) 25%, rgba(168, 85, 247, 0.15) 50%, rgba(96, 165, 250, 0.15) 75%, transparent 100%)',
        secondary: 'linear-gradient(-90deg, transparent 0%, rgba(34, 211, 238, 0.12) 33%, rgba(139, 92, 246, 0.12) 66%, transparent 100%)'
      }
    },
    warm: {
      normal: {
        primary: 'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.5) 25%, rgba(132, 204, 22, 0.5) 50%, rgba(34, 197, 94, 0.5) 75%, transparent 100%)',
        secondary: 'linear-gradient(-90deg, transparent 0%, rgba(251, 146, 60, 0.4) 33%, rgba(234, 179, 8, 0.4) 66%, transparent 100%)'
      },
      subtle: {
        primary: 'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.15) 25%, rgba(132, 204, 22, 0.15) 50%, rgba(34, 197, 94, 0.15) 75%, transparent 100%)',
        secondary: 'linear-gradient(-90deg, transparent 0%, rgba(251, 146, 60, 0.12) 33%, rgba(234, 179, 8, 0.12) 66%, transparent 100%)'
      }
    }
  };

  const selectedGradients = gradients[variant][intensity];

  return (
    <div className={`group relative ${className}`}>
      <div className={`absolute inset-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 overflow-hidden ${rounded} pointer-events-none`}>
        <div
          className="absolute inset-0 animate-aurora blur-2xl"
          style={{
            background: selectedGradients.primary
          }}
        />
        <div
          className="absolute inset-0 animate-aurora-reverse blur-2xl"
          style={{
            background: selectedGradients.secondary
          }}
        />
      </div>
      {children}
    </div>
  );
}
