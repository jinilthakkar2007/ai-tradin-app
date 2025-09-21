

import React from 'react';
import { motion } from 'framer-motion';
import { AssetPerformanceData } from '../types';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

interface AssetPerformanceTableProps {
  assets: AssetPerformanceData[];
  sortConfig: { key: keyof AssetPerformanceData; direction: 'asc' | 'desc' } | null;
  onSort: (key: keyof AssetPerformanceData) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const AssetPerformanceTable = ({ assets, sortConfig, onSort }: AssetPerformanceTableProps) => {

  const renderSortIcon = (key: keyof AssetPerformanceData) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />;
  };

  const getPnlColor = (value: number) => {
    if (value > 0) return 'text-accent-green';
    if (value < 0) return 'text-accent-red';
    return 'text-text-secondary';
  };

  const headers: { key: keyof AssetPerformanceData; label: string; isNumeric: boolean }[] = [
    { key: 'symbol', label: 'Asset', isNumeric: false },
    { key: 'totalTrades', label: 'Total Trades', isNumeric: true },
    { key: 'winRate', label: 'Win Rate', isNumeric: true },
    { key: 'realizedPL', label: 'Realized P/L', isNumeric: true },
    { key: 'unrealizedPL', label: 'Unrealized P/L', isNumeric: true },
    { key: 'avgPL', label: 'Avg P/L / Trade', isNumeric: true },
    { key: 'totalPL', label: 'Total P/L', isNumeric: true },
  ];

  if (assets.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-surface/50 border-2 border-dashed border-border rounded-xl">
        <h3 className="text-lg font-semibold text-text-primary">No Performance Data</h3>
        <p className="mt-2 text-text-secondary">Log your first trade to see a performance breakdown here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left tabular-nums">
        <thead>
          <tr className="border-b border-border">
            {headers.map(header => (
              <th 
                key={header.key} 
                scope="col" 
                className={`px-4 py-3 text-xs text-text-secondary uppercase cursor-pointer hover:text-text-primary transition-colors ${header.isNumeric ? 'text-right' : 'text-left'}`}
                onClick={() => onSort(header.key)}
              >
                <div className={`flex items-center gap-1 ${header.isNumeric ? 'justify-end' : 'justify-start'}`}>
                  <span>{header.label}</span>
                  {renderSortIcon(header.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
          {assets.map(asset => (
            <motion.tr key={asset.symbol} className="border-b border-border hover:bg-surface/50 transition-colors" variants={itemVariants}>
              <td className="px-4 py-3 font-bold text-text-primary">{asset.symbol}</td>
              <td className="px-4 py-3 text-right text-text-primary">{asset.totalTrades}</td>
              <td className="px-4 py-3 text-right text-text-primary">{asset.winRate.toFixed(2)}%</td>
              <td className={`px-4 py-3 text-right font-semibold ${getPnlColor(asset.realizedPL)}`}>
                ${asset.realizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={`px-4 py-3 text-right font-semibold ${getPnlColor(asset.unrealizedPL)}`}>
                ${asset.unrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={`px-4 py-3 text-right font-semibold ${getPnlColor(asset.avgPL)}`}>
                ${asset.avgPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={`px-4 py-3 text-right font-bold ${getPnlColor(asset.totalPL)}`}>
                ${asset.totalPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
};

export default AssetPerformanceTable;
