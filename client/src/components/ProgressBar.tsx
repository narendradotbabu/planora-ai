import React from 'react';

interface ProgressBarProps {
  value: number;
  label?: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color = 'bg-primary-600',
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {/* Label and percentage */}
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <span className="text-sm font-medium text-stone-700">{label}</span>
        )}
        <span className="text-sm font-semibold text-stone-600 ml-auto">
          {Math.round(clampedValue)}%
        </span>
      </div>

      {/* Track */}
      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || 'Progress'}
        />
      </div>
    </div>
  );
};

export { ProgressBar };
export default ProgressBar;
