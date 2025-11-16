interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  rows: number;
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows
}: FormTextareaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none transition-all"
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <p className="text-xs text-gray-400 mt-1">{value.length}/{maxLength} characters</p>
    </div>
  );
}
