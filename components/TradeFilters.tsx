import React, { useMemo } from 'react';
import { Trade, TradeStatus, TradeDirection } from '../types';

export interface Filters {
  status: TradeStatus | 'ALL';
  direction: TradeDirection | 'ALL';
  asset: string | 'ALL';
}

interface TradeFiltersProps {
  trades: Trade[];
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
}

const FilterButton: React.FC<{
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
      isActive ? 'bg-brand text-white' : 'bg-surface hover:bg-border text-text-secondary'
    }`}
  >
    {label}
    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-border'}`}>
      {count}
    </span>
  </button>
);

const TradeFilters: React.FC<TradeFiltersProps> = ({ trades, filters, onFilterChange }) => {

  const counts = useMemo(() => {
    const statusCounts: Record<TradeStatus | 'ALL', number> = { ALL: trades.length, ACTIVE: 0, CLOSED_TP: 0, CLOSED_SL: 0 };
    const directionCounts: Record<TradeDirection | 'ALL', number> = { ALL: trades.length, LONG: 0, SHORT: 0 };
    const assetCounts: Record<string, number> = { ALL: trades.length };
    const availableAssets = new Set<string>();

    trades.forEach(trade => {
      statusCounts[trade.status]++;
      directionCounts[trade.direction]++;
      assetCounts[trade.asset] = (assetCounts[trade.asset] || 0) + 1;
      availableAssets.add(trade.asset);
    });

    return { statusCounts, directionCounts, assetCounts, availableAssets: Array.from(availableAssets).sort() };
  }, [trades]);

  const handleFilterChange = (key: keyof Filters, value: Filters[keyof Filters]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const statusOptions: { label: string, value: Filters['status'] }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Profit', value: 'CLOSED_TP' },
    { label: 'Loss', value: 'CLOSED_SL' },
  ];

  const directionOptions: { label: string, value: Filters['direction'] }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Long', value: 'LONG' },
    { label: 'Short', value: 'SHORT' },
  ];

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
      {/* Status Filters */}
      <div className="flex items-center space-x-2 bg-background p-1 rounded-lg border border-border">
        {statusOptions.map(opt => (
          <FilterButton 
            key={opt.value}
            label={opt.label}
            count={counts.statusCounts[opt.value]}
            isActive={filters.status === opt.value}
            onClick={() => handleFilterChange('status', opt.value)}
          />
        ))}
      </div>
      {/* Direction Filters */}
      <div className="flex items-center space-x-2 bg-background p-1 rounded-lg border border-border">
        {directionOptions.map(opt => (
          <FilterButton
            key={opt.value}
            label={opt.label}
            count={counts.directionCounts[opt.value]}
            isActive={filters.direction === opt.value}
            onClick={() => handleFilterChange('direction', opt.value)}
          />
        ))}
      </div>
       {/* Asset Filter */}
       <div>
         <select 
            value={filters.asset} 
            onChange={e => handleFilterChange('asset', e.target.value)} 
            className="bg-background border border-border text-text-primary rounded-lg p-2.5 focus:ring-2 focus:ring-brand focus:border-brand text-sm font-semibold"
        >
            <option value="ALL">All Assets ({counts.assetCounts.ALL})</option>
            {counts.availableAssets.map(asset => (
                <option key={asset} value={asset}>{asset} ({counts.assetCounts[asset] || 0})</option>
            ))}
        </select>
       </div>
    </div>
  );
};

export default TradeFilters;
