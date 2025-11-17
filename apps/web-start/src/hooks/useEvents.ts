import { useState } from 'react';
import { useApiQuery, useApiMutation, useCurrentUser } from '../integrations/api';

export interface Event {
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
  attendees?: Array<{
    userId: string;
    status: 'INVITED' | 'GOING' | 'MAYBE' | 'DECLINED';
    user: {
      username: string;
      displayName: string | null;
      profilePhotoUrl: string | null;
    };
  }>;
  _count: {
    attendees: any;
    comments: number;
  };
}

interface EventFormData {
  title: string;
  description: string;
  dateTime: string;
  location: string;
  musicTag: string;
  artistId: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  maxAttendees: string;
}

export function useEvents() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [createForm, setCreateForm] = useState<EventFormData>({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    musicTag: '',
    artistId: '',
    visibility: 'PUBLIC',
    maxAttendees: '',
  });

  const { data: currentUser } = useCurrentUser();

  // Fetch events
  const {
    data: events = [],
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useApiQuery<Event[]>(['events'], '/events');

  // Create event mutation
  const createEventMutation = useApiMutation({
    path: '/events',
    method: 'POST',
    invalidateKeys: [['events']],
  });

  // Update event mutation
  const updateEventMutation = useApiMutation({
    endpoint: (vars: any) => ({ path: `/events/${vars.id}`, method: 'PATCH' }),
    invalidateKeys: [['events']],
  });

  // Delete event mutation
  const deleteEventMutation = useApiMutation({
    endpoint: (vars: { id: string }) => ({
      path: `/events/${vars.id}`,
      method: 'DELETE',
    }),
    invalidateKeys: [['events']],
  });

  // RSVP mutation
  const rsvpMutation = useApiMutation({
    endpoint: (vars: { eventId: string; status: string }) => ({
      path: `/events/${vars.eventId}/rsvp`,
      method: 'POST',
    }),
    invalidateKeys: [['events']],
  });

  // Modal handlers
  const openCreateModal = () => {
    setCreateForm({
      title: '',
      description: '',
      dateTime: '',
      location: '',
      musicTag: '',
      artistId: '',
      visibility: 'PUBLIC',
      maxAttendees: '',
    });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setCreateForm({
      title: event.title,
      description: event.description || '',
      dateTime: event.dateTime || '',
      location: event.location || '',
      musicTag: event.musicTag || '',
      artistId: event.artist?.id || '',
      visibility: event.visibility,
      maxAttendees: event.maxAttendees?.toString() || '',
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEvent(null);
  };

  // Form handlers
  const updateFormField = <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K]
  ) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  // Submit handlers
  const submitCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: createForm.title,
        description: createForm.description || null,
        location: createForm.location || null,
        musicTag: createForm.musicTag || null,
        artistId: createForm.artistId || null,
        visibility: createForm.visibility,
        maxAttendees: createForm.maxAttendees ? Number(createForm.maxAttendees) : null,
      };

      // Combine date and time if provided
      if (createForm.dateTime) {
        payload.dateTime = new Date(createForm.dateTime).toISOString();
      }

      await createEventMutation.mutateAsync(payload);
      closeCreateModal();
      return { success: true };
    } catch (error) {
      console.error('Failed to create event:', error);
      return { success: false, error };
    }
  };

  const submitUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return { success: false };

    try {
      const payload: any = {
        id: editingEvent.id,
        title: createForm.title,
        description: createForm.description || null,
        location: createForm.location || null,
        musicTag: createForm.musicTag || null,
        artistId: createForm.artistId || null,
        visibility: createForm.visibility,
        maxAttendees: createForm.maxAttendees ? Number(createForm.maxAttendees) : null,
      };

      if (createForm.dateTime) {
        payload.dateTime = new Date(createForm.dateTime).toISOString();
      }

      await updateEventMutation.mutateAsync(payload);
      closeEditModal();
      return { success: true };
    } catch (error) {
      console.error('Failed to update event:', error);
      return { success: false, error };
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync({ id: eventId });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete event:', error);
      return { success: false, error };
    }
  };

  const rsvpToEvent = async (eventId: string, status: 'GOING' | 'MAYBE' | 'DECLINED') => {
    try {
      await rsvpMutation.mutateAsync({ eventId, status });
      return { success: true };
    } catch (error) {
      console.error('Failed to RSVP:', error);
      return { success: false, error };
    }
  };

  // Helper functions
  const isEventCreator = (event: Event) => {
    return event.creator.id === currentUser?.id;
  };

  const getUserRsvpStatus = (event: Event) => {
    if (!currentUser || !event.attendees) return null;
    const attendance = event.attendees.find((a) => a.userId === currentUser.id);
    return attendance?.status || null;
  };

  return {
    // Data
    events,
    eventsLoading,
    currentUser,

    // Modals
    showCreateModal,
    showEditModal,
    editingEvent,

    // Form
    createForm,
    updateFormField,

    // Actions
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    submitCreateEvent,
    submitUpdateEvent,
    deleteEvent,
    rsvpToEvent,
    refetchEvents,

    // Helpers
    isEventCreator,
    getUserRsvpStatus,

    // Loading states
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    isRsvping: rsvpMutation.isPending,
  };
}
