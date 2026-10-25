import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {/* Large icon */}
        <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-stone-400" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-stone-800 mb-2">{title}</h3>

        {/* Description */}
        <p className="text-stone-500 max-w-sm mb-6">{description}</p>

        {/* Optional action button */}
        {action && (
          <button
            onClick={action.onClick}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export { EmptyState };
export default EmptyState;
