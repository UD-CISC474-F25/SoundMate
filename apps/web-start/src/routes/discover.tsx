import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Check, Clock, Music, Search, UserCheck, UserPlus, X } from 'lucide-react';
import { useOnboardingRedirect } from '../hooks/useOnboardingRedirect';

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
    if (!authLoading && !isAuthenticated) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);
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
    // TODO: POST to /api/connections
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, connectionStatus: 'PENDING', isPendingFromThem: false }
        : u
    ));
  };

  const handleAcceptConnection = (userId: string) => {
    // TODO: PATCH to /api/connections/:id/accept
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, connectionStatus: 'ACCEPTED', isPendingFromThem: false }
        : u
    ));
  };

  const handleCancelConnection = (userId: string) => {
    // TODO: DELETE to /api/connections/:id
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, connectionStatus: 'NONE', isPendingFromThem: false }
        : u
    ));
  };

  const getConnectionButton = (user: UserProfile) => {
    if (user.connectionStatus === 'ACCEPTED') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
          <UserCheck size={16} />
          <span>Friends</span>
        </div>
      );
    }

    if (user.connectionStatus === 'PENDING' && user.isPendingFromThem) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAcceptConnection(user.id);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Check size={16} />
          <span>Accept</span>
        </button>
      );
    }

    if (user.connectionStatus === 'PENDING') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCancelConnection(user.id);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          <Clock size={16} />
          <span>Pending</span>
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleConnect(user.id);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg text-sm font-medium transition-colors"
      >
        <UserPlus size={16} />
        <span>Connect</span>
      </button>
    );
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
    <div className="min-h-screen bg-black pt-28 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Friends</h1>
          <p className="text-gray-400">
            Connect with people who share your music taste
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, name, or interests..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-2">No users found</p>
              <p className="text-gray-500 text-sm">
                Try a different search term
              </p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {(user.displayName || user.username).charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold truncate">
                        {user.displayName || user.username}
                      </h3>
                      {user.compatibilityScore && user.compatibilityScore > 70 && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium flex-shrink-0">
                          {user.compatibilityScore}% match
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-1">@{user.username}</p>
                    {user.bio && (
                      <p className="text-gray-500 text-sm truncate">{user.bio}</p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {getConnectionButton(user)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>


        {selectedUser && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedUser(null)}
          >
            <div 
              className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                      {(selectedUser.displayName || selectedUser.username).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {selectedUser.displayName || selectedUser.username}
                      </h2>
                      <p className="text-gray-400">@{selectedUser.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                {selectedUser.compatibilityScore && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-400 text-sm font-medium">Music Compatibility</span>
                      <span className="text-purple-400 text-2xl font-bold">{selectedUser.compatibilityScore}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${selectedUser.compatibilityScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {selectedUser.bio && (
                  <div className="mb-6">
                    <p className="text-gray-300 leading-relaxed">{selectedUser.bio}</p>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-3">
                    <Music size={18} />
                    <span className="text-sm font-medium">Top Artists</span>
                  </div>
                  <div className="space-y-2">
                    {selectedUser.topArtists.slice(0, 5).map((topArtist, idx) => (
                      <div 
                        key={idx}
                        className="bg-gray-800 rounded-lg p-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {topArtist.artist.name.charAt(0)}
                        </div>
                        <span className="text-white">{topArtist.artist.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedUser.connectionStatus === 'ACCEPTED' ? (
                    <button className="flex-1 py-3 bg-green-500/20 text-green-400 rounded-lg font-medium flex items-center justify-center gap-2">
                      <UserCheck size={20} />
                      <span>Friends</span>
                    </button>
                  ) : selectedUser.connectionStatus === 'PENDING' && selectedUser.isPendingFromThem ? (
                    <>
                      <button 
                        onClick={() => {
                          handleAcceptConnection(selectedUser.id);
                          setSelectedUser({ ...selectedUser, connectionStatus: 'ACCEPTED', isPendingFromThem: false });
                        }}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={20} />
                        <span>Accept Request</span>
                      </button>
                      <button 
                        onClick={() => {
                          handleCancelConnection(selectedUser.id);
                          setSelectedUser({ ...selectedUser, connectionStatus: 'NONE', isPendingFromThem: false });
                        }}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  ) : selectedUser.connectionStatus === 'PENDING' ? (
                    <button 
                      onClick={() => {
                        handleCancelConnection(selectedUser.id);
                        setSelectedUser({ ...selectedUser, connectionStatus: 'NONE' });
                      }}
                      className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock size={20} />
                      <span>Cancel Request</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        handleConnect(selectedUser.id);
                        setSelectedUser({ ...selectedUser, connectionStatus: 'PENDING', isPendingFromThem: false });
                      }}
                      className="flex-1 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <UserPlus size={20} />
                      <span>Send Friend Request</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}