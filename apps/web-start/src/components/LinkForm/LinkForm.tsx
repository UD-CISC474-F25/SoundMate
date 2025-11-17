import { useState } from 'react';
import { FormInput } from '../FormInput/FormInput';

type LinkFormProps = {
  initialData?: { title: string; url: string };
  onSubmit: (data: { title: string; url: string }) => Promise<{ success: boolean }>;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function LinkForm({ initialData, onSubmit, onCancel, isSubmitting }: LinkFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    url: initialData?.url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(formData);
    if (!result.success) {
      alert('Failed to save link. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        id="title"
        label="Link Title"
        type="text"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        placeholder="e.g., My Instagram, My Website"
        required
        maxLength={50}
      />

      <FormInput
        id="url"
        label="URL"
        type="url"
        value={formData.url}
        onChange={(value) => setFormData({ ...formData, url: value })}
        placeholder="https://..."
        required
      />

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border-2 border-white/40 hover:border-white/60 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Link' : 'Add Link'}
        </button>
      </div>
    </form>
  );
}
