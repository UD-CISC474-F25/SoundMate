import React from 'react';
import type { Event } from '../../hooks/useEvents';

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: Event) => void;
  onRsvp: (eventId: string, status: 'GOING' | 'MAYBE' | 'DECLINED') => void;
  getUserRsvpStatus: (event: Event) => 'GOING' | 'MAYBE' | 'INVITED' | 'DECLINED' | null;
  isEventCreator: boolean;
}

export function EventModal({
  event,
  onClose,
  onDelete,
  onEdit,
  onRsvp,
  getUserRsvpStatus,
  isEventCreator,
}: EventModalProps) {
  const status = getUserRsvpStatus(event);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-xl max-w-xl w-full relative border border-gray-700 shadow-lg">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-white mb-4">{event.title}</h2>

        <div className="mb-4">
          <strong className="text-gray-400">Music Type:</strong>{' '}
          <span className="text-white">{event.musicTag || 'N/A'}</span>
        </div>

        <div className="mb-4">
          <strong className="text-gray-400">Location:</strong>{' '}
          <span className="text-white">{event.location}</span>
        </div>

        <div className="mb-4">
          <strong className="text-gray-400">Date & Time:</strong>{' '}
          <span className="text-white">
            {event.dateTime ? new Date(event.dateTime).toLocaleString() : 'N/A'}
          </span>
        </div>

        {event.description && (
          <div className="mb-6">
            <strong className="text-gray-400">Description:</strong>
            <p className="text-white mt-1 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            className={`px-4 py-2 rounded ${
              status === 'GOING' ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'
            } text-white transition-colors`}
            onClick={() => onRsvp(event.id, 'GOING')}
          >
            Going
          </button>
          <button
            className={`px-4 py-2 rounded ${
              status === 'MAYBE' ? 'bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-700'
            } text-white transition-colors`}
            onClick={() => onRsvp(event.id, 'MAYBE')}
          >
            Maybe
          </button>
          <button
            className={`px-4 py-2 rounded ${
              status === 'DECLINED' ? 'bg-gray-800' : 'bg-gray-700 hover:bg-gray-800'
            } text-white transition-colors`}
            onClick={() => onRsvp(event.id, 'DECLINED')}
          >
            Decline
          </button>
        </div>

        {isEventCreator && (
          <div className="flex gap-3 flex-wrap">
            <button
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              onClick={() => onEdit(event)}
            >
              Edit
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
              onClick={() => onDelete(event.id)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
