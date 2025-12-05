// routes/discover.tsx
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createFileRoute } from '@tanstack/react-router';
import { useOnboardingRedirect } from '../hooks/useOnboardingRedirect';
import { TypewriterText } from '../components/Animations';
import DiscoveryList from '../components/DiscoveryList/DiscoveryList';
import DiscoveryModal from '../components/DiscoveryList/DiscoveryModal';
import SearchBar from '../components/SearchBar/SearchBar';
import { useApiClient } from '../integrations/api';
import type { UserProfile } from '../hooks/useUserSearch';

export const Route = createFileRoute('/discover')({
  component: FriendsDiscoveryPage,
});

export function FriendsDiscoveryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const { isCheckingOnboarding, needsOnboarding } = useOnboardingRedirect();
  const { request } = useApiClient();

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

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
    try {
      const newConnection = await request<{ id: string }>('/connections', {
        method: 'POST',
        body: JSON.stringify({ receiverId: userId }),
      });

      // Update recents if present
      updateRecentUser({
        id: userId,
        connectionStatus: 'PENDING' as const,
        isPendingFromThem: false,
        connectionId: newConnection.id,
      });
    } catch (err) {
      console.error('Failed to send connection request:', err);
      alert(err instanceof Error ? err.message : 'Failed to send connection request.');
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
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
    } catch (err) {
      console.error('Failed to accept connection:', err);
      alert(err instanceof Error ? err.message : 'Failed to accept connection.');
    }
  };

  const handleCancelConnection = async (connectionId: string) => {
    try {
      await request(`/connections/${connectionId}`, {
        method: 'DELETE',
      });

      // Reset any recents that had this connectionId
      const next = recentUsers.map(u => u.connectionId === connectionId ? { ...u, connectionStatus: 'NONE' as const, isPendingFromThem: false, connectionId: null } : u);
      persistRecents(next);

      if (selectedUser?.connectionId === connectionId) {
        setSelectedUser(prev => prev ? { ...prev, connectionStatus: 'NONE' as const, isPendingFromThem: false, connectionId: null } : prev);
      }
    } catch (err) {
      console.error('Failed to cancel connection:', err);
      alert(err instanceof Error ? err.message : 'Failed to cancel connection.');
    }
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

  // Map connection status for DiscoveryList compatibility
  const getConnectionStatusForList = (user: UserProfile) => {
    if (user.connectionStatus === 'ACCEPTED') return 'ACCEPTED';
    if (user.connectionStatus === 'PENDING') {
      return user.isPendingFromThem ? 'PENDING_RECEIVED' : 'PENDING_SENT';
    }
    return 'NONE';
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
        />

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
              users={recentUsers.map(u => ({
                id: u.id,
                profilePicture: u.avatar ?? u.profilePhotoUrl ?? null,
                displayName: u.displayName ?? null,
                username: u.username,
                bio: u.bio ?? null,
                compatibilityScore: u.compatibilityScore,
                connectionStatus: getConnectionStatusForList(u) as any,
                isPendingFromThem: u.isPendingFromThem,
                connectionId: u.connectionId ?? null,
              }))}
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