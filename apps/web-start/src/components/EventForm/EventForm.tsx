import React from "react";
import { X } from "lucide-react";
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
    visibility: "PUBLIC" | "PRIVATE";
    maxAttendees: string | number | null;
  };
  updateField: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">

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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all resize-none"
            placeholder="Tell people what to expect..."
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
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Visibility
            </label>
            <select
              value={form.visibility}
              onChange={(e) =>
                updateField("visibility", e.target.value as "PUBLIC" | "PRIVATE")
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
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

        {/* Footer */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
