import { useEffect, useState, useRef, useCallback } from 'react';
import { useApiClient } from '../integrations/api';

export interface FriendSuggestion {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    profilePhotoUrl: string | null;
    bio: string | null;
    connectionStatus?: string;
    isPendingFromThem?: boolean;
    connectionId?: string | null;
  };
  compatibilityScore: number;
  sharedArtists: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
  }>;
  sharedGenres: string[];
}

/**
 * Hook for fetching friend suggestions based on music compatibility.
 *
 * @param options - Configuration options for fetching suggestions
 * @param options.limit - Maximum number of suggestions to return (default: 10)
 * @param options.minScore - Minimum compatibility score threshold (default: 50)
 * @param options.excludeConnections - Whether to exclude existing connections (default: true)
 * @param options.autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns Object containing suggestions, loading state, error, and refetch function
 */
export function useFriendSuggestions(options?: {
  limit?: number;
  minScore?: number;
  excludeConnections?: boolean;
  autoFetch?: boolean;
}) {
  const {
    limit = 10,
    minScore = 50,
    excludeConnections = true,
    autoFetch = true,
  } = options || {};

  const { request, isAuthenticated, isAuthLoading } = useApiClient();

  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchSuggestions = useCallback(async (force = false) => {
    if (!isAuthenticated || isAuthLoading) {
      return;
    }

    if (hasFetched.current && !force) {
      return;
    }

    hasFetched.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        minScore: minScore.toString(),
        excludeConnections: excludeConnections.toString(),
      });

      const data = await request<FriendSuggestion[]>(
        `/matching/suggestions?${params.toString()}`,
      );

      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[useFriendSuggestions] Failed to fetch:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch friend suggestions.',
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoFetch && isAuthenticated && !isAuthLoading) {
      fetchSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, isAuthenticated, isAuthLoading]);

  return {
    suggestions,
    loading: loading || isAuthLoading,
    error,
    isAuthenticated,
    refetch: () => fetchSuggestions(true),
  };
}
