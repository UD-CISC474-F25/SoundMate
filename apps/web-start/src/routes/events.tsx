import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Plus } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { TypewriterText } from '../components/Animations';
import { EventList } from '../components/EventList/EventList';
import { CreateEventForm } from '../components/EventForm/CreateEventForm';
import { EditEventForm } from '../components/EventForm/EditEventForm';
import { EventModal } from '../components/EventList/EventModal';
import type { Event } from '../hooks/useEvents';

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-xl max-w-lg w-full relative border border-gray-700 shadow-lg">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/events')({
  component: EventsPage,
});

function EventsPage() {
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | 'going' | 'maybe'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  const {
    events,
    eventsLoading,
    currentUser,
    createForm,
    updateFormField,
    showCreateModal,
    showEditModal,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    submitCreateEvent,
    submitUpdateEvent,
    deleteEvent,
    rsvpToEvent,
    getUserRsvpStatus,
    isEventCreator,
    isCreating,
    isUpdating,
    isDeleting,
    isRsvping,
  } = useEvents();

  /* LOGIN ENFORCEMENT */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  /* FILTER EVENTS */
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    const status = getUserRsvpStatus(event);
    return filter === 'going' ? status === 'GOING' : status === 'MAYBE';
  });

  const displayedEvents = filteredEvents.slice(0, visibleCount);

  /* RSVP HANDLER */
  const handleRsvp = async (eventId: string, status: 'GOING' | 'MAYBE' | 'DECLINED') => {
    await rsvpToEvent(eventId, status);
  };

  /* DELETE HANDLER */
  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    await deleteEvent(eventId);
    setSelectedEvent(null);
  };

  /* LOADING STATE */
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
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <TypewriterText text="Events" delay={200} />
            </h1>
            <p className="text-gray-400">
              <TypewriterText text="Find concerts and music events near you" delay={500} />
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

        {/* FILTERS */}
        <div className="flex gap-3 mb-6">
          {['all', 'going', 'maybe'].map(btn => (
            <button
              key={btn}
              onClick={() => setFilter(btn as 'all' | 'going' | 'maybe')}
              className={`px-4 py-2 rounded-full font-medium transition-colors cursor-pointer capitalize ${
                filter === btn
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        {/* EVENT LIST */}
        {eventsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        ) : (
          <EventList
            events={displayedEvents}
            filteredEventsLength={filteredEvents.length}
            visibleCount={visibleCount}
            getUserRsvpStatus={getUserRsvpStatus}
            onSeeMore={() => setVisibleCount(v => v + 10)}
            onEventClick={setSelectedEvent}
          />
        )}

        {/* EVENT MODAL */}
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onDelete={handleDelete}
            onEdit={openEditModal}
            onRsvp={handleRsvp}
            isEventCreator={isEventCreator(selectedEvent)}
            isDeleting={isDeleting}
            isRsvping={isRsvping}
            getUserRsvpStatus={getUserRsvpStatus}
            getAttendeeCount={(event, status) => {
              if (!event.attendees) return 0;
              return event.attendees.filter((a: any) => a.status === status).length;
            }}
          />
        )}

        {/* CREATE EVENT MODAL */}
        {showCreateModal && (
          <CreateEventForm
            form={createForm}
            updateField={(field: string, value: string) => updateFormField(field as any, value as any)}
            onSubmit={submitCreateEvent}
            onCancel={closeCreateModal}
            isSaving={isCreating}
          />
        )}

        {/* EDIT EVENT MODAL */}
        {showEditModal && (
          <EditEventForm
            form={createForm}
            updateField={(field: string, value: string) => updateFormField(field as any, value as any)}
            onSubmit={submitUpdateEvent}
            onCancel={closeEditModal}
            isSaving={isUpdating}
          />
        )}
      </div>
    </div>
  );
}