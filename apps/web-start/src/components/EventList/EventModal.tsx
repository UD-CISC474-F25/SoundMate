import React, { useState, useRef, useEffect } from "react";
import { Clock, Edit, MapPin, Trash2, Users } from "lucide-react";
import type { Event } from "../../hooks/useEvents";
import { useEvents } from "../../hooks/useEvents";
import { useComments } from "../../hooks/useComments";
import { SlideFade } from "../Animations";

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onDelete: (eventId: string) => Promise<void>;
  onEdit: (event: Event) => void;
  onRsvp: (eventId: string, status: "GOING" | "MAYBE" | "DECLINED") => void;
  isEventCreator: boolean;
  isDeleting: boolean;
  isRsvping: boolean;
  getUserRsvpStatus: (
    event: Event
  ) => "GOING" | "MAYBE" | "DECLINED" | "INVITED" | null;
  getAttendeeCount: (event: Event, status: "GOING" | "MAYBE") => number;
}

interface EventDetailsProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void | Promise<void>;
  isEventCreator: boolean;
  isDeleting: boolean;
  isRsvping: boolean;
  onRsvp: (eventId: string, status: "GOING" | "MAYBE" | "DECLINED") => void;
  getUserRsvpStatus: (
    event: Event
  ) => "GOING" | "MAYBE" | "DECLINED" | "INVITED" | null;
  getAttendeeCount: (event: Event, status: "GOING" | "MAYBE") => number;
  setView: (v: "details" | "comments") => void;
}

interface EventCommentsProps {
  event: Event;
  setView: (v: "details" | "comments") => void;
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
  const [view, setView] = useState<"details" | "comments">("details");

  const { events } = useEvents();
  const liveEvent = events.find((e) => e.id === event.id) || event;

  const detailsRef = useRef<HTMLDivElement>(null);
  const [modalHeight, setModalHeight] = useState<number | null>(null);

  useEffect(() => {
    if (detailsRef.current) {
      setModalHeight(detailsRef.current.scrollHeight);
    }
  }, [liveEvent, liveEvent.attendees, liveEvent._count]); 

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg 
                   max-w-lg w-full text-white relative flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: modalHeight ? `${modalHeight}px` : "auto",
          transition: "height 0.3s ease",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold cursor-pointer z-10"
        >
          &times;
        </button>

        <div
          ref={detailsRef}
          className="absolute opacity-0 -z-50 pointer-events-none inset-0"
        >
          <EventDetailsContent
            event={liveEvent}
            onEdit={onEdit}
            onDelete={onDelete}
            isEventCreator={isEventCreator}
            isDeleting={isDeleting}
            isRsvping={isRsvping}
            onRsvp={onRsvp}
            getUserRsvpStatus={getUserRsvpStatus}
            getAttendeeCount={getAttendeeCount}
            setView={setView}
          />
        </div>

        <div className="relative h-full">
          <SlideFade show={view === "details"} key={`details-${liveEvent.id}-${liveEvent.attendees?.length || 0}`}>
            <EventDetailsContent
              event={liveEvent}
              onEdit={onEdit}
              onDelete={onDelete}
              isEventCreator={isEventCreator}
              isDeleting={isDeleting}
              isRsvping={isRsvping}
              onRsvp={onRsvp}
              getUserRsvpStatus={getUserRsvpStatus}
              getAttendeeCount={getAttendeeCount}
              setView={setView}
            />
          </SlideFade>

          <SlideFade show={view === "comments"} key={`comments-${liveEvent.id}`}>
            <EventComments event={liveEvent} setView={setView} />
          </SlideFade>
        </div>
      </div>
    </div>
  );
}

function EventDetailsContent({
  event,
  onEdit,
  onDelete,
  isEventCreator,
  isDeleting,
  isRsvping,
  onRsvp,
  getUserRsvpStatus,
  getAttendeeCount,
  setView,
}: EventDetailsProps) {
  return (
    <div className="p-6 pb-12">
      <div className="flex items-start justify-between mb-4 pr-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">{event.title}</h2>
          <p className="text-gray-400 text-sm">
            by @{event.creator.displayName || event.creator.username}
          </p>
        </div>

        {isEventCreator && (
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(event)}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => onDelete(event.id)}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      
      {event.description && event.description.trim() !== '' && (
        <p className="text-gray-300 mb-6 leading-relaxed">{event.description}</p>
      )}

     
      {event.artist && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-4">
          <p className="text-gray-400 text-xs mb-1">Featured Artist</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <p className="text-white font-medium">{event.artist.name}</p>
          </div>
        </div>
      )}

      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {event.location && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <MapPin size={16} />
              <span className="text-xs">Location</span>
            </div>
            <p className="text-white text-sm">{event.location}</p>
          </div>
        )}

        {event.dateTime && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Clock size={16} />
              <span className="text-xs">Time</span>
            </div>
            <p className="text-white text-sm">
              {new Date(event.dateTime).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Users size={16} />
          <span className="text-xs">Attendees</span>
        </div>

        <div className="flex gap-4 text-sm">
          <span className="text-white">
            {(() => {
              if (!event.attendees) return 0;
              const going = event.attendees.filter(a => a.status === "GOING").length;
              const maybe = event.attendees.filter(a => a.status === "MAYBE").length;
              return going + maybe;
            })()} attending
          </span>
          <span className="text-gray-400">
            ({event.attendees?.filter(a => a.status === "GOING").length || 0} going, {event.attendees?.filter(a => a.status === "MAYBE").length || 0} maybe)
          </span>
        </div>

        {event.maxAttendees && (
          <p className="text-gray-400 text-xs mt-1">
            Max capacity: {event.maxAttendees}
          </p>
        )}
      </div>

      {event.musicTag && event.musicTag.trim() !== '' && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Tags</p>
          <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
            {event.musicTag}
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => onRsvp(event.id, "GOING")}
          disabled={isRsvping}
          className={`py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
            getUserRsvpStatus(event) === "GOING"
              ? "bg-green-500 text-white scale-105 shadow-sm shadow-green-500/50"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105"
          } ${isRsvping ? "opacity-50 animate-pulse" : ""}`}
        >
          Going
        </button>
        <button
          onClick={() => onRsvp(event.id, "MAYBE")}
          disabled={isRsvping}
          className={`py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
            getUserRsvpStatus(event) === "MAYBE"
              ? "bg-yellow-500 text-white scale-105 shadow-sm shadow-yellow-500/50"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105"
          } ${isRsvping ? "opacity-50 animate-pulse" : ""}`}
        >
          Maybe
        </button>
        <button
          onClick={() => onRsvp(event.id, "DECLINED")}
          disabled={isRsvping}
          className={`py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
            getUserRsvpStatus(event) === "DECLINED"
              ? "bg-red-500/50 text-white scale-105 shadow-sm shadow-red-500/50"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105"
          } ${isRsvping ? "opacity-50 animate-pulse" : ""}`}
        >
          Can't Go
        </button>
      </div>

      <button
        onClick={() => setView("comments")}
        className="w-full bg-white/10 border border-white/20 rounded-xl p-4 
                   transition cursor-pointer mb-6 hover:bg-white/15 hover:scale-[1.02]"
      >
        See Comments ({event._count.comments})
      </button>
    </div>
  );
}

function EventComments({ event, setView }: EventCommentsProps) {
  const {
    comments,
    addComment,
    deleteComment,
    commentsLoading,
    isAdding,
    isDeleting,
  } = useComments(event.id);

  const [content, setContent] = useState("");

  const postComment = async () => {
    if (!content.trim()) return;
    await addComment(event.id, content.trim());
    setContent("");
  };

  return (
    <div className="p-6 flex flex-col min-h-full">
      <button
        onClick={() => setView("details")}
        className="self-start text-gray-300 hover:text-white mb-4 cursor-pointer"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4">Comments</h2>

      <div className="flex-1 mb-4">
        {commentsLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-white/10 border border-white/20 rounded-lg p-3"
              >
                <p className="font-semibold text-sm">
                  @{c.user.displayName || c.user.username}
                </p>
                <p className="text-sm mt-1">{c.content}</p>

                <button
                  onClick={() => deleteComment(event.id, c.id)}
                  disabled={isDeleting}
                  className="text-xs text-red-400 mt-2 hover:text-red-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full bg-white/10 px-3 py-2 rounded-md cursor-text border border-white/20 text-white placeholder-gray-400 resize-none"
          rows={3}
        />

        <button
          onClick={postComment}
          disabled={isAdding || !content.trim()}
          className="w-full py-3 bg-white text-black rounded-lg mt-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-100 transition font-medium"
        >
          {isAdding ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </div>
  );
}