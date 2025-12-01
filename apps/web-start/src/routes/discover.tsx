import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Search, X } from 'lucide-react';
import { useOnboardingRedirect } from '../hooks/useOnboardingRedirect';
import { TypewriterText } from '../components/Animations';
import { DiscoveryList } from '../components/DiscoveryList/DiscoveryList';
import { DiscoveryModal } from '../components/DiscoveryList/DiscoveryModal';

export const Route = createFileRoute('/discover')({
  component: FriendsDiscoveryPage,
  loader: async () => {
    // TODO: Replace with actual API calls
    return {
      users: [],
      connections: []
    };
  }
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
}

function FriendsDiscoveryPage() {
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const { isCheckingOnboarding, needsOnboarding } = useOnboardingRedirect();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSpotifySuccess, setShowSpotifySuccess] = useState(false);
  const [showSpotifyError, setShowSpotifyError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      setShowSpotifySuccess(true);
      window.history.replaceState({}, '', '/discover');
      setTimeout(() => setShowSpotifySuccess(false), 5000);
    } else if (params.get('spotify') === 'error') {
      setShowSpotifyError(true);
      window.history.replaceState({}, '', '/discover');
      setTimeout(() => setShowSpotifyError(false), 5000);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isFromSpotifyCallback = params.get('spotify') === 'connected' || params.get('spotify') === 'error';
    const hasJustAuthenticated = window.location.search.includes('code=') || window.location.search.includes('state=');

    if (!authLoading && !isAuthenticated && !isFromSpotifyCallback && !hasJustAuthenticated) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  {/* USER PROFILE & CONNECTIONS STATE */}
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<Array<UserProfile>>([
    {
      id: '1',
      username: 'jazzlover92',
      displayName: 'Sarah Johnson',
      profilePhotoUrl: null,
      bio: 'Live music enthusiast 🎵 | Jazz & Blues | Concert photographer',
      topArtists: [
        { artist: { name: 'Miles Davis', imageUrl: null } },
        { artist: { name: 'John Coltrane', imageUrl: null } },
        { artist: { name: 'Billie Holiday', imageUrl: null } }
      ],
      connectionStatus: 'NONE',
      compatibilityScore: 87
    },
    {
      id: '2',
      username: 'indie_vibes',
      displayName: 'Alex Chen',
      profilePhotoUrl: null,
      bio: 'Indie rock collector | Vinyl addict | Festival goer',
      topArtists: [
        { artist: { name: 'Tame Impala', imageUrl: null } },
        { artist: { name: 'Arctic Monkeys', imageUrl: null } },
        { artist: { name: 'The Strokes', imageUrl: null } }
      ],
      connectionStatus: 'PENDING',
      isPendingFromThem: false,
      compatibilityScore: 72
    },
    {
      id: '3',
      username: 'electronic_soul',
      displayName: 'Marcus Williams',
      profilePhotoUrl: null,
      bio: 'Electronic music producer | House & Techno | Late night DJ',
      topArtists: [
        { artist: { name: 'Daft Punk', imageUrl: null } },
        { artist: { name: 'Disclosure', imageUrl: null } },
        { artist: { name: 'Four Tet', imageUrl: null } }
      ],
      connectionStatus: 'ACCEPTED',
      compatibilityScore: 65
    },
    {
      id: '4',
      username: 'rock_n_roll',
      displayName: null,
      profilePhotoUrl: null,
      bio: 'Classic rock forever 🎸',
      topArtists: [
        { artist: { name: 'Led Zeppelin', imageUrl: null } },
        { artist: { name: 'Pink Floyd', imageUrl: null } },
        { artist: { name: 'The Beatles', imageUrl: null } }
      ],
      connectionStatus: 'PENDING',
      isPendingFromThem: true,
      compatibilityScore: 58
    },
    {
      id: '5',
      username: 'folk_wanderer',
      displayName: 'Emma Davis',
      profilePhotoUrl: null,
      bio: 'Folk & acoustic | Coffee shop performances | Nature lover',
      topArtists: [
        { artist: { name: 'Bon Iver', imageUrl: null } },
        { artist: { name: 'Fleet Foxes', imageUrl: null } },
        { artist: { name: 'Iron & Wine', imageUrl: null } }
      ],
      connectionStatus: 'NONE',
      compatibilityScore: 81
    },
    {
      id: '6',
      username: 'hiphop_head',
      displayName: 'Jordan Taylor',
      profilePhotoUrl: null,
      bio: 'Hip-hop culture | Freestyle rapper | Beat maker',
      topArtists: [
        { artist: { name: 'Kendrick Lamar', imageUrl: null } },
        { artist: { name: 'J. Cole', imageUrl: null } },
        { artist: { name: 'Anderson .Paak', imageUrl: null } }
      ],
      connectionStatus: 'NONE',
      compatibilityScore: 45
    }
  ]);

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.displayName?.toLowerCase().includes(query) ||
      user.bio?.toLowerCase().includes(query)
    );
  });

  const handleConnect = (userId: string) => {
    // TODO: POST
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, connectionStatus: 'PENDING', isPendingFromThem: false }
        : u
    ));
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, connectionStatus: 'PENDING', isPendingFromThem: false });
    }
  };

  const handleAcceptConnection = (userId: string) => {
    // TODO: PATCH
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, connectionStatus: 'ACCEPTED', isPendingFromThem: false }
        : u
    ));
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, connectionStatus: 'ACCEPTED', isPendingFromThem: false });
    }
  };

  const handleCancelConnection = (userId: string) => {
    // TODO: DELETE
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, connectionStatus: 'NONE', isPendingFromThem: false }
        : u
    ));
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, connectionStatus: 'NONE', isPendingFromThem: false });
    }
  };

  /* LOADING STATE */
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
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <TypewriterText text="Discover Friends" delay={200} />
          </h1>
          <p className="text-gray-400">
            <TypewriterText text="Connect with people who share your music taste" delay={500} />
          </p>
        </div>

        {/* ALERTS */}
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

        {/* SEARCH */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 -z-1" />

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={20}
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, name, or interests..."
              className="
                w-full
                pl-12 pr-12 py-3
                bg-transparent
                text-white
                placeholder-gray-400
                rounded-xl
                focus:outline-none
              "
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-gray-300 hover:text-white
                  transition-colors
                "
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* USER LIST */}
        <DiscoveryList
          users={filteredUsers}
          onUserClick={setSelectedUser}
          onConnect={handleConnect}
          onAcceptConnection={handleAcceptConnection}
          onCancelConnection={handleCancelConnection}
        />

        {/* USER DETAIL MODAL */}
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