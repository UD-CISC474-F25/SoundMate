import React from 'react';
import { Clock, Edit, MapPin, Trash2, Users, X } from 'lucide-react';
import type { Event } from '../../hooks/useEvents';

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onDelete: (eventId: string) => Promise<void>;
  onEdit: (event: Event) => void;
  onRsvp: (eventId: string, status: 'GOING' | 'MAYBE' | 'DECLINED') => void;
  isEventCreator: boolean;
  isDeleting: boolean;
  isRsvping: boolean;
  getUserRsvpStatus: (event: Event) => 'GOING' | 'MAYBE' | 'DECLINED' | 'INVITED' | null;
  getAttendeeCount: (event: Event, status: 'GOING' | 'MAYBE') => number;
}

// Frosted glass background + Blurred Overlay Wrapper
function FrostedModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg max-w-lg w-full p-6 text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export function EventModal({
  event,
  onClose,
  onDelete,
  onEdit,
  onRsvp,
  isEventCreator,
  isDeleting,
  isRsvping,
  getUserRsvpStatus,
  getAttendeeCount,
}: EventModalProps) {
  return (
    <FrostedModal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h2 id="event-modal-title" className="text-2xl font-bold text-white mb-2">
              {event.title}
            </h2>
            <p className="text-gray-400 text-sm">
              by @{event.creator.displayName || event.creator.username}
            </p>
          </div>
          <div className="flex gap-2">
            {isEventCreator && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(event);
                  }}
                  className="text-gray-400 hover:text-white flex-shrink-0 cursor-pointer"
                  title="Edit event"
                  aria-label="Edit event"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => onDelete(event.id)}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-red-400 flex-shrink-0 cursor-pointer disabled:opacity-50"
                  title="Delete event"
                  aria-label="Delete event"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            {/* Remove original close X button here since modal wrapper has it */}
          </div>
        </div>

        {event.description && (
          <p className="text-gray-300 mb-6 leading-relaxed">{event.description}</p>
        )}

        {/* Artist Info */}
        {event.artist && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6 mb-4">
            <p className="text-gray-400 text-xs mb-1">Featured Artist</p>
            <p className="text-white font-medium">🎵 {event.artist.name}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          {event.location && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <MapPin size={16} />
                <span className="text-xs">Location</span>
              </div>
              <p className="text-white text-sm">{event.location}</p>
            </div>
          )}
          {event.dateTime && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock size={16} />
                <span className="text-xs">Time</span>
              </div>
              <p className="text-white text-sm">{new Date(event.dateTime).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users size={16} />
            <span className="text-xs">Attendees</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-green-400">{getAttendeeCount(event, 'GOING')} going</span>
            <span className="text-yellow-400">{getAttendeeCount(event, 'MAYBE')} maybe</span>
          </div>
          {event.maxAttendees && (
            <p className="text-black-500 text-xs mt-1">Max capacity: {event.maxAttendees}</p>
          )}
        </div>

        {event.musicTag && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                {event.musicTag}
              </span>
            </div>
          </div>
        )}

        {/* RSVP Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => onRsvp(event.id, 'GOING')}
            disabled={isRsvping}
            className={`py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              getUserRsvpStatus(event) === 'GOING'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Going
          </button>
          <button
            onClick={() => onRsvp(event.id, 'MAYBE')}
            disabled={isRsvping}
            className={`py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              getUserRsvpStatus(event) === 'MAYBE'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Maybe
          </button>
          <button
            onClick={() => onRsvp(event.id, 'DECLINED')}
            disabled={isRsvping}
            className={`py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              getUserRsvpStatus(event) === 'DECLINED'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Can't Go
          </button>
        </div>

        <button className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 transition-colors font-medium cursor-pointer">
          See Comments ({event._count.comments})
        </button>
      </div>
    </FrostedModal>
  );
}
