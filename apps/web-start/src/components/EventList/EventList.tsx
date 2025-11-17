import { Clock, MapPin } from 'lucide-react';
import type { Event } from '../../hooks/useEvents';

interface EventListProps {
  events: Array<Event>;
  filteredEventsLength?: number;
  visibleCount?: number;
  filter?: 'all' | 'going' | 'maybe';
  editable?: boolean;

  getUserRsvpStatus?: (event: Event) => string | null;

  onEventClick?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onSeeMore?: () => void;
}

export function EventList({
  events,
  filteredEventsLength = 0,
  visibleCount = 0,
  filter = 'all',
  editable = false,
  getUserRsvpStatus,
  onEventClick,
  onEdit,
  onDelete,
  onSeeMore,
}: EventListProps) {
  const getAttendeeCount = (event: Event, status?: 'GOING' | 'MAYBE') => {
    if (!event.attendees) return 0;
    return !status
      ? event.attendees.filter((a: { status: string; }) => ['GOING', 'MAYBE'].includes(a.status)).length
      : event.attendees.filter((a: { status: string; }) => a.status === status).length;
  };

  if (events.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <p className="text-gray-400 mb-2">No events found</p>
        <p className="text-gray-500 text-sm">
          {filter !== 'all'
            ? 'Try changing your filter or create a new event!'
            : 'Create your first event to get started!'}
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4 mb-6">
        {events.map(event => {
          const userStatus = getUserRsvpStatus?.(event) ?? null;
          const goingCount = getAttendeeCount(event, 'GOING');

          return (
            <li
              key={event.id}
              className={`bg-gray-900 border border-gray-800 rounded-lg p-6 transition-colors ${
                onEventClick ? 'cursor-pointer hover:border-gray-700' : ''
              }`}
              onClick={() => onEventClick?.(event)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl text-white font-semibold truncate">
                      {event.title}
                    </h3>

                    {event.visibility === 'PRIVATE' && (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                        Private
                      </span>
                    )}
                  </div>

                  {/* Date + Location */}
                  <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-3">
                    {event.dateTime && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{new Date(event.dateTime).toLocaleString()}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Artist / music tag */}
                  <div className="flex items-center gap-3 text-sm">
                    {event.artist && (
                      <span className="text-gray-400">🎵 {event.artist.name}</span>
                    )}
                    {event.musicTag && (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs">
                        {event.musicTag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side (RSVP status or Edit/Delete) */}
                <div className="flex flex-col items-end gap-2">
                  {editable ? (
                    <div className="flex gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(event);
                        }}
                        className="text-white hover:text-gray-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(event);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <>
                      {userStatus && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            userStatus === 'GOING'
                              ? 'bg-green-500/20 text-green-400'
                              : userStatus === 'MAYBE'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {userStatus === 'GOING'
                            ? 'Going'
                            : userStatus === 'MAYBE'
                            ? 'Maybe'
                            : 'Invited'}
                        </span>
                      )}
                      <span className="text-gray-400 text-sm whitespace-nowrap">
                        {goingCount} attending
                      </span>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* See More Button */}
      {onSeeMore && visibleCount < (filteredEventsLength ?? 0) && (
        <button
          onClick={onSeeMore}
          className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          See More ({filteredEventsLength - visibleCount} more)
        </button>
      )}
    </>
  );
}
