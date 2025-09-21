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

  const { statusCounts, directionCounts, assetCounts, availableAssets } = useMemo(() => {
    // Helper filter functions based on current filter state
    const filterByStatus = (trade: Trade) => filters.status === 'ALL' || trade.status === filters.status;
    const filterByDirection = (trade: Trade) => filters.direction === 'ALL' || trade.direction === filters.direction;
    const filterByAsset = (trade: Trade) => filters.asset === 'ALL' || trade.asset === filters.asset;

    // --- Status Counts ---
    // Count statuses based on trades filtered by direction and asset
    const tradesForStatusCount = trades.filter(filterByDirection).filter(filterByAsset);
    const statusCounts: Record<TradeStatus | 'ALL', number> = {
      ALL: tradesForStatusCount.length,
      ACTIVE: tradesForStatusCount.filter(t => t.status === 'ACTIVE').length,
      CLOSED_TP: tradesForStatusCount.filter(t => t.status === 'CLOSED_TP').length,
      CLOSED_SL: tradesForStatusCount.filter(t => t.status === 'CLOSED_SL').length,
    };

    // --- Direction Counts ---
    // Count directions based on trades filtered by status and asset
    const tradesForDirectionCount = trades.filter(filterByStatus).filter(filterByAsset);
    const directionCounts: Record<TradeDirection | 'ALL', number> = {
      ALL: tradesForDirectionCount.length,
      LONG: tradesForDirectionCount.filter(t => t.direction === 'LONG').length,
      SHORT: tradesForDirectionCount.filter(t => t.direction === 'SHORT').length,
    };
    
    // --- Asset Counts ---
    // Get all unique assets from the original unfiltered list to populate the dropdown
    const allAvailableAssets = Array.from(new Set(trades.map(t => t.asset))).sort();
    
    // Count assets based on trades filtered by status and direction
    const tradesForAssetCount = trades.filter(filterByStatus).filter(filterByDirection);
    const assetCounts: Record<string, number> = { ALL: tradesForAssetCount.length };
    allAvailableAssets.forEach(asset => {
        assetCounts[asset] = tradesForAssetCount.filter(t => t.asset === asset).length;
    });

    return { 
        statusCounts, 
        directionCounts, 
        assetCounts, 
        availableAssets: allAvailableAssets
    };
  }, [trades, filters]);

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
            count={statusCounts[opt.value]}
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
            count={directionCounts[opt.value]}
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
            <option value="ALL">All Assets ({assetCounts.ALL})</option>
            {availableAssets.map(asset => (
                <option key={asset} value={asset}>{asset} ({assetCounts[asset] || 0})</option>
            ))}
        </select>
       </div>
    </div>
  );
};

export default TradeFilters;