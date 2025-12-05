import { useRef, useState } from 'react';
import ConnectionButton from '../ConnectionButton/ConnectionButton';

interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  bio: string | null;
  topArtists: Array<{ artist: { name: string; imageUrl: string | null } }>;
  connectionStatus?: "NONE" | "PENDING" | "ACCEPTED";
  isPendingFromThem?: boolean;
  compatibilityScore?: number;
  connectionId?: string | null;
}

interface DiscoveryModalProps {
  user: UserProfile;
  onClose: () => void;
  onConnect: (userId: string) => Promise<void>;
  onAcceptConnection: (connectionId: string) => Promise<void>;
  onCancelConnection: (connectionId: string) => Promise<void>;

}

export function DiscoveryModal({
  user,
  onClose,
  onConnect,
  onAcceptConnection,
  onCancelConnection,
}: DiscoveryModalProps) {
  const detailsRef = useRef<HTMLDivElement>(null);
  const [modalHeight, setModalHeight] = useState<number | null>(null);

  const getConnectionStatus = () => {
    if (user.connectionStatus === 'ACCEPTED') return 'ACCEPTED';
    if (user.connectionStatus === 'PENDING') {
      return user.isPendingFromThem ? 'PENDING_RECEIVED' : 'PENDING_SENT';
    }
    return 'NONE';
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg max-w-lg w-full text-white relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: modalHeight ? `${modalHeight}px` : 'auto',
          transition: 'height 0.3s ease',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold z-10"
        >
          &times;
        </button>

        <div
          ref={detailsRef}
          className="p-6 flex-1 overflow-y-auto"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.displayName || user.username).charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{user.displayName || user.username}</h2>
              <p className="text-gray-400">@{user.username}</p>
            </div>
          </div>

          {user.bio && <p className="text-gray-300 leading-relaxed mb-4">{user.bio}</p>}

          {user.compatibilityScore && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400 text-sm font-medium">Music Compatibility</span>
                <span className="text-purple-400 text-xl font-bold">{user.compatibilityScore}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${user.compatibilityScore}%` }}
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-gray-400 font-medium mb-2">Top Artists</p>
            <div className="space-y-2">
              {user.topArtists.slice(0, 5).map((t, i) => (
                <div
                  key={i}
                  className="bg-white/10 border border-white/20 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {t.artist.imageUrl ? (
                      <img
                        src={t.artist.imageUrl}
                        alt={t.artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      t.artist.name.charAt(0)
                    )}
                  </div>
                  <span>{t.artist.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/20 bg-white/5 backdrop-blur-md flex flex-col gap-2">
          <ConnectionButton
            connectionStatus={getConnectionStatus()}
            userId={user.id}
            connectionId={user.connectionId ?? undefined}
            onConnect={onConnect}
            onAccept={onAcceptConnection}
            onCancel={onCancelConnection}
          />
        </div>
      </div>
    </div>
  );
}

export default DiscoveryModal;