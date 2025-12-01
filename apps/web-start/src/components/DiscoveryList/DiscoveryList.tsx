import { UserCheck, UserPlus, Clock, Check } from 'lucide-react';
import { RainbowStripe } from '../Animations/RainbowStripe';

interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  bio: string | null;
  topArtists: Array<{
    artist: {
      name: string;
      imageUrl: string | null;
    };
  }>;
  connectionStatus?: 'PENDING' | 'ACCEPTED' | 'NONE';
  isPendingFromThem?: boolean;
  compatibilityScore?: number;
}

interface DiscoveryListProps {
  users: Array<UserProfile>;
  onUserClick?: (user: UserProfile) => void;
  onConnect: (userId: string) => void;
  onAcceptConnection: (userId: string) => void;
  onCancelConnection: (userId: string) => void;
}

export function DiscoveryList({
  users,
  onUserClick,
  onConnect,
  onAcceptConnection,
  onCancelConnection,
}: DiscoveryListProps) {
  const getConnectionButton = (user: UserProfile) => {
    if (user.connectionStatus === 'ACCEPTED') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
          <UserCheck size={16} />
          <span>Friends</span>
        </div>
      );
    }

    if (user.connectionStatus === 'PENDING' && user.isPendingFromThem) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAcceptConnection(user.id);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Check size={16} />
          <span>Accept</span>
        </button>
      );
    }

    if (user.connectionStatus === 'PENDING') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancelConnection(user.id);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          <Clock size={16} />
          <span>Pending</span>
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConnect(user.id);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg text-sm font-medium transition-colors"
      >
        <UserPlus size={16} />
        <span>Connect</span>
      </button>
    );
  };

  if (users.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg text-center">
        <p className="text-gray-400 mb-2">No users found</p>
        <p className="text-gray-500 text-sm">
          Try a different search term
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4 mb-6">
      {users.map(user => (
        <RainbowStripe key={user.id}>
          <li
            className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg ${
              onUserClick ? 'cursor-pointer hover:border-gray-700' : ''
            }`}
            onClick={() => onUserClick?.(user)}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold truncate text-xl">
                    {user.displayName || user.username}
                  </h3>
                  {user.compatibilityScore && user.compatibilityScore > 70 && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium flex-shrink-0">
                      {user.compatibilityScore}% match
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-1">@{user.username}</p>
                {user.bio && (
                  <p className="text-gray-400 text-sm truncate">{user.bio}</p>
                )}
              </div>

              <div className="flex-shrink-0">
                {getConnectionButton(user)}
              </div>
            </div>
          </li>
        </RainbowStripe>
      ))}
    </ul>
  );
}