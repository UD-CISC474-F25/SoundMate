import { useState } from 'react';
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
  const [displayedUsers, setDisplayedUsers] = useState<Array<UserProfile>>([]);

  // Update user in both displayed list and selected user
  const updateUserInState = (updatedUser: Partial<UserProfile> & { id: string }) => {
    setDisplayedUsers(users => 
      users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u)
    );
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser(prev => prev ? { ...prev, ...updatedUser } : null);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      const newConnection = await request<{ id: string }>('/connections', {
        method: 'POST',
        body: JSON.stringify({ receiverId: userId }),
      });
      
      // Update status to PENDING with isPendingFromThem = false (we sent it)
      updateUserInState({ 
        id: userId, 
        connectionStatus: 'PENDING', 
        isPendingFromThem: false, 
        connectionId: newConnection.id 
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
      
      // Find all users with this connection ID and update them
      const usersToUpdate = displayedUsers.filter(u => u.connectionId === connectionId);
      usersToUpdate.forEach(u => 
        updateUserInState({ 
          id: u.id, 
          connectionStatus: 'ACCEPTED', 
          isPendingFromThem: false 
        })
      );
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
      
      // Find all users with this connection ID and reset their status
      const usersToUpdate = displayedUsers.filter(u => u.connectionId === connectionId);
      usersToUpdate.forEach(u => 
        updateUserInState({ 
          id: u.id, 
          connectionStatus: 'NONE', 
          isPendingFromThem: false, 
          connectionId: null 
        })
      );
    } catch (err) {
      console.error('Failed to cancel connection:', err);
      alert(err instanceof Error ? err.message : 'Failed to cancel connection.');
    }
  };

  const handleSelectUser = (user: UserProfile) => {
    // Update displayed users if not already there
    if (!displayedUsers.find(u => u.id === user.id)) {
      setDisplayedUsers(prev => [...prev, user]);
    }
    // Open modal with selected user
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

        {/* Integrated SearchBar Component with Connection Actions */}
        <SearchBar
          onSelectUser={handleSelectUser}
          placeholder="Search by username, name, or interests..."
          className="mb-8"
          onConnect={handleConnect}
          onAccept={handleAcceptConnection}
          onCancel={handleCancelConnection}
        />

        {/* Discovery List (if you still want to show a separate list) */}
        {displayedUsers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Searches</h2>
            <DiscoveryList
              users={displayedUsers.map(u => ({
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
              onUserClick={(user) => {
                const original = displayedUsers.find(u => u.id === user.id);
                if (original) {
                  setSelectedUser(original);
                }
              }}
              onConnect={handleConnect}
              onAcceptConnection={handleAcceptConnection}
              onCancelConnection={handleCancelConnection}
            />
          </div>
        )}

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