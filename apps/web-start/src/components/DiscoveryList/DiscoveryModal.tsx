import { useState, useRef, useEffect } from 'react';
import { UserCheck, UserPlus, Clock, Check, Music } from 'lucide-react';
import { SlideFade } from '../Animations';

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

interface DiscoveryModalProps {
  user: UserProfile;
  onClose: () => void;
  onConnect: (userId: string) => void;
  onAcceptConnection: (userId: string) => void;
  onCancelConnection: (userId: string) => void; // also used for unfriending
}

interface UserDetailsProps {
  user: UserProfile;
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
  const [view] = useState<'details'>('details');

  const detailsRef = useRef<HTMLDivElement>(null);
  const [modalHeight, setModalHeight] = useState<number | null>(null);

  useEffect(() => {
    if (detailsRef.current) {
      setModalHeight(detailsRef.current.scrollHeight);
    }
  }, [user]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg 
                   max-w-lg w-full p-6 text-white relative overflow-hidden pb-12"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: modalHeight ? `${modalHeight}px` : 'auto',
          transition: 'height 0.3s ease',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
        >
          &times;
        </button>

        <div
          ref={detailsRef}
          className="absolute opacity-0 -z-50 pointer-events-none inset-0"
        >
          <UserDetailsContent
            user={user}
            onConnect={onConnect}
            onAcceptConnection={onAcceptConnection}
            onCancelConnection={onCancelConnection}
          />
        </div>

        <div className="relative h-full">
          <SlideFade show={view === 'details'}>
            <UserDetailsContent
              user={user}
              onConnect={onConnect}
              onAcceptConnection={onAcceptConnection}
              onCancelConnection={onCancelConnection}
            />
          </SlideFade>
        </div>
      </div>
    </div>
  );
}

function UserDetailsContent({
  user,
  onConnect,
  onAcceptConnection,
  onCancelConnection,
}: UserDetailsProps) {
  const handleConnect = () => onConnect(user.id);
  const handleAccept = () => onAcceptConnection(user.id);
  const handleCancel = () => onCancelConnection(user.id); // also handles unfriend

  return (
    <div className="p-6 pb-20">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
            {(user.displayName || user.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.displayName || user.username}
            </h2>
            <p className="text-gray-400">@{user.username}</p>
          </div>
        </div>
      </div>

      {user.compatibilityScore && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-400 text-sm font-medium">Music Compatibility</span>
            <span className="text-purple-400 text-2xl font-bold">
              {user.compatibilityScore}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${user.compatibilityScore}%` }}
            />
          </div>
        </div>
      )}

      {user.bio && (
        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed">{user.bio}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-400 mb-3">
          <Music size={18} />
          <span className="text-sm font-medium">Top Artists</span>
        </div>
        <div className="space-y-2">
          {user.topArtists.slice(0, 5).map((topArtist, idx) => (
            <div
              key={idx}
              className="bg-white/10 border border-white/20 rounded-lg p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {topArtist.artist.name.charAt(0)}
              </div>
              <span className="text-white">{topArtist.artist.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Buttons */}
      <div className="flex flex-col gap-3">

        {user.connectionStatus === 'ACCEPTED' ? (
          <>
            <button className="w-full py-3 bg-green-500/20 text-green-400 rounded-lg font-medium flex items-center justify-center gap-2">
              <UserCheck size={20} />
              <span>Friends</span>
            </button>

            <button
              onClick={handleCancel}
              className="w-full py-2 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
            >
              Unfriend
            </button>
          </>

        ) : user.connectionStatus === 'PENDING' && user.isPendingFromThem ? (
          <>
            <button
              onClick={handleAccept}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check size={20} />
              <span>Accept Request</span>
            </button>

            <button
              onClick={handleCancel}
              className= "w-full py-2 bg-gray-500/20 text-white-300 rounded-lg text-sm font-medium hover:bg-gray-500/30 transition-colors"
            >
              Decline
            </button>
          </>

        ) : user.connectionStatus === 'PENDING' ? (
          <button
            onClick={handleCancel}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Clock size={20} />
            <span>Cancel Request</span>
          </button>

        ) : (
          <button
            onClick={handleConnect}
            className="w-full py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            <span>Send Friend Request</span>
          </button>
        )}

      </div>
    </div>
  );
}
