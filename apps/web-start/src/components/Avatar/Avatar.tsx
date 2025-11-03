interface AvatarProps {
  imageSrc?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Avatar({ imageSrc, name, size = 'medium' }: AvatarProps) {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  };

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-base',
    large: 'w-20 h-20 text-2xl',
  };

  return (
    <div className={`inline-block rounded-full overflow-hidden shrink-0 ${sizeClasses[size]}`}>
      {imageSrc ? (
        <img src={imageSrc} alt={name || 'User avatar'} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#3B5B29]">
          <span className="text-white font-semibold">{getInitials(name)}</span>
        </div>
      )}
    </div>
  );
}
