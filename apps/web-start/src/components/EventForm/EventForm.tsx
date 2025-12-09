import React from "react";
import { FormInput } from "../FormInput/FormInput";

interface EventFormProps {
  title: string;
  submitLabel: string;
  form: {
    title: string;
    location: string;
    dateTime: string;
    description: string;
    musicTag: string;
    artistId?: string;
    visibility: "PUBLIC" | "PRIVATE";
    maxAttendees: string | number | null;
  };
  updateField: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

// Frosted glass background + Blurred Overlay
function FrostedModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg max-w-lg w-full p-6 text-white relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold cursor-pointer"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export function EventForm({
  title,
  submitLabel,
  form,
  updateField,
  onSubmit,
  onCancel,
  isSaving,
}: EventFormProps) {
  return (
    <FrostedModal onClose={onCancel}>
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5 text-white">
        <FormInput
          id="title"
          label="Title"
          type="text"
          required
          value={form.title}
          placeholder="Event name"
          onChange={(v) => updateField("title", v)}
        />

        <FormInput
          id="location"
          label="Location"
          type="text"
          value={form.location}
          placeholder="Venue or address"
          onChange={(v) => updateField("location", v)}
        />

        <FormInput
          id="dateTime"
          label="Date & Time"
          type="datetime-local"
          value={form.dateTime}
          placeholder="Select date and time"
          onChange={(v) => updateField("dateTime", v)}
        />

        <FormInput
          id="artistId"
          label="Featured Artist"
          type="text"
          value={form.artistId || ''}
          placeholder="Artist name"
          onChange={(v) => updateField("artistId", v)}
        />

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-2 font-medium">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Tell people what to expect..."
            className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none transition cursor-text"
          />
        </div>

        <FormInput
          id="musicTag"
          label="Music Tag"
          type="text"
          value={form.musicTag}
          placeholder="e.g., Jazz, Rock, Electronic"
          onChange={(v) => updateField("musicTag", v)}
        />

        {/* Visibility + Max Attendees */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="visibility" className="block mb-2 font-medium">
              Visibility
            </label>
            <select
              id="visibility"
              value={form.visibility}
              onChange={(e) =>
                updateField("visibility", e.target.value as "PUBLIC" | "PRIVATE")
              }
              className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition text-white cursor-pointer"
            >
              <option value="PUBLIC" className="bg-gray-900">Public</option>
              <option value="PRIVATE" className="bg-gray-900">Private</option>
            </select>
          </div>

          <FormInput
            id="maxAttendees"
            label="Max Attendees"
            type="number"
            value={String(form.maxAttendees ?? "")}
            placeholder="Optional"
            onChange={(v) => updateField("maxAttendees", v)}
          />
        </div>

        {/* Footer buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </FrostedModal>
  );
}