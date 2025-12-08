import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiClient, useCurrentUser } from '../integrations/api';

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED';
  compatibilityScore: number | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    username: string;
    displayName: string | null;
    profilePhotoUrl: string | null;
  };
  receiver: {
    id: string;
    username: string;
    displayName: string | null;
    profilePhotoUrl: string | null;
  };
  sharedArtists?: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
  }>;
}

export interface OrganizedConnections {
  pendingIncoming: Array<Connection>;
  pendingOutgoing: Array<Connection>;
  accepted: Array<Connection>;
}

/**
 * Hook for managing user connections and friend requests.
 * Automatically organizes connections into incoming requests, outgoing requests, and accepted friends.
 *
 * @param options - Configuration options
 * @param options.autoFetch - Whether to automatically fetch connections on mount (default: true)
 * @returns Object containing organized connections, loading state, error, and refetch function
 */
export function useConnections(options?: {
  autoFetch?: boolean;
}) {
  const { autoFetch = true } = options || {};
  const { request, isAuthenticated, isAuthLoading } = useApiClient();
  const { data: currentUser } = useCurrentUser();

  const [connections, setConnections] = useState<Array<Connection>>([]);
  const [organized, setOrganized] = useState<OrganizedConnections>({
    pendingIncoming: [],
    pendingOutgoing: [],
    accepted: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const organizeConnections = useCallback((data: Array<Connection>, userId: string) => {
    const pendingIncoming = data.filter(
      (conn) => conn.status === 'PENDING' && conn.receiverId === userId
    );
    const pendingOutgoing = data.filter(
      (conn) => conn.status === 'PENDING' && conn.requesterId === userId
    );
    const accepted = data.filter((conn) => conn.status === 'ACCEPTED');

    return {
      pendingIncoming,
      pendingOutgoing,
      accepted,
    };
  }, []);

  const fetchConnections = useCallback(async (force = false) => {
    if (!isAuthenticated || isAuthLoading || !currentUser?.id) {
      return;
    }

    if (hasFetched.current && !force) {
      return;
    }

    hasFetched.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await request<Array<Connection>>('/connections');

      const connectionsArray = Array.isArray(data) ? data : [];
      setConnections(connectionsArray);

      // Organize connections by status and direction
      const organizedData = organizeConnections(connectionsArray, currentUser.id);
      setOrganized(organizedData);
    } catch (err) {
      console.error('[useConnections] Failed to fetch:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch connections.'
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, currentUser?.id, request, organizeConnections]);

  useEffect(() => {
    if (autoFetch && isAuthenticated && !isAuthLoading && currentUser?.id) {
      fetchConnections();
    }
  }, [autoFetch, isAuthenticated, isAuthLoading, currentUser?.id, fetchConnections]);

  return {
    connections,
    organized,
    loading: loading || isAuthLoading,
    error,
    isAuthenticated,
    refetch: () => fetchConnections(true),
  };
}
