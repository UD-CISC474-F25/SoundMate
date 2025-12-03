import React from "react";
import { UserPlus, Clock, Check, X, Users } from "lucide-react";

type Props = {
  connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED";
  connectionId?: string;
  userId: string;
  onConnect: (userId: string) => void;
  onAccept: (connectionId: string) => void;
  onCancel: (connectionId: string) => void;
  isPendingFromThem?: boolean;
};

const ConnectionButton: React.FC<Props> = ({
  connectionStatus,
  connectionId,
  userId,
  onConnect,
  onAccept,
  onCancel,
}) => {
  const base =
    `px-4 py-2 rounded-full font-medium transition-colors cursor-pointer capitalize border border-white/30 bg-white/10 flex items-center gap-2 justify-center w-full`;

  switch (connectionStatus) {
    case "NONE":
      return (
        <button
          onClick={() => onConnect(userId)}
          className={`${base} hover:shadow-[0_0_12px_rgba(255,255,255,0.4)]`}
        >
          <UserPlus size={16} />
          Add Friend
        </button>
      );

    case "PENDING_SENT":
      return (
        <button
          onClick={() => onCancel(connectionId!)}
          className={`${base} border-blue-300/40 hover:shadow-[0_0_12px_rgba(120,150,255,0.5)]`}
        >
          <Clock size={16} />
          Cancel Request
        </button>
      );

    case "PENDING_RECEIVED":
      return (
        <div className="flex gap-2 w-full">
          <button
            onClick={() => onAccept(connectionId!)}
            className={`${base} flex-1 border-green-300/40 hover:shadow-[0_0_12px_rgba(0,255,150,0.5)]`}
          >
            <Check size={16} />
            Accept
          </button>
          <button
            onClick={() => onCancel(connectionId!)}
            className={`${base} flex-1 border-red-300/40 hover:shadow-[0_0_12px_rgba(255,60,80,0.5)]`}
          >
            <X size={16} />
            Decline
          </button>
        </div>
      );

    case "ACCEPTED":
      return (
        <button
          onClick={() => onCancel(connectionId!)}
          className={`${base} border-purple-400/40 hover:shadow-[0_0_14px_rgba(180,100,255,0.6)]`}
        >
          <Users size={16} />
          Friends
        </button>
      );

    default:
      return null;
  }
};

export default ConnectionButton;
