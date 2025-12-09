import { EventForm } from "./EventForm";

interface EditEventFormProps {
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

export function EditEventForm({
  form,
  updateField,
  onSubmit,
  onCancel,
  isSaving,
}: EditEventFormProps) {
  return (
    <EventForm
      title="Edit Event"
      submitLabel="Update Event"
      form={form}
      updateField={updateField}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSaving={isSaving}
    />
  );
}