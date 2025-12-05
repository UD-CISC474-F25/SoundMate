import { useEffect, useState } from 'react';
import { useApiClient } from '../integrations/api';
import { useDebounce } from './useDebounce';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  avatar?: string | null;
  bio: string | null;
  topArtists?: Array<{ artist: { name: string; imageUrl?: string | null } }>;
  connectionStatus?: 'PENDING' | 'ACCEPTED' | 'NONE';
  isPendingFromThem?: boolean;
  compatibilityScore?: number;
  connectionId?: string | null;
}

interface UserSearchResponse {
  users: UserProfile[];
  total?: number;
}

/**
 * Hook for searching users with debounced input
 * Uses the API client for consistent auth handling
 */
export function useUserSearch(searchQuery: string) {
  const { request, isAuthenticated, isAuthLoading } = useApiClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the user's input
  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    let ignore = false;

    async function fetchUsers() {
      // Don't fetch if not authenticated or still loading auth
      if (!isAuthenticated || isAuthLoading) {
        return;
      }

      // Clear users if query is empty
      if (!debouncedQuery.trim()) {
        setLoading(false);
        setError(null);
        return;
    }


      setLoading(true);
      setError(null);

      try {
        const data = await request<UserProfile[]>(
          `/users/discover?search=${encodeURIComponent(debouncedQuery)}`
        );
        
        if (!ignore) {
          // Handle both array response and object with users property
          const userList = Array.isArray(data) ? data : (data as any).users || [];
          setUsers(userList);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unable to search users.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      ignore = true;
    };
  }, [debouncedQuery, request, isAuthenticated, isAuthLoading]);

  return { 
    users, 
    setUsers, 
    loading: loading || isAuthLoading, 
    error,
    isAuthenticated 
  };
}