import { useState } from 'react';
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

  // Discovery Filters
  const [filter, setFilter] = useState<'suggestions' | 'pending' | 'sent' | 'friends'>('suggestions');

  // Auto-sync Spotify data if needed (respects 5-hour rate limit)
  const { isSyncing: isSpotifySyncing, syncMessage } = useSpotifySync({
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

  // Version counter to force SearchBar re-render when optimistic updates change
  const [optimisticUpdateVersion, setOptimisticUpdateVersion] = useState(0);

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
    setOptimisticUpdateVersion(v => v + 1);

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
    setOptimisticUpdateVersion(v => v + 1);

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
      setOptimisticUpdateVersion(v => v + 1);
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
          setOptimisticUpdateVersion(v => v + 1);
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
      setOptimisticUpdateVersion(v => v + 1);
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
          setOptimisticUpdateVersion(v => v + 1);
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
  const handleClickSuggestion = async (userId: string) => {
    const suggestion = suggestions.find(s => s.user.id === userId);
    if (!suggestion) return;

    // Fetch full user profile for complete artist data
    try {
      const fullProfile = await request<any>(`/users/${userId}/profile`);

      // Use full top artists from profile for complete list
      const artistsToDisplay = fullProfile.topArtists?.filter((ta: any) => ta && ta.name).map((ta: any) => ({
        artist: {
          name: ta.name,
          imageUrl: ta.imageUrl,
        }
      })) || [];

      const userProfile: UserProfile = {
        id: suggestion.user.id,
        username: suggestion.user.username,
        displayName: suggestion.user.displayName,
        profilePhotoUrl: suggestion.user.profilePhotoUrl,
        bio: fullProfile.bio || suggestion.user.bio,
        compatibilityScore: suggestion.compatibilityScore,
        connectionStatus: suggestion.user.connectionStatus as any,
        isPendingFromThem: suggestion.user.isPendingFromThem,
        connectionId: suggestion.user.connectionId,
        topArtists: artistsToDisplay,
      };

      // Add to recents and open modal
      addToRecents(userProfile);
      setSelectedUser(userProfile);
    } catch (err) {
      console.error('Failed to fetch full profile for suggestion:', err);
      // Fallback to suggestion data if fetch fails
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

      addToRecents(userProfile);
      setSelectedUser(userProfile);
    }
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
      const connectionSharedArtists = (connection as any).sharedArtists;
      const artistsToDisplay = connectionSharedArtists && connectionSharedArtists.length > 0
        ? connectionSharedArtists.map((artist: any) => ({
            artist: {
              name: artist.name,
              imageUrl: artist.imageUrl,
            }
          }))
        : (fullProfile.topArtists?.filter((ta: any) => ta && ta.name).map((ta: any) => ({
            artist: {
              name: ta.name,
              imageUrl: ta.imageUrl,
            }
          })) || []);

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
      const connectionSharedArtists = (connection as any).sharedArtists;
      const artistsToDisplay = connectionSharedArtists && Array.isArray(connectionSharedArtists) && connectionSharedArtists.length > 0
        ? connectionSharedArtists.filter((artist: any) => artist && artist.name).map((artist: any) => ({
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

        {/* FILTERS */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('suggestions')}
            className={`px-4 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              filter === 'suggestions'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Requests
            {(connections.pendingIncoming.filter(c => !hiddenConnectionIds.has(c.id)).length + connections.pendingOutgoing.filter(c => !hiddenConnectionIds.has(c.id)).length) > 0 && (
              <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                {connections.pendingIncoming.filter(c => !hiddenConnectionIds.has(c.id)).length + connections.pendingOutgoing.filter(c => !hiddenConnectionIds.has(c.id)).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('friends')}
            className={`px-4 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              filter === 'friends'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Friends
            {connections.accepted.filter(c => !hiddenConnectionIds.has(c.id)).length > 0 && (
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                {connections.accepted.filter(c => !hiddenConnectionIds.has(c.id)).length}
              </span>
            )}
          </button>
        </div>

        {/* FILTERED CONTENT */}
        {filter === 'suggestions' && (
          <>
        {/* Friend Suggestions */}
        
        {/* Search Bar */}
        <SearchBar
          key={optimisticUpdateVersion}
          onSelectUser={handleSelectUserFromSearch}
          placeholder="Search by username, name, or interests..."
          className="mb-8"
          onConnect={async (userId) => { await handleConnect(userId); }}
          onAccept={async (connectionId) => { await handleAcceptConnection(connectionId); }}
          onCancel={async (connectionId) => { await handleCancelConnection(connectionId); }}
          optimisticStatusUpdates={optimisticStatusUpdates}
        />

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
              onConnect={async (userId) => { await handleConnect(userId); }}
              onAcceptConnection={(connectionId) => handleAcceptConnection(connectionId)}
              onCancelConnection={(connectionId) => handleCancelConnection(connectionId)}
            />
          </div>
        )}

            {/* Suggestions Loading State */}
            {suggestionsLoading && (
              <div className="mb-8">
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
                    onClick={() => refetchSuggestions()}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors cursor-pointer"
                  >
                    Refresh Suggestions
                  </button>
                </div>
              </div>
            )}
            
            {/* Recent Searches */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Recent Searches</h2>
                {recentUsers.length > 0 && (
                  <button
                    onClick={clearRecents}
                    className="text-sm text-red-300 hover:text-red-400 transition"
                  >
                    Clear
                  </button>
                )}
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
                      connectionStatus: finalConnectionStatus,
                      isPendingFromThem: u.isPendingFromThem,
                      connectionId: optimisticUpdate?.connectionId ?? u.connectionId ?? null,
                    };
                  })}
                  onUserClick={(userItem) => {
                    handleClickRecent(userItem.id);
                  }}
                  onConnect={async (userId) => { await handleConnect(userId); }}
                  onAcceptConnection={(connectionId) => handleAcceptConnection(connectionId)}
                  onCancelConnection={(connectionId) => handleCancelConnection(connectionId)}
                />
              )}
            </div>
          </>
        )}

        {filter === 'pending' && (
          <>
            {connectionsLoading ? (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading requests...</p>
              </div>
            ) : connections.pendingIncoming.length === 0 && connections.pendingOutgoing.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-300 font-medium mb-2">No pending requests</p>
                <p className="text-gray-400 text-sm">
                  You don't have any pending connection requests at the moment.
                </p>
              </div>
            ) : (
              <>
                {connections.pendingIncoming.filter(c => !hiddenConnectionIds.has(c.id)).length > 0 && (
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
                )}

                {connections.pendingOutgoing.filter(c => !hiddenConnectionIds.has(c.id)).length > 0 && (
                  <div className={connections.pendingIncoming.filter(c => !hiddenConnectionIds.has(c.id)).length > 0 ? "mt-8" : ""}>
                    <ConnectionSection
                      title="Sent Invitations"
                      description="Friend requests you've sent"
                      connections={connections.pendingOutgoing.filter(c => !hiddenConnectionIds.has(c.id))}
                      type="outgoing"
                      countColor="blue"
                      onCancelConnection={handleCancelConnection}
                      onUserClick={handleClickConnection}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {filter === 'friends' && (
          <>
            {connectionsLoading ? (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading friends...</p>
              </div>
            ) : connections.accepted.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-300 font-medium mb-2">No friends yet</p>
                <p className="text-gray-400 text-sm">
                  Start connecting with people who share your music taste!
                </p>
              </div>
            ) : (
              <ConnectionSection
                title="Friends"
                description="Your connected friends"
                connections={connections.accepted.filter(c => !hiddenConnectionIds.has(c.id))}
                type="friends"
                countColor="green"
                onCancelConnection={handleCancelConnection}
                onUserClick={handleClickConnection}
              />
            )}
          </>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <DiscoveryModal
            user={{
              ...selectedUser,
              displayName: selectedUser.displayName ?? null,
              profilePhotoUrl: selectedUser.profilePhotoUrl ?? null,
              bio: selectedUser.bio ?? null,
              // Apply optimistic updates to modal user
              connectionStatus: optimisticStatusUpdates.get(selectedUser.id)?.connectionStatus ?? selectedUser.connectionStatus,
              connectionId: optimisticStatusUpdates.get(selectedUser.id)?.connectionId ?? selectedUser.connectionId,
              topArtists: (selectedUser.topArtists ?? []).map(a => ({
                artist: {
                  name: a.artist.name,
                  imageUrl: a.artist.imageUrl ?? null,
                }
              })),
            }}
            onClose={() => setSelectedUser(null)}
            onConnect={async (userId) => {
              await handleConnect(userId);
              // Update selectedUser to reflect the change
              setSelectedUser(prev => prev ? { ...prev, connectionStatus: 'PENDING_SENT' } : null);
            }}
            onAcceptConnection={async (id) => {
              if (selectedUser.connectionId) {
                await handleAcceptConnection(id);
                setSelectedUser(prev => prev ? { ...prev, connectionStatus: 'ACCEPTED' } : null);
              }
            }}
            onCancelConnection={async (id) => {
              if (selectedUser.connectionId) {
                await handleCancelConnection(id);
                setSelectedUser(prev => prev ? { ...prev, connectionStatus: 'NONE', connectionId: null } : null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}