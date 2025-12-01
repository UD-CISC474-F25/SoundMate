import React from "react";
import ConnectionButton from "../ConnectionButton/ConnectionButton";

type User = {
  id: string;
  profilePicture?: string;
  name: string;
  username: string;
  connectionStatus?: string | null;
  connectionId?: string | null;
};

type DiscoveryListProps = {
  users: User[];
  onConnect: (userId: string) => void;
  onAccept: (connectionId: string) => void;
  onCancel: (connectionId: string) => void;
  onOpenProfile: (user: User) => void;
};

const DiscoveryList: React.FC<DiscoveryListProps> = ({ users, onConnect, onAccept, onCancel, onOpenProfile }) => {
  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-4 hover:bg-white/10 transition cursor-pointer"
          onClick={() => onOpenProfile(user)}
        >
          {/* Profile Picture */}
          <img
            src={user.profilePicture || "/default-pfp.png"}
            className="w-12 h-12 rounded-full object-cover border border-white/20"
          />

          {/* Name + Username */}
          <div className="flex-1">
            <p className="text-white font-semibold">{user.name}</p>
            <p className="text-gray-400 text-sm">@{user.username}</p>
          </div>

          {/* Prevent the card click from triggering profile open */}
          <div
            className="w-36"
            onClick={(e) => e.stopPropagation()}
          >
            <ConnectionButton
              connectionStatus={(user.connectionStatus ?? "NONE") as
                | "NONE"
                | "PENDING_SENT"
                | "PENDING_RECEIVED"
                | "ACCEPTED"}
              connectionId={user.connectionId ?? undefined}
              userId={user.id}
              onConnect={onConnect}
              onAccept={onAccept}
              onCancel={onCancel}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiscoveryList;
