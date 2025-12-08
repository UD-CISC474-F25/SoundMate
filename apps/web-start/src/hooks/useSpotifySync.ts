import { useState, useCallback, useEffect } from 'react';
import { useApiClient, useCurrentUser } from '../integrations/api';

const SYNC_INTERVAL_HOURS = 5;

interface SpotifySyncResponse {
  success: boolean;
  message: string;
  lastSyncedAt?: string;
  nextSyncAvailable?: string;
  requiresSpotifyAuth?: boolean;
}

/**
 * Hook for syncing Spotify data with automatic rate limiting.
 * Only syncs if last sync was more than 5 hours ago.
 *
 * @param options.autoSync - Whether to automatically sync on mount if needed (default: false)
 * @returns Object with sync function, loading state, and sync status info
 */
export function useSpotifySync(options?: { autoSync?: boolean }) {
  const { autoSync = false } = options || {};
  const { request } = useApiClient();
  const { data: currentUser, refetch: refetchUser } = useCurrentUser();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  /**
   * Check if sync is needed based on last sync time
   */
  const shouldSync = useCallback(() => {
    // If user has no spotify stats at all, sync is needed (first time)
    if (!currentUser?.spotifyStats) return true;

    const lastSync = currentUser.spotifyStats.lastSyncedAt;
    if (!lastSync) return true; // Never synced before

    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceLastSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastSync >= SYNC_INTERVAL_HOURS;
  }, [currentUser]);

  /**
   * Get time remaining until next sync is available
   */
  const getTimeUntilNextSync = useCallback(() => {
    if (!currentUser?.spotifyStats?.lastSyncedAt) return null;

    const lastSyncDate = new Date(currentUser.spotifyStats.lastSyncedAt);
    const nextSyncDate = new Date(lastSyncDate.getTime() + SYNC_INTERVAL_HOURS * 60 * 60 * 1000);
    const now = new Date();

    const hoursRemaining = Math.max(0, (nextSyncDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    return {
      hours: Math.floor(hoursRemaining),
      minutes: Math.floor((hoursRemaining % 1) * 60),
      nextSyncDate,
    };
  }, [currentUser]);

  /**
   * Sync Spotify data (respects rate limiting unless force=true)
   */
  const syncSpotify = useCallback(async (force = false) => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncError(null);

    try {
      const endpoint = force ? '/spotify/sync-all?force=true' : '/spotify/sync-all';
      const response = await request<SpotifySyncResponse>(endpoint, {
        method: 'POST',
      });

      if (response.success) {
        setSyncMessage(response.message);
        // Refresh user data to get updated lastSyncedAt
        await refetchUser();
      } else {
        setSyncMessage(response.message);
        if (response.requiresSpotifyAuth) {
          setSyncError('Please connect your Spotify account first.');
        }
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync Spotify data';
      setSyncError(errorMessage);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [request, refetchUser]);

  /**
   * Auto-sync on mount if enabled and sync is needed
   */
  useEffect(() => {
    if (autoSync && currentUser && shouldSync() && !isSyncing) {
      syncSpotify(false).catch(() => {
        // Error already handled in syncSpotify
      });
    }
  }, [autoSync, currentUser, shouldSync, syncSpotify, isSyncing]);

  return {
    syncSpotify,
    isSyncing,
    syncMessage,
    syncError,
    shouldSync: shouldSync(),
    lastSyncedAt: currentUser?.spotifyStats?.lastSyncedAt || null,
    timeUntilNextSync: getTimeUntilNextSync(),
    hasSpotifyConnected: !!currentUser?.spotifyStats,
  };
}
