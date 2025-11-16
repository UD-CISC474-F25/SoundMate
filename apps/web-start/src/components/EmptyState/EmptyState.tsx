import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
      {icon && <div className="mb-4 flex justify-center text-gray-600">{icon}</div>}
      <p className="text-gray-400 mb-2 text-lg font-medium">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
