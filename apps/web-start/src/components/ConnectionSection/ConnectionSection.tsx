import type { Connection } from '../../hooks/useConnections';
import DiscoveryList from '../DiscoveryList/DiscoveryList';
import { useCurrentUser } from '../../integrations/api';

interface ConnectionSectionProps {
  title: string;
  description: string;
  connections: Array<Connection>;
  type: 'incoming' | 'outgoing' | 'friends';
  countColor: 'yellow' | 'blue' | 'green';
  onAcceptConnection?: (connectionId: string) => Promise<void>;
  onCancelConnection?: (connectionId: string) => Promise<void>;
  onUserClick?: (userId: string) => void;
}

export function ConnectionSection({
  title,
  description,
  connections,
  type,
  countColor,
  onAcceptConnection = async () => {},
  onCancelConnection = async () => {},
  onUserClick = () => {},
}: ConnectionSectionProps) {
  const { data: currentUser } = useCurrentUser();

  if (connections.length === 0) {
    return null;
  }

  const colorClasses = {
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
  };

  const countLabel = type === 'friends'
    ? connections.length === 1 ? 'friend' : 'friends'
    : type === 'outgoing'
    ? 'pending'
    : connections.length === 1 ? 'request' : 'requests';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${colorClasses[countColor]} font-medium`}>
            {connections.length} {countLabel}
          </span>
        </div>
      </div>

      <DiscoveryList
        users={connections.map(conn => {
          let user;
          let connectionStatus: 'PENDING_RECEIVED' | 'PENDING_SENT' | 'ACCEPTED';

          if (type === 'incoming') {
            user = conn.requester;
            connectionStatus = 'PENDING_RECEIVED';
          } else if (type === 'outgoing') {
            user = conn.receiver;
            connectionStatus = 'PENDING_SENT';
          } else {
            // For friends, determine which user is NOT the current user
            const isRequester = currentUser?.id === conn.requesterId;
            user = isRequester ? conn.receiver : conn.requester;
            connectionStatus = 'ACCEPTED';
          }

          return {
            id: user.id,
            profilePicture: user.profilePhotoUrl,
            displayName: user.displayName,
            username: user.username,
            bio: null,
            compatibilityScore: conn.compatibilityScore ?? undefined,
            connectionStatus,
            isPendingFromThem: type === 'incoming',
            connectionId: conn.id,
            sharedArtists: conn.sharedArtists || [],
          };
        })}
        onUserClick={(userItem) => onUserClick(userItem.id)}
        onConnect={async () => {}}
        onAcceptConnection={onAcceptConnection}
        onCancelConnection={onCancelConnection}
      />
    </div>
  );
}
