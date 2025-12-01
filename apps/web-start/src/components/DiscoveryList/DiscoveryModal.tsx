import { useRef, useEffect, useState } from 'react';
import { SlideFade } from '../Animations';
import ConnectionButton from '../ConnectionButton/ConnectionButton';

interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  bio: string | null;
  topArtists: Array<{ artist: { name: string; imageUrl: string | null } }>;
  connectionStatus?: 'PENDING' | 'ACCEPTED' | 'NONE';
  isPendingFromThem?: boolean;
  compatibilityScore?: number;
}

interface DiscoveryModalProps {
  user: UserProfile;
  onClose: () => void;
  onConnect: (userId: string) => void;
  onAcceptConnection: (userId: string) => void;
  onCancelConnection: (userId: string) => void;
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

  useEffect(() => {
    if (detailsRef.current) {
      setModalHeight(detailsRef.current.scrollHeight + 100); // extra space for footer
    }
  }, [user]);

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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold z-10"
        >
          &times;
        </button>

        {/* Modal Content */}
        <div
          ref={detailsRef}
          className="p-6 flex-1 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{user.displayName || user.username}</h2>
              <p className="text-gray-400">@{user.username}</p>
            </div>
          </div>

          {/* Compatibility */}
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

          {/* Bio */}
          {user.bio && <p className="text-gray-300 leading-relaxed mb-4">{user.bio}</p>}

          {/* Top Artists */}
          <div>
            <p className="text-gray-400 font-medium mb-2">Top Artists</p>
            <div className="space-y-2">
              {user.topArtists.slice(0, 5).map((t, i) => (
                <div
                  key={i}
                  className="bg-white/10 border border-white/20 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.artist.name.charAt(0)}
                  </div>
                  <span>{t.artist.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Connection Button */}
        <div className="p-6 border-t border-white/20 bg-white/5 backdrop-blur-md flex flex-col gap-2">
          <ConnectionButton
            connectionStatus={
              user.connectionStatus === 'PENDING' && user.isPendingFromThem
                ? 'PENDING_RECEIVED'
                : user.connectionStatus === 'PENDING'
                ? 'PENDING_SENT'
                : user.connectionStatus === 'ACCEPTED'
                ? 'ACCEPTED'
                : 'NONE'
            }
            userId={user.id}
            connectionId={user.id} // can replace with actual connectionId if available
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