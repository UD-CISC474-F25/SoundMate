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
  connectionStatus?: "NONE" | "PENDING" | "ACCEPTED";
  isPendingFromThem?: boolean;
  connectionId?: string | null;
};

type DiscoveryListProps = {
  users: Array<User>;
  onConnect: (userId: string) => void;
  onAcceptConnection: (connectionId: string) => void;
  onCancelConnection: (connectionId: string) => void;
  onUserClick?: (user: User) => void;
};

// Convert API values → ConnectionButton values
function mapStatus(user: User) {
  if (user.connectionStatus === "ACCEPTED") return "ACCEPTED";

  if (user.connectionStatus === "PENDING") {
    return user.isPendingFromThem ? "PENDING_RECEIVED" : "PENDING_SENT";
  }

  return "NONE";
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
                  {user.compatibilityScore &&
                    user.compatibilityScore > 70 && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium flex-shrink-0">
                        {user.compatibilityScore}% match
                      </span>
                    )}
                </div>
                <p className="text-gray-400 text-sm mb-1">@{user.username}</p>
                {user.bio && (
                  <p className="text-gray-400 text-sm truncate">{user.bio}</p>
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