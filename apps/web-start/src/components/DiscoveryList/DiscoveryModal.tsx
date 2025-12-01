import React from "react";
import { X } from "lucide-react";
import ConnectionButton from "../ConnectionButton/ConnectionButton";

interface User {
  id: string;
  name: string;
  username: string;
  bio?: string;
  profilePicture?: string;
  connectionStatus?: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED";
  connectionId?: string;
}

interface Props {
  user?: User | null;
  onClose: () => void;
  onConnect: (userId: string) => void;
  onAccept: (userId: string) => void;
  onCancel: (userId: string) => void;
}

const DiscoveryModal: React.FC<Props> = ({ user, onClose, onConnect, onAccept, onCancel }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md p-6 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-300 hover:text-white transition"
        >
          <X size={22} />
        </button>

        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <img
            src={user.profilePicture || "/default-pfp.png"}
            className="w-24 h-24 rounded-full object-cover mb-4 border border-white/30"
          />

          <h2 className="text-xl font-semibold text-white">
            {user.name}
          </h2>

          <p className="text-gray-300 text-sm mt-1">@{user.username}</p>

          <p className="text-gray-300 mt-4 text-sm">
            {user.bio || "This user hasn’t written a bio yet."}
          </p>
        </div>

        {/* Button Section */}
        <div className="mt-6">
          <ConnectionButton
            connectionStatus={user.connectionStatus ?? "NONE"}
            connectionId={user.connectionId}
            userId={user.id}
            onConnect={onConnect}
            onAccept={onAccept}
            onCancel={onCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscoveryModal;
