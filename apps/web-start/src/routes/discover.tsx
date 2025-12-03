import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Search, X } from 'lucide-react';
import { useOnboardingRedirect } from '../hooks/useOnboardingRedirect';
import { TypewriterText } from '../components/Animations';
import DiscoveryList from '../components/DiscoveryList/DiscoveryList';
import DiscoveryModal from '../components/DiscoveryList/DiscoveryModal';

export const Route = createFileRoute('/discover')({
  component: DiscoveryPage,
});

interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  bio: string | null;
  topArtists: Array<{
    artist: {
      name: string;
      imageUrl: string | null;
    };
  }>;
  connectionStatus?: 'PENDING' | 'ACCEPTED' | 'NONE';
  isPendingFromThem?: boolean;
  compatibilityScore?: number;
  connectionId?: string | null;
}

function DiscoveryPage() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();

  const { isCheckingOnboarding, needsOnboarding } = useOnboardingRedirect();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSpotifySuccess, setShowSpotifySuccess] = useState(false);
  const [showSpotifyError, setShowSpotifyError] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<Array<UserProfile>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = await getAccessTokenSilently();
    return fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Static fallback mock users
  const mockUsers: UserProfile[] = useMemo(
    () => [
      {
        id: 'mock-1',
        username: 'lofi_lover',
        displayName: 'Luna',
        profilePhotoUrl: 'https://i.pravatar.cc/150?img=32',
        bio: 'I make playlists at 3AM',
        topArtists: [
          { artist: { name: 'Joji', imageUrl: null } },
          { artist: { name: 'Keshi', imageUrl: null } },
        ],
        connectionStatus: 'NONE',
        isPendingFromThem: false,
        compatibilityScore: 92,
        connectionId: null,
      },
      {
        id: 'mock-2',
        username: 'rockstar98',
        displayName: 'Evan',
        profilePhotoUrl: 'https://i.pravatar.cc/150?img=12',
        bio: 'Rock & indie forever 🤘',
        topArtists: [
          { artist: { name: 'Arctic Monkeys', imageUrl: null } },
          { artist: { name: 'The Strokes', imageUrl: null } },
        ],
        connectionStatus: 'NONE',
        isPendingFromThem: false,
        compatibilityScore: 88,
        connectionId: null,
      },
      {
        id: 'mock-3',
        username: 'edmfairy',
        displayName: 'Mia',
        profilePhotoUrl: 'https://i.pravatar.cc/150?img=47',
        bio: 'PLUR ✨ festival girlie',
        topArtists: [
          { artist: { name: 'Illenium', imageUrl: null } },
          { artist: { name: 'Seven Lions', imageUrl: null } },
        ],
        connectionStatus: 'NONE',
        isPendingFromThem: false,
        compatibilityScore: 95,
        connectionId: null,
      },
    ],
    []
  );

  // Load discovery data
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadData = async () => {
      setIsLoadingUsers(true);

      try {
        const [usersRes, connectionsRes] = await Promise.all([
          apiCall('/users/discover'),
          apiCall('/connections'),
        ]);

        const usersData = usersRes.ok ? await usersRes.json() : [];
        const connectionsData = connectionsRes.ok ? await connectionsRes.json() : [];

        const usersWithConnections = usersData.map((user: any) => {
          const connection = connectionsData.find(
            (c: any) => c.requesterId === user.id || c.receiverId === user.id
          );

          if (!connection) {
            return { ...user, connectionStatus: 'NONE', connectionId: null };
          }

          return {
            ...user,
            connectionStatus: connection.status,
            isPendingFromThem:
              connection.receiverId !== user.id && connection.status === 'PENDING',
            connectionId: connection.id,
          };
        });

        setUsers([...usersWithConnections, ...mockUsers]);
      } catch (err) {
        console.error('Failed to load discovery data:', err);
        setUsers(mockUsers);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    void loadData();
  }, [authLoading, isAuthenticated, apiCall, mockUsers]);

  // Spotify callback UI
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('spotify');

    if (state === 'connected') {
      setShowSpotifySuccess(true);
    } else if (state === 'error') {
      setShowSpotifyError(true);
    }

    if (state) {
      window.history.replaceState({}, '', '/discover');
      setTimeout(() => {
        setShowSpotifySuccess(false);
        setShowSpotifyError(false);
      }, 5000);
    }
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spotifyCallback = params.get('spotify');
    const hasOAuthParams =
      window.location.search.includes('code=') || window.location.search.includes('state=');

    if (!authLoading && !isAuthenticated && !spotifyCallback && !hasOAuthParams) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter((u) =>
      u.username.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Connection handlers
  const handleConnect = async (userId: string) => {
    try {
      const res = await apiCall('/connections', {
        method: 'POST',
        body: JSON.stringify({ receiverId: userId }),
      });
      if (!res.ok) throw new Error();
      const newConnection = await res.json();

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, connectionStatus: 'PENDING', isPendingFromThem: false, connectionId: newConnection.id }
            : u
        )
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((u) =>
          u ? { ...u, connectionStatus: 'PENDING', isPendingFromThem: false, connectionId: newConnection.id } : u
        );
      }
    } catch {
      alert('Failed to send request.');
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const res = await apiCall(`/connections/${connectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });
      if (!res.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) =>
          u.connectionId === connectionId
            ? { ...u, connectionStatus: 'ACCEPTED', isPendingFromThem: false }
            : u
        )
      );
      if (selectedUser?.connectionId === connectionId) {
        setSelectedUser((u) =>
          u ? { ...u, connectionStatus: 'ACCEPTED', isPendingFromThem: false } : u
        );
      }
    } catch {
      alert('Failed to accept connection.');
    }
  };

  const handleCancelConnection = async (connectionId: string) => {
    try {
      const res = await apiCall(`/connections/${connectionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) =>
          u.connectionId === connectionId
            ? { ...u, connectionStatus: 'NONE', isPendingFromThem: false, connectionId: null }
            : u
        )
      );
      if (selectedUser?.connectionId === connectionId) {
        setSelectedUser((u) =>
          u ? { ...u, connectionStatus: 'NONE', isPendingFromThem: false, connectionId: null } : u
        );
      }
    } catch {
      alert('Failed to cancel connection.');
    }
  };

  // Gated UI loading
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

        {showSpotifySuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-400">
            Spotify connected successfully! Your music data has been synced.
          </div>
        )}

        {showSpotifyError && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            Failed to connect Spotify. Please try again.
          </div>
        )}

        {/* Search */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20" />
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

        {/* Discovery List */}
        {isLoadingUsers ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-white mx-auto mb-4" />
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : (
          <DiscoveryList
            users={filteredUsers.map((u) => ({
              id: u.id,
              profilePicture: u.profilePhotoUrl ?? undefined,
              displayName: u.displayName ?? undefined,
              username: u.username,
              bio: u.bio ?? undefined,
              compatibilityScore: u.compatibilityScore,
              connectionStatus: u.connectionStatus ?? 'NONE',
              isPendingFromThem: u.isPendingFromThem,
              connectionId: u.connectionId ?? undefined,
            }))}
            onUserClick={(u) => {
              const original = users.find((p) => p.id === u.id) ?? null;
              setSelectedUser(original);
            }}
            onConnect={handleConnect}
            onAcceptConnection={handleAcceptConnection}
            onCancelConnection={handleCancelConnection}
          />
        )}

        {selectedUser && (
          <DiscoveryModal
            user={selectedUser}
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
