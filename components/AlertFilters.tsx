import React from 'react';

type AlertType = 'all' | 'success' | 'error' | 'info';
type ReadStatus = 'all' | 'unread';

interface AlertFiltersProps {
  typeFilter: AlertType;
  onTypeChange: (filter: AlertType) => void;
  readStatusFilter: ReadStatus;
  onReadStatusChange: (filter: ReadStatus) => void;
}

const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}> = ({ label, isActive, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
      isActive ? 'bg-accent-blue text-white' : 'bg-background-surface hover:bg-background-light text-text-secondary'
    } ${className}`}
  >
    {label}
  </button>
);

const AlertFilters: React.FC<AlertFiltersProps> = ({
  typeFilter,
  onTypeChange,
  readStatusFilter,
  onReadStatusChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2 bg-background p-1 rounded-lg border border-background-light">
        <FilterButton label="All Status" isActive={readStatusFilter === 'all'} onClick={() => onReadStatusChange('all')} />
        <FilterButton label="Unread" isActive={readStatusFilter === 'unread'} onClick={() => onReadStatusChange('unread')} />
      </div>
      <div className="flex items-center space-x-2 bg-background p-1 rounded-lg border border-background-light">
        <FilterButton label="All Types" isActive={typeFilter === 'all'} onClick={() => onTypeChange('all')} />
        <FilterButton label="Success" isActive={typeFilter === 'success'} onClick={() => onTypeChange('success')} />
        <FilterButton label="Error" isActive={typeFilter === 'error'} onClick={() => onTypeChange('error')} />
      </div>
    </div>
  );
};

export default AlertFilters;