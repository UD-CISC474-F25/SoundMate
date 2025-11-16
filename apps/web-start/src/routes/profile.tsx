import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Avatar } from '../components/Avatar/Avatar';
import { useApiQuery } from '../integrations/api';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

type User = {
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
};

function ProfilePage() {
  // Fetch real user data from /users/me endpoint
  const { data: user, isLoading, isError } = useApiQuery<User>(
    ['users', 'me'],
    '/users/me'
  );

  const mockTopArtists = [
    { id: 1, name: 'Tame Impala', imageUrl: '/artist1.jpg' },
    { id: 2, name: 'Phoebe Bridgers', imageUrl: '/artist2.jpg' },
    { id: 3, name: 'The Weeknd', imageUrl: '/artist3.jpg' },
  ];

  const mockCreatedEvents = [
    { id: 1, title: 'Indie Night at The Queen', date: 'Nov 22, 2025', location: 'Wilmington, DE' },
    { id: 2, title: 'Open Mic Friday', date: 'Dec 6, 2025', location: 'Newark, DE' },
  ];

  const mockAttendingEvents = [
    { id: 3, title: 'Jazz at Rodney Square', date: 'Nov 28, 2025', location: 'Wilmington, DE' },
  ];

  const [activeTab, setActiveTab] = useState('created');

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 px-6 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !user) {
    return (
      <div className="min-h-screen bg-black pt-20 px-6 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-6 text-gray-100">
      <div className="max-w-4xl mx-auto">

        {/* Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <Avatar
              size="large"
              name={user.displayName || user.username || 'User'}
              src={user.profilePhotoUrl}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">
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
            <button className="px-4 py-2 border-2 border-gray-600 text-gray-300 rounded hover:bg-gray-800 hover:text-white transition-colors font-medium">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Music Info Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Top Artists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mockTopArtists.map((artist) => (
              <div key={artist.id} className="text-center">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                />
                <p>{artist.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Your Events</h2>
          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded ${activeTab === 'created' ? 'bg-gray-700' : 'bg-gray-800'}`}
              onClick={() => setActiveTab('created')}
            >
              Created
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'attending' ? 'bg-gray-700' : 'bg-gray-800'}`}
              onClick={() => setActiveTab('attending')}
            >
              Attending
            </button>
          </div>

          {activeTab === 'created' && (
            <EventList events={mockCreatedEvents} editable />
          )}
          {activeTab === 'attending' && (
            <EventList events={mockAttendingEvents} />
          )}
        </div>
      </div>
    </div>
  );
}

// Temporary EventList for Displaying  Mockup Events
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

function EventList({ events, editable = false }: EventListProps) {
  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="border border-gray-800 p-4 rounded-lg bg-gray-950">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-white">{event.title}</h3>
              <p className="text-gray-400">{event.date}</p>
              <p className="text-gray-500 text-sm">{event.location}</p>
            </div>
            {editable && (
              <div className="flex gap-8">
                <button className="text-blue-400 hover:text-blue-300">Edit</button>
                <button className="text-red-400 hover:text-red-300">Delete</button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
