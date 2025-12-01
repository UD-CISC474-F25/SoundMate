import React from "react";

type Props = {
  connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED";
  connectionId?: string;
  userId: string;
  onConnect: (userId: string) => void;
  onAccept: (connectionId: string) => void;
  onCancel: (connectionId: string) => void;
};

const ConnectionButton: React.FC<Props> = ({
  connectionStatus,
  connectionId,
  userId,
  onConnect,
  onAccept,
  onCancel,
}) => {
  switch (connectionStatus) {
    case "NONE":
      return (
        <button
          onClick={() => onConnect(userId)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
        >
          Add Friend
        </button>
      );

    case "PENDING_SENT":
      return (
        <button
          onClick={() => onCancel(connectionId!)}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md w-full"
        >
          Cancel Request
        </button>
      );

    case "PENDING_RECEIVED":
      return (
        <div className="flex gap-2 w-full">
          <button
            onClick={() => onAccept(connectionId!)}
            className="bg-green-500 text-white px-4 py-2 rounded-md flex-1"
          >
            Accept
          </button>
          <button
            onClick={() => onCancel(connectionId!)}
            className="bg-red-500 text-white px-4 py-2 rounded-md flex-1"
          >
            Decline
          </button>
        </div>
      );

    case "ACCEPTED":
      return (
        <button
          onClick={() => onCancel(connectionId!)}
          className="text-red-400 underline w-full"
        >
          Unfriend
        </button>
      );

    default:
      return null;
  }
};

export default ConnectionButton;
