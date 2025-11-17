import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Calendar, Clock, Link as LinkIcon, MapPin, Plus, Users, X } from 'lucide-react';

export const Route = createFileRoute('/events')({
  component: EventsPage,
  loader: async () => {
    // TODO: Replace with actual API call!
    return {
      events: [], // Will be populated from API
      currentUser: null
    };
  }
});

interface Event {
  id: string;
  title: string;
  description: string | null;
  dateTime: string | null;
  location: string | null;
  musicTag: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  maxAttendees: number | null;
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    profilePhotoUrl: string | null;
  };
  artist: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
  attendees: Array<{
    userId: string;
    status: 'INVITED' | 'GOING' | 'MAYBE' | 'DECLINED';
    user: {
      username: string;
      displayName: string | null;
      profilePhotoUrl: string | null;
    };
  }>;
  _count: {
    comments: number;
  };
}

function EventsPage() {
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'going' | 'maybe'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);
  const [events, setEvents] = useState<Array<Event>>([
  // Mock data for development - remove when API is ready - Generated with AI
  {
    id: '1',
    title: 'Summer Jazz Festival',
    description: 'Join us for an evening of smooth jazz featuring local and international artists.',
    dateTime: '2025-11-15T19:00:00Z',
    location: 'Central Park Amphitheater',
    musicTag: 'Jazz',
    visibility: 'PUBLIC',
    maxAttendees: 500,
    creator: {
      id: 'user1',
      username: 'jazzlover',
      displayName: 'Jazz Lover',
      profilePhotoUrl: null
    },
    artist: {
      id: 'artist1',
      name: 'Miles Davis Tribute Band',
      imageUrl: null
    },
    attendees: [
      {
        userId: 'user2',
        status: 'GOING',
        user: { username: 'user2', displayName: 'User Two', profilePhotoUrl: null }
      },
      {
        userId: 'user3',
        status: 'GOING',
        user: { username: 'user3', displayName: 'User Three', profilePhotoUrl: null }
      }
    ],
    _count: { comments: 5 }
  },
  {
    id: '2',
    title: 'Indie Nights Vol. 3',
    description: 'An intimate showcase of rising indie artists in a cozy underground venue.',
    dateTime: '2025-12-02T20:30:00Z',
    location: 'The Echo Lounge',
    musicTag: 'Indie',
    visibility: 'PUBLIC',
    maxAttendees: 200,
    creator: {
      id: 'user4',
      username: 'soundcurator',
      displayName: 'Sound Curator',
      profilePhotoUrl: null
    },
    artist: {
      id: 'artist2',
      name: 'The Velvet Waves',
      imageUrl: null
    },
    attendees: [
      {
        userId: 'user5',
        status: 'GOING',
        user: { username: 'user5', displayName: 'Jamie Vibes', profilePhotoUrl: null }
      }
    ],
    _count: { comments: 2 }
  },
  {
    id: '3',
    title: 'Techno Under the Stars',
    description: 'A late-night open-air rave with immersive visuals and world-class DJs.',
    dateTime: '2025-11-22T23:00:00Z',
    location: 'Riverside Warehouse',
    musicTag: 'Electronic',
    visibility: 'PUBLIC',
    maxAttendees: 1000,
    creator: {
      id: 'user6',
      username: 'nightpulse',
      displayName: 'Night Pulse',
      profilePhotoUrl: null
    },
    artist: {
      id: 'artist3',
      name: 'DJ Aurora',
      imageUrl: null
    },
    attendees: [
      {
        userId: 'user7',
        status: 'DECLINED',
        user: { username: 'user7', displayName: 'Skylar Moon', profilePhotoUrl: null }
      },
      {
        userId: 'user8',
        status: 'GOING',
        user: { username: 'user8', displayName: 'Leo Beats', profilePhotoUrl: null }
      }
    ],
    _count: { comments: 8 }
  },
  {
    id: '4',
    title: 'Acoustic Sunday Brunch',
    description: 'Relax with mellow acoustic sets and locally roasted coffee at this weekly meetup.',
    dateTime: '2025-11-17T11:00:00Z',
    location: 'Maple & Main Café',
    musicTag: 'Acoustic',
    visibility: 'PUBLIC',
    maxAttendees: 80,
    creator: {
      id: 'user9',
      username: 'brunchvibes',
      displayName: 'Brunch Vibes',
      profilePhotoUrl: null
    },
    artist: {
      id: 'artist4',
      name: 'Luna Rae',
      imageUrl: null
    },
    attendees: [
      {
        userId: 'user10',
        status: 'GOING',
        user: { username: 'user10', displayName: 'Cass Melody', profilePhotoUrl: null }
      },
      {
        userId: 'user11',
        status: 'GOING',
        user: { username: 'user10', displayName: 'Melody Cass', profilePhotoUrl: null }
      }
    ],
    _count: { comments: 1 }
  }
]);


  // Assume current user ID for filtering
  const currentUserId = 'current-user-id'; // TODO: Get from auth context

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    
    const userAttendance = event.attendees.find(a => a.userId === currentUserId);
    if (filter === 'going') return userAttendance?.status === 'GOING';
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (filter === 'maybe') return userAttendance?.status === 'MAYBE';
    return true;
  });

  const displayedEvents = filteredEvents.slice(0, visibleCount);

  const getUserStatus = (event: Event) => {
    const attendance = event.attendees.find(a => a.userId === currentUserId);
    return attendance?.status;
  };

  const getAttendeeCount = (event: Event, status?: 'GOING' | 'MAYBE') => {
    if (status) {
      return event.attendees.filter(a => a.status === status).length;
    }
    return event.attendees.filter(a => a.status === 'GOING' || a.status === 'MAYBE').length;
  };

  if (authLoading || !isAuthenticated) {
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Events</h1>
            <p className="text-gray-400">
              Find concerts and music events near you
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('going')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filter === 'going' 
                ? 'bg-white text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Going
          </button>
          <button
            onClick={() => setFilter('maybe')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filter === 'maybe' 
                ? 'bg-white text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Maybe
          </button>
        </div>

        {/* Events List */}
        {displayedEvents.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-2">No events found</p>
            <p className="text-gray-500 text-sm">
              {filter !== 'all' 
                ? 'Try changing your filter or create a new event!' 
                : 'Create your first event to get started!'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {displayedEvents.map(event => {
                const userStatus = getUserStatus(event);
                const goingCount = getAttendeeCount(event, 'GOING');
                
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-white truncate">{event.title}</h3>
                          {event.visibility === 'PRIVATE' && (
                            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                              Private
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-2">
                          {event.dateTime && (
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="flex-shrink-0" />
                              <span>{new Date(event.dateTime).toLocaleString()}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          {event.artist && (
                            <span className="text-gray-400">
                              🎵 {event.artist.name}
                            </span>
                          )}
                          {event.musicTag && (
                            <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs">
                              {event.musicTag}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {userStatus && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            userStatus === 'GOING' 
                              ? 'bg-green-500/20 text-green-400' 
                              : userStatus === 'MAYBE'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {userStatus === 'GOING' ? 'Going' : userStatus === 'MAYBE' ? 'Maybe' : 'Invited'}
                          </span>
                        )}
                        <span className="text-gray-400 text-sm whitespace-nowrap">
                          {goingCount} attending
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* See More Button */}
            {visibleCount < filteredEvents.length && (
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                See More ({filteredEvents.length - visibleCount} more)
              </button>
            )}
          </>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedEvent(null)}
          >
            <div 
              className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                    <p className="text-gray-400 text-sm">
                      by @{selectedEvent.creator.displayName || selectedEvent.creator.username}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-white flex-shrink-0"
                  >
                    <X size={24} />
                  </button>
                </div>

                {selectedEvent.description && (
                  <p className="text-gray-300 mb-6 leading-relaxed">{selectedEvent.description}</p>
                )}

                {/* Artist Info */}
                {selectedEvent.artist && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-gray-400 text-xs mb-1">Featured Artist</p>
                    <p className="text-white font-medium">🎵 {selectedEvent.artist.name}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {selectedEvent.location && (
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <MapPin size={16} />
                        <span className="text-xs">Location</span>
                      </div>
                      <p className="text-white text-sm">{selectedEvent.location}</p>
                    </div>
                  )}
                  {selectedEvent.dateTime && (
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Clock size={16} />
                        <span className="text-xs">Time</span>
                      </div>
                      <p className="text-white text-sm">{new Date(selectedEvent.dateTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Users size={16} />
                    <span className="text-xs">Attendees</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">
                      {getAttendeeCount(selectedEvent, 'GOING')} going
                    </span>
                    <span className="text-yellow-400">
                      {getAttendeeCount(selectedEvent, 'MAYBE')} maybe
                    </span>
                  </div>
                  {selectedEvent.maxAttendees && (
                    <p className="text-gray-500 text-xs mt-1">
                      Max capacity: {selectedEvent.maxAttendees}
                    </p>
                  )}
                </div>

                {selectedEvent.musicTag && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                        {selectedEvent.musicTag}
                      </span>
                    </div>
                  </div>
                )}

                {/* RSVP Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button 
                    className={`py-2 rounded-lg font-medium transition-colors ${
                      getUserStatus(selectedEvent) === 'GOING'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Going
                  </button>
                  <button 
                    className={`py-2 rounded-lg font-medium transition-colors ${
                      getUserStatus(selectedEvent) === 'MAYBE'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Maybe
                  </button>
                  <button 
                    className={`py-2 rounded-lg font-medium transition-colors ${
                      getUserStatus(selectedEvent) === 'DECLINED'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Can't Go
                  </button>
                </div>

                <button className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
                  See Comments ({selectedEvent._count.comments})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <div 
              className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Create Event</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: Handle form submission
                  // POST to /api/events with form data
                  console.log('Create event');
                  setShowCreateModal(false);
                }}>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      placeholder="Event name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Artist (optional)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      placeholder="Search for an artist..."
                    />
                    <p className="text-gray-500 text-xs mt-1">Link to an artist from your library</p>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Location</label>
                    <input
                      type="text"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      placeholder="Venue or address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Date</label>
                      <input
                        type="date"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Time</label>
                      <input
                        type="time"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Description</label>
                    <textarea
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600 resize-none"
                      placeholder="Tell people what to expect..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Music Tag</label>
                    <input
                      type="text"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      placeholder="e.g., Jazz, Rock, Electronic"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Visibility</label>
                      <select 
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      >
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Max Attendees</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Create Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}