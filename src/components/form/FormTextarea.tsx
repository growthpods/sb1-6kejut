interface FormTextareaProps {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}

export function FormTextarea({ label, name, rows = 4, required = false, placeholder }: FormTextareaProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}