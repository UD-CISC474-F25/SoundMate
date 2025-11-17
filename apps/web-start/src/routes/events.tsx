import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Clock, Edit, MapPin, Plus, Trash2, Users, X } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import type { Event } from '../hooks/useEvents';

export const Route = createFileRoute('/events')({
  component: EventsPage,
});

function EventsPage() {
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | 'going' | 'maybe'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  const eventsHook = useEvents();
  const {
    events,
    eventsLoading,
    currentUser,
    showCreateModal,
    showEditModal,
    createForm,
    updateFormField,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    submitCreateEvent,
    submitUpdateEvent,
    deleteEvent,
    rsvpToEvent,
    isEventCreator,
    getUserRsvpStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isRsvping,
  } = eventsHook;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;

    const userStatus = getUserRsvpStatus(event);
    if (filter === 'going') return userStatus === 'GOING';
    return userStatus === 'MAYBE';
  });

  const displayedEvents = filteredEvents.slice(0, visibleCount);

  const getAttendeeCount = (event: Event, status?: 'GOING' | 'MAYBE') => {
    if (!event.attendees) return 0;
    if (status) {
      return event.attendees.filter(a => a.status === status).length;
    }
    return event.attendees.filter(a => a.status === 'GOING' || a.status === 'MAYBE').length;
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const result = await deleteEvent(eventId);
      if (result.success) {
        setSelectedEvent(null);
      }
    }
  };

  const handleRsvp = async (eventId: string, status: 'GOING' | 'MAYBE' | 'DECLINED') => {
    const result = await rsvpToEvent(eventId, status);

    if (result.success && selectedEvent && currentUser) {
      const currentAttendees = selectedEvent.attendees ?? [];
      const existingIndex = currentAttendees.findIndex(a => a.userId === currentUser.id);

      const updatedAttendees = existingIndex >= 0
        ? currentAttendees.map(a => a.userId === currentUser.id ? { ...a, status } : a)
        : [
            ...currentAttendees,
            {
              userId: currentUser.id,
              status,
              user: {
                username: currentUser.name || '',
                displayName: currentUser.name || null,
                profilePhotoUrl: null,
              }
            }
          ];

      setSelectedEvent({
        ...selectedEvent,
        attendees: updatedAttendees
      });
    }
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
            onClick={openCreateModal}
            className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('going')}
            className={`px-4 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              filter === 'going'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Going
          </button>
          <button
            onClick={() => setFilter('maybe')}
            className={`px-4 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              filter === 'maybe'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Maybe
          </button>
        </div>

        {/* Loading State */}
        {eventsLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        )}

        {/* Events List */}
        {!eventsLoading && displayedEvents.length === 0 ? (
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
                const userStatus = getUserRsvpStatus(event);
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
                className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium cursor-pointer"
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
                  <div className="flex gap-2">
                    {isEventCreator(selectedEvent) && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedEvent(null);
                            openEditModal(selectedEvent);
                          }}
                          className="text-gray-400 hover:text-white flex-shrink-0 cursor-pointer"
                          title="Edit event"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(selectedEvent.id)}
                          disabled={isDeleting}
                          className="text-gray-400 hover:text-red-400 flex-shrink-0 cursor-pointer disabled:opacity-50"
                          title="Delete event"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-400 hover:text-white flex-shrink-0 cursor-pointer"
                    >
                      <X size={24} />
                    </button>
                  </div>
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
                    onClick={() => handleRsvp(selectedEvent.id, 'GOING')}
                    disabled={isRsvping}
                    className={`py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                      getUserRsvpStatus(selectedEvent) === 'GOING'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Going
                  </button>
                  <button
                    onClick={() => handleRsvp(selectedEvent.id, 'MAYBE')}
                    disabled={isRsvping}
                    className={`py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                      getUserRsvpStatus(selectedEvent) === 'MAYBE'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Maybe
                  </button>
                  <button
                    onClick={() => handleRsvp(selectedEvent.id, 'DECLINED')}
                    disabled={isRsvping}
                    className={`py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                      getUserRsvpStatus(selectedEvent) === 'DECLINED'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Can't Go
                  </button>
                </div>

                <button className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium cursor-pointer">
                  See Comments ({selectedEvent._count.comments})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Event Modal */}
        {(showCreateModal || showEditModal) && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => showCreateModal ? closeCreateModal() : closeEditModal()}
          >
            <div
              className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {showEditModal ? 'Edit Event' : 'Create Event'}
                  </h2>
                  <button
                    onClick={() => showCreateModal ? closeCreateModal() : closeEditModal()}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form className="space-y-4" onSubmit={showEditModal ? submitUpdateEvent : submitCreateEvent}>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={createForm.title}
                      onChange={(e) => updateFormField('title', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      placeholder="Event name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Location</label>
                    <input
                      type="text"
                      value={createForm.location}
                      onChange={(e) => updateFormField('location', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      placeholder="Venue or address"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={createForm.dateTime}
                      onChange={(e) => updateFormField('dateTime', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={createForm.description}
                      onChange={(e) => updateFormField('description', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600 resize-none"
                      placeholder="Tell people what to expect..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Music Tag</label>
                    <input
                      type="text"
                      value={createForm.musicTag}
                      onChange={(e) => updateFormField('musicTag', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                      placeholder="e.g., Jazz, Rock, Electronic"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Visibility</label>
                      <select
                        value={createForm.visibility}
                        onChange={(e) => updateFormField('visibility', e.target.value as 'PUBLIC' | 'PRIVATE')}
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
                        value={createForm.maxAttendees}
                        onChange={(e) => updateFormField('maxAttendees', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => showCreateModal ? closeCreateModal() : closeEditModal()}
                      className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || isUpdating}
                      className="flex-1 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating || isUpdating ? 'Saving...' : (showEditModal ? 'Update Event' : 'Create Event')}
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
