import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Search, X } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import { useOnboardingRedirect } from '../hooks/useOnboardingRedirect';
import { TypewriterText } from '../components/Animations';
import DiscoveryList from '../components/DiscoveryList/DiscoveryList';
import DiscoveryModal from '../components/DiscoveryList/DiscoveryModal';
import { useUserSearch } from '../components/SearchBar/useUserSearch';

export const Route = createFileRoute('/discover')({
  component: FriendsDiscoveryPage,
});

interface UserProfile {
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

export function FriendsDiscoveryPage() {
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const { isCheckingOnboarding, needsOnboarding } = useOnboardingRedirect();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const { users, setUsers, loading, error } = useUserSearch(searchQuery, getAccessTokenSilently);

  const updateUserInState = (updatedUser: Partial<UserProfile> & { id: string }) => {
    setUsers(users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser({ ...selectedUser, ...updatedUser });
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (!res.ok) throw new Error('Failed to send connection request');
      const newConnection = await res.json();
      updateUserInState({ id: userId, connectionStatus: 'PENDING', isPendingFromThem: false, connectionId: newConnection.id });
    } catch {
      alert('Failed to send connection request.');
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });
      if (!res.ok) throw new Error('Failed to accept connection');
      const updatedUsers = users.filter(u => u.connectionId === connectionId);
      updatedUsers.forEach(u => updateUserInState({ id: u.id, connectionStatus: 'ACCEPTED', isPendingFromThem: false }));
    } catch {
      alert('Failed to accept connection.');
    }
  };

  const handleCancelConnection = async (connectionId: string) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/connections/${connectionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to cancel connection');
      const updatedUsers = users.filter(u => u.connectionId === connectionId);
      updatedUsers.forEach(u => updateUserInState({ id: u.id, connectionStatus: 'NONE', isPendingFromThem: false, connectionId: null }));
    } catch {
      alert('Failed to cancel connection.');
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

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 -z-1" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, name, or interests..."
              className="w-full pl-12 pr-12 py-3 bg-transparent text-white placeholder-gray-400 rounded-xl focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Searching users...</p>
          </div>
        ) : error ? (
          <p className="text-red-400 text-center py-12">{error}</p>
        ) : (
          <DiscoveryList
            users={users.map(u => ({
              id: u.id,
              profilePicture: u.avatar ?? u.profilePhotoUrl ?? null,
              displayName: u.displayName ?? null,
              username: u.username,
              bio: u.bio ?? null,
              compatibilityScore: u.compatibilityScore,
              connectionStatus: u.connectionStatus ?? 'NONE',
              isPendingFromThem: u.isPendingFromThem,
              connectionId: u.connectionId ?? null,
            }))}
            onUserClick={(user) => {
              const original = users.find(u => u.id === user.id) ?? null;
              if (original) {
                setSelectedUser({
                  ...original,
                  displayName: original.displayName ?? null,
                  profilePhotoUrl: original.profilePhotoUrl ?? null,
                  bio: original.bio ?? null,
                });
              } else {
                setSelectedUser(null);
              }
            }}
            onConnect={handleConnect}
            onAcceptConnection={handleAcceptConnection}
            onCancelConnection={handleCancelConnection}
          />
        )}

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
            onAcceptConnection={handleAcceptConnection}
            onCancelConnection={handleCancelConnection}
          />
        )}
      </div>
    </div>
  );
}
