import React from "react";

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
  isPendingFromThem = false,
}) => {
  const baseButton =
    "px-4 py-2 rounded-xl font-medium text-sm transition-colors w-full flex items-center justify-center gap-2";

  switch (connectionStatus) {
    case "NONE":
      return (
        <button
          onClick={() => onConnect(userId)}
          className={`${baseButton} bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 text-white`}
        >
          Add Friend
        </button>
      );

    case "PENDING_SENT":
      return (
        <button
          onClick={() => onCancel(connectionId!)}
          className={`${baseButton} bg-gray-700/30 backdrop-blur-xl border border-gray-500/30 text-gray-200 hover:bg-gray-700/50`}
        >
          Cancel Request
        </button>
      );

    case "PENDING_RECEIVED":
      return (
        <div className="flex gap-2 w-full">
          <button
            onClick={() => onAccept(connectionId!)}
            className={`${baseButton} bg-green-500/20 backdrop-blur-xl border border-green-400/30 text-green-300 hover:bg-green-500/30 flex-1`}
          >
            Accept
          </button>
          <button
            onClick={() => onCancel(connectionId!)}
            className={`${baseButton} bg-red-500/20 backdrop-blur-xl border border-red-400/30 text-red-300 hover:bg-red-500/30 flex-1`}
          >
            Decline
          </button>
        </div>
      );

    case "ACCEPTED":
      return (
        <button
          onClick={() => onCancel(connectionId!)}
          className={`${baseButton} text-purple-400 hover:text-white border border-purple-400/30 bg-purple-500/10 backdrop-blur-xl`}
        >
          Friends
        </button>
      );

    default:
      return null;
  }
};

export default ConnectionButton;
