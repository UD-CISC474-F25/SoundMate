interface FormInputProps {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}

export function FormInput({
  id,
  label,
  type,
  required,
  value,
  onChange,
  placeholder,
  maxLength
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-2">
        {label} {required && '*'}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
}
