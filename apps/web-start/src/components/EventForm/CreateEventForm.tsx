import { EventForm } from "./EventForm";

interface CreateEventFormProps {
  form: {
    title: string;
    location: string;
    dateTime: string;
    description: string;
    musicTag: string;
    artistId: string;
    visibility: "PUBLIC" | "PRIVATE";
    maxAttendees: string | number | null;
  };
  updateField: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function CreateEventForm({
  form,
  updateField,
  onSubmit,
  onCancel,
  isSaving,
}: CreateEventFormProps) {
  return (
    <EventForm
      title="Create Event"
      submitLabel="Create Event"
      form={form}
      updateField={updateField}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSaving={isSaving}
    />
  );
}
