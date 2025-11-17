import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Plus } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import type { Event } from '../hooks/useEvents';

import { EventList } from '../components/EventList/EventList';
import { CreateEventForm } from '../components/EventForm/CreateEventForm';
import { EditEventForm } from '../components/EventForm/EditEventForm';


function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-lg relative border border-gray-700">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function EventModal({
  event,
  onClose,
  onDelete,
  onEdit,
  onRsvp,
  getUserRsvpStatus,
  isEventCreator,
}: any) {
  const status = getUserRsvpStatus(event);

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-bold text-white mb-4">{event.title}</h2>

      <p className="text-gray-400 mb-2">{event.location}</p>
      <p className="text-gray-400 mb-6">
        {new Date(event.dateTime).toLocaleString()}
      </p>

      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded bg-green-600 text-white`}
          onClick={() => onRsvp(event.id, 'GOING')}
        >
          Going
        </button>
        <button
          className={`px-4 py-2 rounded bg-yellow-600 text-white`}
          onClick={() => onRsvp(event.id, 'MAYBE')}
        >
          Maybe
        </button>
        <button
          className={`px-4 py-2 rounded bg-gray-700 text-white`}
          onClick={() => onRsvp(event.id, 'DECLINED')}
        >
          Decline
        </button>
      </div>

      {isEventCreator && (
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={() => onEdit(event)}
          >
            Edit
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white"
            onClick={() => onDelete(event.id)}
          >
            Delete
          </button>
        </div>
      )}
    </Modal>
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
  const handleRsvp = async (eventId: string, status: any) => {
    await rsvpToEvent(eventId, status);
  };

  /* DELETE HANDLER */
  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
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
            <h1 className="text-4xl font-bold text-white mb-2">Events</h1>
            <p className="text-gray-400">Find concerts and music events near you</p>
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
              onClick={() => setFilter(btn as any)}
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
            getUserRsvpStatus={getUserRsvpStatus}
          />
        )}

        {/* CREATE EVENT MODAL */}
        {showCreateModal && (
          <Modal onClose={closeCreateModal}>
            <CreateEventForm
                form={createForm}
                updateField={updateFormField as unknown as (field: string, value: string) => void}
                onSubmit={submitCreateEvent}
                onCancel={closeCreateModal}
                isSaving={isCreating}
              />
          </Modal>
        )}

        {/* EDIT EVENT MODAL */}
        {showEditModal && (
          <Modal onClose={closeEditModal}>
            <EditEventForm
              form={createForm}
              updateField={updateFormField as unknown as (field: string, value: string) => void}
              onSubmit={submitUpdateEvent}
              onCancel={closeEditModal}
              isSaving={isUpdating}
            />
          </Modal>
        )}
      </div>
    </div>
  );
}
