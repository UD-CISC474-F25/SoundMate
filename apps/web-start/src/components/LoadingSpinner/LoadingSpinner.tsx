interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  message,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  const spinner = (
    <>
      <div className={`animate-spin rounded-full border-b-2 border-white mx-auto ${sizeClasses[size]} ${message ? 'mb-4' : ''}`} />
      {message && <p className="text-gray-400">{message}</p>}
    </>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          {spinner}
        </div>
      </div>
    );
  }

  return <div className="text-center">{spinner}</div>;
}
