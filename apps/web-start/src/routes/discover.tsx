// routes/discover.tsx
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createFileRoute } from '@tanstack/react-router';
import { useOnboardingRedirect } from '../hooks/useOnboardingRedirect';
import { TypewriterText } from '../components/Animations';
import DiscoveryList from '../components/DiscoveryList/DiscoveryList';
import DiscoveryModal from '../components/DiscoveryList/DiscoveryModal';
import SearchBar from '../components/SearchBar/SearchBar';
import { ConnectionSection } from '../components/ConnectionSection/ConnectionSection';
import { useApiClient, useCurrentUser } from '../integrations/api';
import { useFriendSuggestions } from '../hooks/useFriendSuggestions';
import { useConnections } from '../hooks/useConnections';
import { useSpotifySync } from '../hooks/useSpotifySync';
import type { UserProfile } from '../hooks/useUserSearch';

export const Route = createFileRoute('/discover')({
  component: FriendsDiscoveryPage,
});

export function FriendsDiscoveryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const { isCheckingOnboarding, needsOnboarding } = useOnboardingRedirect();
  const { request } = useApiClient();
  const { data: currentUser } = useCurrentUser();

  // Auto-sync Spotify data if needed (respects 5-hour rate limit)
  const { isSyncing: isSpotifySyncing, syncMessage, shouldSync, hasSpotifyConnected } = useSpotifySync({
    autoSync: true,
  });

  const { suggestions, loading: suggestionsLoading, refetch: refetchSuggestions } = useFriendSuggestions({
    limit: 10,
    minScore: 50,
    excludeConnections: true,
  });
  const { organized: connections, loading: connectionsLoading, refetch: refetchConnections } = useConnections();

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Track connections being optimistically removed/updated
  const [hiddenConnectionIds, setHiddenConnectionIds] = useState<Set<string>>(new Set());

  // Track optimistic connection status updates across ALL lists (suggestions, connections, search)
  const [optimisticStatusUpdates, setOptimisticStatusUpdates] = useState<Map<string, {
    connectionStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED';
    connectionId?: string;
  }>>(new Map());

  const [recentUsers, setRecentUsers] = useState<Array<UserProfile>>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('recentUsers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Helper to persist recents
  const persistRecents = (next: Array<UserProfile>) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentUsers', JSON.stringify(next));
      }
    } catch {
      // ignore localStorage errors
    }
    setRecentUsers(next);
  };

  // Add to recents list - limited to 10 entries
  const addToRecents = (user: UserProfile) => {
    const next = [user, ...recentUsers.filter(r => r.id !== user.id)].slice(0, 10);
    persistRecents(next);
  };

  // Update a user if it exists in recents
  const updateRecentUser = (update: Partial<UserProfile> & { id: string }) => {
    const next = recentUsers.map(u => u.id === update.id ? { ...u, ...update } : u);
    persistRecents(next);
  };

  // Remove all recents
  const clearRecents = () => {
    try {
      if (typeof window !== 'undefined') localStorage.removeItem('recentUsers');
    } catch {}
    setRecentUsers([]);
  };

  // Connection handlers
  const handleConnect = async (userId: string) => {
    // Optimistic update for ALL lists (instant UI change)
    setOptimisticStatusUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, { connectionStatus: 'PENDING_SENT' });
      return newMap;
    });

    const newConnection = await request<{ id: string }>('/connections', {
      method: 'POST',
      body: JSON.stringify({ receiverId: userId }),
    });

    // Update with real connectionId
    setOptimisticStatusUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, {
        connectionStatus: 'PENDING_SENT',
        connectionId: newConnection.id
      });
      return newMap;
    });

    // Update recents if present
    updateRecentUser({
      id: userId,
      connectionStatus: 'PENDING_SENT' as const,
      isPendingFromThem: false,
      connectionId: newConnection.id,
    });

    // Only refetch connections (not suggestions - they're based on compatibility which doesn't change)
    refetchConnections().catch(err =>
      console.error('Failed to refetch after connection:', err)
    );

    return newConnection;
  };

  const handleAcceptConnection = async (connectionId: string) => {
    // Find userId from connections to update optimistic status
    const allConnections = [
      ...connections.pendingIncoming,
      ...connections.pendingOutgoing,
      ...connections.accepted,
    ];
    const connection = allConnections.find(c => c.id === connectionId);
    const userId = connection
      ? (connection.requester.id === currentUser?.id
        ? connection.receiver.id
        : connection.requester.id)
      : null;

    // Hide from pending lists immediately (optimistic)
    setHiddenConnectionIds(prev => new Set(prev).add(connectionId));

    // Update optimistic status to ACCEPTED
    if (userId) {
      setOptimisticStatusUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, {
          connectionStatus: 'ACCEPTED',
          connectionId
        });
        return newMap;
      });
    }

    await request(`/connections/${connectionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });

    // Update any recents that have this connectionId
    const next = recentUsers.map(u => u.connectionId === connectionId ? { ...u, connectionStatus: 'ACCEPTED' as const, isPendingFromThem: false } : u);
    persistRecents(next);

    // Also update selectedUser if open
    if (selectedUser?.connectionId === connectionId) {
      setSelectedUser(prev => prev ? { ...prev, connectionStatus: 'ACCEPTED', isPendingFromThem: false } : prev);
    }

    // Only refetch connections (not suggestions)
    refetchConnections().then(() => {
      // Clear optimistic update after refetch
      setHiddenConnectionIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectionId);
        return newSet;
      });
      // Keep optimistic status update for a bit longer
      setTimeout(() => {
        if (userId) {
          setOptimisticStatusUpdates(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
        }
      }, 1000);
    }).catch(err =>
      console.error('Failed to refetch after accept:', err)
    );
  };

  const handleCancelConnection = async (connectionId: string) => {
    // Find userId from connections to update optimistic status
    const allConnections = [
      ...connections.pendingIncoming,
      ...connections.pendingOutgoing,
      ...connections.accepted,
    ];
    const connection = allConnections.find(c => c.id === connectionId);
    const userId = connection
      ? (connection.requester.id === currentUser?.id
        ? connection.receiver.id
        : connection.requester.id)
      : null;

    // Hide from UI immediately (optimistic)
    setHiddenConnectionIds(prev => new Set(prev).add(connectionId));

    // Update optimistic status to NONE
    if (userId) {
      setOptimisticStatusUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, { connectionStatus: 'NONE' });
        return newMap;
      });
    }

    await request(`/connections/${connectionId}`, {
      method: 'DELETE',
    });

    // Reset any recents that had this connectionId
    const next = recentUsers.map(u => u.connectionId === connectionId ? { ...u, connectionStatus: 'NONE' as const, isPendingFromThem: false, connectionId: null } : u);
    persistRecents(next);

    if (selectedUser?.connectionId === connectionId) {
      setSelectedUser(prev => prev ? { ...prev, connectionStatus: 'NONE' as const, isPendingFromThem: false, connectionId: null } : prev);
    }

    // Only refetch connections (not suggestions)
    refetchConnections().then(() => {
      // Clear optimistic update after refetch
      setHiddenConnectionIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectionId);
        return newSet;
      });
      // Keep optimistic status update for a bit longer for search results
      setTimeout(() => {
        if (userId) {
          setOptimisticStatusUpdates(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
        }
      }, 1000);
    }).catch(err =>
      console.error('Failed to refetch after cancel:', err)
    );
  };

  // Called by SearchBar when a result is clicked
  const handleSelectUserFromSearch = (user: UserProfile) => {
    // Save to recents and open modal
    addToRecents(user);
    setSelectedUser(user);
  };

  // User clicked a recent in the DiscoveryList
  const handleClickRecent = (userId: string) => {
    const user = recentUsers.find(u => u.id === userId);
    if (!user) return;
    setSelectedUser(user);
  };

  // User clicked a suggestion
  const handleClickSuggestion = (userId: string) => {
    const suggestion = suggestions.find(s => s.user.id === userId);
    if (!suggestion) return;

    // Convert suggestion to UserProfile format
    const userProfile: UserProfile = {
      id: suggestion.user.id,
      username: suggestion.user.username,
      displayName: suggestion.user.displayName,
      profilePhotoUrl: suggestion.user.profilePhotoUrl,
      bio: suggestion.user.bio,
      compatibilityScore: suggestion.compatibilityScore,
      connectionStatus: suggestion.user.connectionStatus as any,
      isPendingFromThem: suggestion.user.isPendingFromThem,
      connectionId: suggestion.user.connectionId,
      topArtists: suggestion.sharedArtists.map(artist => ({
        artist: {
          name: artist.name,
          imageUrl: artist.imageUrl,
        }
      })),
    };

    // Add to recents and open modal
    addToRecents(userProfile);
    setSelectedUser(userProfile);
  };

  // User clicked a connection (friend, pending request, etc.)
  const handleClickConnection = async (userId: string) => {
    // Find the connection in any of the three lists
    const allConnections = [
      ...connections.pendingIncoming,
      ...connections.pendingOutgoing,
      ...connections.accepted,
    ];

    const connection = allConnections.find(
      conn => conn.requester.id === userId || conn.receiver.id === userId
    );
    if (!connection) return;

    // Determine which user to display
    const user = connection.requester.id === userId
      ? connection.requester
      : connection.receiver;

    // Determine connection status
    let connectionStatus: 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' = 'ACCEPTED';
    let isPendingFromThem = false;

    if (connection.status === 'PENDING') {
      if (connection.receiverId === userId) {
        connectionStatus = 'PENDING_SENT';
        isPendingFromThem = false;
      } else {
        connectionStatus = 'PENDING_RECEIVED';
        isPendingFromThem = true;
      }
    }

    // Fetch full user profile with bio
    try {
      const fullProfile = await request<any>(`/users/${userId}/profile`);

      // Use sharedArtists from connection if available, otherwise fetch from profile
      const artistsToDisplay = connection.sharedArtists && connection.sharedArtists.length > 0
        ? connection.sharedArtists.map(artist => ({
            artist: {
              name: artist.name,
              imageUrl: artist.imageUrl,
            }
          }))
        : fullProfile.topArtists?.map((ta: any) => ({
            artist: {
              name: ta.artist.name,
              imageUrl: ta.artist.imageUrl,
            }
          })) || [];

      const userProfile: UserProfile = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePhotoUrl: user.profilePhotoUrl,
        bio: fullProfile.bio,
        compatibilityScore: connection.compatibilityScore ?? undefined,
        connectionStatus,
        isPendingFromThem,
        connectionId: connection.id,
        topArtists: artistsToDisplay,
      };

      setSelectedUser(userProfile);
    } catch (err) {
      console.error('Failed to fetch full user profile:', err);
      // Fallback to limited profile if fetch fails, using sharedArtists from connection
      const artistsToDisplay = connection.sharedArtists && connection.sharedArtists.length > 0
        ? connection.sharedArtists.map(artist => ({
            artist: {
              name: artist.name,
              imageUrl: artist.imageUrl,
            }
          }))
        : [];

      const userProfile: UserProfile = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePhotoUrl: user.profilePhotoUrl,
        bio: null,
        compatibilityScore: connection.compatibilityScore ?? undefined,
        connectionStatus,
        isPendingFromThem,
        connectionId: connection.id,
        topArtists: artistsToDisplay,
      };
      setSelectedUser(userProfile);
    }
  };

  if (authLoading || !isAuthenticated || isCheckingOnboarding || needsOnboarding) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <TypewriterText text="Discover Friends" delay={200} />
          </h1>
          <p className="text-gray-400">
            <TypewriterText text="Connect with people who share your music taste" delay={500} />
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          onSelectUser={handleSelectUserFromSearch}
          placeholder="Search by username, name, or interests..."
          className="mb-8"
          onConnect={handleConnect}
          onAccept={handleAcceptConnection}
          onCancel={handleCancelConnection}
          optimisticStatusUpdates={optimisticStatusUpdates}
        />

        {/* Pending Requests */}
        <ConnectionSection
          title="Pending Requests"
          description="People who want to connect with you"
          connections={connections.pendingIncoming.filter(c => !hiddenConnectionIds.has(c.id))}
          type="incoming"
          countColor="yellow"
          onAcceptConnection={handleAcceptConnection}
          onCancelConnection={handleCancelConnection}
          onUserClick={handleClickConnection}
        />

        {/* Sent Invitations */}
        <ConnectionSection
          title="Sent Invitations"
          description="Friend requests you've sent"
          connections={connections.pendingOutgoing.filter(c => !hiddenConnectionIds.has(c.id))}
          type="outgoing"
          countColor="blue"
          onCancelConnection={handleCancelConnection}
          onUserClick={handleClickConnection}
        />

        {/* Friends */}
        <ConnectionSection
          title="Friends"
          description="Your connected friends"
          connections={connections.accepted.filter(c => !hiddenConnectionIds.has(c.id))}
          type="friends"
          countColor="green"
          onCancelConnection={handleCancelConnection}
          onUserClick={handleClickConnection}
        />

        {/* Friend Suggestions */}
        {!suggestionsLoading && suggestions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Suggested Friends</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {suggestions.some(s => s.compatibilityScore >= 50)
                    ? 'Based on music compatibility'
                    : 'Showing all available users (no high compatibility matches found)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-400 font-medium">
                  {suggestions.length} {suggestions.length === 1 ? 'match' : 'matches'} found
                </span>
              </div>
            </div>

            <DiscoveryList
              users={suggestions.map(s => {
                const user = s.user as any;

                // Check for optimistic update first
                const optimisticUpdate = optimisticStatusUpdates.get(user.id);
                const finalConnectionStatus = optimisticUpdate
                  ? optimisticUpdate.connectionStatus
                  : (user.connectionStatus === 'PENDING'
                    ? (user.isPendingFromThem ? 'PENDING_RECEIVED' : 'PENDING_SENT')
                    : (user.connectionStatus || 'NONE'));

                return {
                  id: user.id,
                  profilePicture: user.profilePhotoUrl,
                  displayName: user.displayName,
                  username: user.username,
                  bio: user.bio,
                  compatibilityScore: s.compatibilityScore,
                  connectionStatus: finalConnectionStatus,
                  isPendingFromThem: user.isPendingFromThem || false,
                  connectionId: optimisticUpdate?.connectionId ?? user.connectionId ?? null,
                  sharedArtists: s.sharedArtists.map(a => ({ id: a.id, name: a.name, imageUrl: a.imageUrl })),
                };
              })}
              onUserClick={(userItem) => {
                handleClickSuggestion(userItem.id);
              }}
              onConnect={(userId) => handleConnect(userId)}
              onAcceptConnection={(connectionId) => handleAcceptConnection(connectionId)}
              onCancelConnection={(connectionId) => handleCancelConnection(connectionId)}
            />
          </div>
        )}

        {/* Suggestions Loading State */}
        {suggestionsLoading && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Suggested Friends</h2>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">
                {isSpotifySyncing ? 'Syncing your Spotify data...' : 'Finding your perfect music matches...'}
              </p>
              {syncMessage && (
                <p className="text-sm text-gray-500 mt-2">{syncMessage}</p>
              )}
            </div>
          </div>
        )}

        {/* Suggestions Empty State */}
        {!suggestionsLoading && suggestions.length === 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Suggested Friends</h2>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-300 font-medium mb-2">No suggestions available yet</p>
              <p className="text-gray-400 text-sm mb-4">
                Connect your Spotify and sync your music to get personalized friend suggestions!
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[Discover] Refresh button clicked');
                  refetchSuggestions();
                }}
                disabled={suggestionsLoading}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors cursor-pointer"
              >
                {suggestionsLoading ? 'Loading...' : 'Refresh Suggestions'}
              </button>
            </div>
          </div>
        )}

        {/* Recent Searches */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recent Searches</h2>
            <button
              onClick={clearRecents}
              className="text-sm text-red-300 hover:text-red-400 transition"
            >
              Clear
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-gray-400">You haven't searched for anyone recently.</p>
          ) : (
            <DiscoveryList
              users={recentUsers.map(u => {
                // Check for optimistic update first
                const optimisticUpdate = optimisticStatusUpdates.get(u.id);
                const finalConnectionStatus = optimisticUpdate
                  ? optimisticUpdate.connectionStatus
                  : (u.connectionStatus || 'NONE');

                return {
                  id: u.id,
                  profilePicture: u.avatar ?? u.profilePhotoUrl ?? null,
                  displayName: u.displayName ?? null,
                  username: u.username,
                  bio: u.bio ?? null,
                  compatibilityScore: u.compatibilityScore,
                  connectionStatus: finalConnectionStatus as any,
                  isPendingFromThem: u.isPendingFromThem,
                  connectionId: (optimisticUpdate?.connectionId ?? u.connectionId) ?? null,
                };
              })}
              onUserClick={(userItem) => {
                handleClickRecent(userItem.id);
              }}
              onConnect={(userId) => handleConnect(userId)}
              onAcceptConnection={(connectionId) => handleAcceptConnection(connectionId)}
              onCancelConnection={(connectionId) => handleCancelConnection(connectionId)}
            />
          )}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <DiscoveryModal
            user={{
              ...selectedUser,
              displayName: selectedUser.displayName ?? null,
              profilePhotoUrl: selectedUser.profilePhotoUrl ?? null,
              bio: selectedUser.bio ?? null,
              topArtists: (selectedUser.topArtists ?? []).map(a => ({
                artist: {
                  name: a.artist.name,
                  imageUrl: a.artist.imageUrl ?? null,
                }
              })),
            }}
            onClose={() => setSelectedUser(null)}
            onConnect={handleConnect}
            onAcceptConnection={(id) => selectedUser.connectionId ? handleAcceptConnection(id) : Promise.resolve()}
            onCancelConnection={(id) => selectedUser.connectionId ? handleCancelConnection(id) : Promise.resolve()}
          />
        )}
      </div>
    </div>
  );
}