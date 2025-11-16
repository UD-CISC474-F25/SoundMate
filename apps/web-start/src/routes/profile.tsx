import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Avatar } from '../components/Avatar/Avatar';
import { useApiQuery, useApiMutation, useApiClient } from '../integrations/api';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

type TopArtist = {
  id: string;
  spotifyArtistId: string;
  name: string;
  genres: string[];
  imageUrl?: string | null;
  rank: number;
  timeRange: string;
};

type UserProfile = {
  id: string;
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  spotifyProfileUrl?: string | null;
  showSpotifyProfile?: boolean;
  isOnboarded?: boolean;
  createdAt?: string;
  topArtists: TopArtist[];
};

type EventItem = {
  id: number;
  title: string;
  date: string;
  location: string;
};

type EventListProps = {
  events: Array<EventItem>;
  editable?: boolean;
};

function SuccessMessage() {
  return (
    <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 mb-6 flex items-center gap-3">
      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <div>
        <p className="text-green-100 font-semibold">Spotify Connected Successfully!</p>
        <p className="text-green-200 text-sm">Your top artists have been synced.</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-black pt-28 px-6 text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Loading profile...</p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-black pt-28 px-6 text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">Failed to load profile</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-black rounded-full hover:scale-105 transition-all shadow-lg"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function ArtistCard({ artist }: { artist: TopArtist }) {
  return (
    <div className="text-center">
      <img
        src={artist.imageUrl || '/placeholder-artist.jpg'}
        alt={artist.name}
        className="w-24 h-24 rounded-full mx-auto mb-2 object-cover bg-gray-800"
      />
      <p className="font-medium text-white">{artist.name}</p>
      <p className="text-xs text-gray-400">
        {artist.genres.slice(0, 2).join(', ')}
      </p>
    </div>
  );
}

function EventList({ events, editable = false }: EventListProps) {
  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="bg-white/5 border border-white/20 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-white">{event.title}</h3>
              <p className="text-gray-400">{event.date}</p>
              <p className="text-gray-500 text-sm">{event.location}</p>
            </div>
            {editable && (
              <div className="flex gap-8">
                <button className="text-white hover:text-gray-300">Edit</button>
                <button className="text-red-400 hover:text-red-300">Delete</button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

type TimeRange = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';

const TIME_RANGE_INFO: Record<TimeRange, { label: string; description: string }> = {
  SHORT_TERM: { label: 'Last 4 Weeks', description: 'Your most recent listening habits' },
  MEDIUM_TERM: { label: 'Last 6 Months', description: 'Your listening trends over half a year' },
  LONG_TERM: { label: 'All Time', description: 'Your favorite artists over several years' },
};

function ProfilePage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('created');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('SHORT_TERM');
  const { request } = useApiClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      setShowSuccessMessage(true);
      window.history.replaceState({}, '', '/profile');
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

  const { data: user, isLoading, isError } = useApiQuery<UserProfile>(
    ['users', 'me', 'profile', selectedTimeRange],
    `/users/me/profile?timeRange=${selectedTimeRange}`
  );

  const handleConnectSpotify = async () => {
    try {
      const data = await request<{ authUrl: string }>('/auth/spotify/auth-url');
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to get Spotify auth URL:', error);
    }
  };


  const mockCreatedEvents = [
    { id: 1, title: 'Indie Night at The Queen', date: 'Nov 22, 2025', location: 'Wilmington, DE' },
    { id: 2, title: 'Open Mic Friday', date: 'Dec 6, 2025', location: 'Newark, DE' },
  ];

  const mockAttendingEvents = [
    { id: 3, title: 'Jazz at Rodney Square', date: 'Nov 28, 2025', location: 'Wilmington, DE' },
  ];

  if (isLoading) return <LoadingState />;
  if (isError || !user) return <ErrorState />;

  return (
    <div className="min-h-screen bg-black pt-28 px-6 text-gray-100">
      <div className="max-w-4xl mx-auto">
        {showSuccessMessage && <SuccessMessage />}

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <Avatar
              size="large"
              name={user.displayName || user.username || 'User'}
              imageSrc={user.profilePhotoUrl || undefined}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1 text-white">
                {user.displayName || user.username || 'Anonymous User'}
              </h1>
              <p className="text-gray-400 mb-1">@{user.username || 'username'}</p>
              {user.email && (
                <p className="text-gray-400 mb-2">{user.email}</p>
              )}
              <p className="text-gray-300">{user.bio || 'No bio yet'}</p>
              {user.spotifyProfileUrl && user.showSpotifyProfile && (
                <a
                  href={user.spotifyProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-green-400 hover:text-green-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  View Spotify Profile
                </a>
              )}
            </div>
            <button className="px-4 py-2 border-2 border-white/40 text-white rounded-full hover:bg-white/10 hover:border-white/60 transition-all font-medium">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Top Artists</h2>

          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              {(Object.keys(TIME_RANGE_INFO) as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTimeRange === range
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {TIME_RANGE_INFO[range].label}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              {TIME_RANGE_INFO[selectedTimeRange].description}
            </p>
          </div>

          {user.topArtists && user.topArtists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {user.topArtists.slice(0, 6).map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                No top artists synced yet. Connect your Spotify account to see your favorite artists!
              </p>
              <button
                onClick={handleConnectSpotify}
                className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all shadow-lg"
              >
                Connect Spotify
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Your Events</h2>
          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === 'created'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('created')}
            >
              Created
            </button>
            <button
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === 'attending'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('attending')}
            >
              Attending
            </button>
          </div>

          {activeTab === 'created' && <EventList events={mockCreatedEvents} editable />}
          {activeTab === 'attending' && <EventList events={mockAttendingEvents} />}
        </div>
      </div>
    </div>
  );
}
