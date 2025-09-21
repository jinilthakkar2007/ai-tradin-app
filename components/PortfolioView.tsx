

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trade, UserStats, AssetPerformanceData, Prices } from '../types';
import StatCard from './StatCard';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ScaleIcon } from './icons/StatIcons';
import AssetPerformanceTable from './AssetPerformanceTable';

interface PortfolioViewProps {
  stats: UserStats;
  activeTrades: Trade[];
  tradeHistory: Trade[];
  prices: Prices;
}

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const PortfolioView = ({ stats, activeTrades, tradeHistory, prices }: PortfolioViewProps) => {
    
  const [sortConfig, setSortConfig] = useState<{ key: keyof AssetPerformanceData; direction: 'asc' | 'desc' } | null>({ key: 'totalPL', direction: 'desc' });

  const assetPerformanceData = useMemo(() => {
    const allTrades = [...activeTrades, ...tradeHistory];
    const performanceMap = new Map<string, any>();

    // Initialize map with all assets
    allTrades.forEach(trade => {
        if (!performanceMap.has(trade.asset)) {
            performanceMap.set(trade.asset, {
                symbol: trade.asset,
                totalTrades: 0,
                realizedPL: 0,
                unrealizedPL: 0,
                wins: 0,
                closedTradesCount: 0,
            });
        }
    });

    // Populate data
    allTrades.forEach(trade => {
        const assetData = performanceMap.get(trade.asset)!;
        assetData.totalTrades++;

        if (trade.status !== 'ACTIVE' && trade.closePrice) { // Realized P/L
            const pnl = (trade.closePrice - trade.entryPrice) * trade.quantity * (trade.direction === 'LONG' ? 1 : -1);
            assetData.realizedPL += pnl;
            if (pnl > 0) {
                assetData.wins++;
            }
            assetData.closedTradesCount++;
        } else if (trade.status === 'ACTIVE') { // Unrealized P/L
            const currentPrice = prices[trade.asset] || trade.entryPrice;
            const unrealizedPnl = (currentPrice - trade.entryPrice) * trade.quantity * (trade.direction === 'LONG' ? 1 : -1);
            assetData.unrealizedPL += unrealizedPnl;
        }
    });

    // Final calculations
    return Array.from(performanceMap.values()).map((data): AssetPerformanceData => {
        const totalPL = data.realizedPL + data.unrealizedPL;
        return {
            symbol: data.symbol,
            totalTrades: data.totalTrades,
            winRate: data.closedTradesCount > 0 ? (data.wins / data.closedTradesCount) * 100 : 0,
            totalPL,
            realizedPL: data.realizedPL,
            unrealizedPL: data.unrealizedPL,
            avgPL: data.totalTrades > 0 ? totalPL / data.totalTrades : 0,
        };
    });
  }, [activeTrades, tradeHistory, prices]);

  const sortedAssets = useMemo(() => {
    let sortableItems = [...assetPerformanceData];
    if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableItems;
  }, [assetPerformanceData, sortConfig]);

  const handleSort = (key: keyof AssetPerformanceData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-text-primary">Portfolio Overview</h1>
        <p className="text-text-secondary mt-1">Analyze your overall performance and asset allocation.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, staggerChildren: 0.1 }}>
        <StatCard icon={<PlusIcon />} label="Total P/L" value={`${stats.totalPL >= 0 ? '+' : ''}$${stats.totalPL.toLocaleString()}`} isCurrency={true} intent={stats.totalPL >= 0 ? 'positive' : 'negative'} />
        <StatCard icon={<CheckCircleIcon />} label="Win Rate" value={`${stats.winRate}%`} intent={stats.winRate >= 50 ? 'positive' : 'negative'} />
        <StatCard icon={<ScaleIcon />} label="Profit Factor" value={stats.profitFactor.toFixed(2)} tooltip="Gross Profit / Gross Loss. Higher is better." intent={stats.profitFactor >= 1 ? 'positive' : 'neutral'} />
        <StatCard icon={<XCircleIcon />} label="Total Trades" value={stats.totalTrades} />
      </motion.div>
      
      <motion.div 
        className="lg:col-span-3 bg-surface border border-border rounded-lg p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4">Asset Performance Breakdown</h2>
        <AssetPerformanceTable assets={sortedAssets} onSort={handleSort} sortConfig={sortConfig} />
      </motion.div>
    </div>
  );
};

export default PortfolioView;
