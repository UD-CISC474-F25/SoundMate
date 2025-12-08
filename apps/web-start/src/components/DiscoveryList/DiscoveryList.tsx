import React from "react";
import ConnectionButton from "../ConnectionButton/ConnectionButton";
import { RainbowStripe } from "../Animations/RainbowStripe";

type User = {
  id: string;
  profilePicture?: string | null;
  displayName?: string | null;
  username: string;
  bio?: string | null;
  compatibilityScore?: number;
  connectionStatus?: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED";
  isPendingFromThem?: boolean;
  connectionId?: string | null;
  sharedArtists?: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
  }>;
};

type DiscoveryListProps = {
  users: Array<User>;
  onConnect: (userId: string) => Promise<any>;
  onAcceptConnection: (connectionId: string) => Promise<any>;
  onCancelConnection: (connectionId: string) => Promise<any>;

  onUserClick?: (user: User) => void;
};

// Return the connection status as-is (already in correct format)
function mapStatus(user: User) {
  return user.connectionStatus || "NONE";
}

const DiscoveryList: React.FC<DiscoveryListProps> = ({
  users,
  onConnect,
  onAcceptConnection,
  onCancelConnection,
  onUserClick,
}) => {
  if (users.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg text-center">
        <p className="text-gray-400 mb-2">No users found</p>
        <p className="text-gray-500 text-sm">Try a different search term</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4 mb-6">
      {users.map((user) => {
        const mappedStatus = mapStatus(user);

        return (
          <RainbowStripe key={user.id}>
            <li
              className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg flex items-center gap-4 ${
                onUserClick ? "cursor-pointer hover:border-gray-700" : ""
              }`}
              onClick={() => onUserClick?.(user)}
            >
              {/* Profile Picture */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.displayName || user.username).charAt(0).toUpperCase()
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold truncate text-xl">
                    {user.displayName || user.username}
                  </h3>
                  {user.compatibilityScore !== undefined && user.compatibilityScore > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        user.compatibilityScore >= 90
                          ? 'bg-green-500/20 text-green-400'
                          : user.compatibilityScore >= 75
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : user.compatibilityScore >= 50
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {user.compatibilityScore}% match
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-1">@{user.username}</p>
                {user.bio && (
                  <p className="text-gray-400 text-sm truncate">{user.bio}</p>
                )}
                {user.sharedArtists && user.sharedArtists.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-gray-400">Mutual:</span>
                    <div className="flex -space-x-2">
                      {user.sharedArtists.slice(0, 3).map((artist) => (
                        <div
                          key={artist.id}
                          className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-900"
                          title={artist.name}
                        >
                          {artist.imageUrl ? (
                            <img
                              src={artist.imageUrl}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-purple-500 flex items-center justify-center text-xs text-white">
                              {artist.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {user.sharedArtists.length} {user.sharedArtists.length === 1 ? 'artist' : 'artists'}
                    </span>
                  </div>
                )}
              </div>

              {/* Connection Button */}
              <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <ConnectionButton
                  userId={user.id}
                  connectionStatus={mappedStatus}
                  connectionId={user.connectionId ?? undefined}
                  onConnect={onConnect}
                  onAccept={onAcceptConnection}
                  onCancel={onCancelConnection}
                />
              </div>
            </li>
          </RainbowStripe>
        );
      })}
    </ul>
  );
};

export default DiscoveryList;