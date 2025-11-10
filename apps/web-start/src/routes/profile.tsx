import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Avatar } from '../components/Avatar/Avatar';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  // Mock user data (replace later with Prisma fetch)
  const mockUser = {
    name: 'Music Lover',
    pronouns: 'they/them',
    school: 'University of Delaware',
    bio: 'Always looking for new music and concert buddies!',
    friendsCount: 8,
  };

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

  return (
    <div className="min-h-screen bg-black pt-20 px-6 text-gray-100">
      <div className="max-w-4xl mx-auto">

        {/* Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <Avatar size="large" name={mockUser.name} />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{mockUser.name}</h1>
              <p className="text-gray-400 mb-1">{mockUser.pronouns}</p>
              <p className="text-gray-400 mb-2">{mockUser.school}</p>
              <p className="text-gray-300">{mockUser.bio}</p>
              <p className="text-gray-400 mt-2">Friends: {mockUser.friendsCount}</p>
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
