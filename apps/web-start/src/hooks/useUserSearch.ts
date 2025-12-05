import { useEffect, useRef, useState } from 'react';
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

export function useUserSearch(searchQuery: string) {
  const { request, isAuthenticated, isAuthLoading } = useApiClient();

  const [users, setUsers] = useState<Array<UserProfile>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce Function
  const debouncedQuery = useDebounce(searchQuery, 400);

  // Track last query we fetched
  const lastFetchedQuery = useRef("");

  useEffect(() => {
    let ignore = false;

    async function fetchUsers() {
      if (!isAuthenticated || isAuthLoading) return;

      // If empty query → reset
      if (!debouncedQuery.trim()) {
        lastFetchedQuery.current = "";
        setUsers([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Fetched this exact query → don't fetch again
      if (lastFetchedQuery.current === debouncedQuery) {
        return;
      }

      // Otherwise → perform search
      setLoading(true);
      setError(null);

      try {
        const data = await request<Array<UserProfile>>(
          `/users/discover?search=${encodeURIComponent(debouncedQuery)}`
        );

        if (!ignore) {
          const userList = Array.isArray(data)
            ? data
            : (data as any).users || [];

          setUsers(userList);

          // Mark this query as fetched
          lastFetchedQuery.current = debouncedQuery;
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Unable to search users."
          );
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
    isAuthenticated,
  };
}
