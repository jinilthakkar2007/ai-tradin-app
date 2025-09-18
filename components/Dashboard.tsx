import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trade, PriceAlert, UserStats, TradeDirection } from '../types';
import { useTradeMonitor } from '../hooks/useTradeMonitor';
import TradeList from './TradeList';
import PerformanceChart from './PerformanceChart';
import MarketNews from './MarketNews';
import StatCard from './StatCard';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ScaleIcon } from './icons/StatIcons';
import { tradeIdeaService, TradeIdea } from '../services/tradeIdeaService';
import TradeIdeas from './TradeIdeas';
import TradeFilters, { Filters } from './TradeFilters';


interface DashboardProps {
  stats: UserStats;
  trades: Trade[];
  onNewTrade: () => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onSetPriceAlert: (tradeId: string, priceAlert: Omit<PriceAlert, 'triggered'> | null) => void;
  onOpenJournal: (trade: Trade) => void;
  onQuickTrade: (prefillData: { asset: string; direction: TradeDirection; entryPrice: number; }) => void;
  handleTradeTrigger: (trade: Trade, status: 'CLOSED_TP' | 'CLOSED_SL', price: number) => void;
  handleCustomAlert: (trade: Trade) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    stats, 
    trades, 
    onNewTrade, 
    onEditTrade, 
    onDeleteTrade, 
    onSetPriceAlert, 
    onOpenJournal, 
    onQuickTrade,
    handleTradeTrigger,
    handleCustomAlert
}) => {
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([]);
  const [filters, setFilters] = useState<Filters>({ status: 'ACTIVE', direction: 'ALL', asset: 'ALL' });
  const MAX_IDEAS = 4;

  useEffect(() => {
    const handleNewIdea = (idea: TradeIdea) => {
        setTradeIdeas(prev => [idea, ...prev].slice(0, MAX_IDEAS));
    };

    tradeIdeaService.subscribe(handleNewIdea);

    return () => tradeIdeaService.unsubscribe();
  }, []);

  const activeTrades = useMemo(() => trades.filter(t => t.status === 'ACTIVE'), [trades]);
  const tradeHistory = useMemo(() => trades.filter(t => t.status !== 'ACTIVE').sort((a, b) => new Date(b.closeDate!).getTime() - new Date(a.closeDate!).getTime()), [trades]);

  const { prices } = useTradeMonitor(activeTrades, handleTradeTrigger, handleCustomAlert);

  const filteredTrades = useMemo(() => {
    const statusFilter = (trade: Trade) => {
      if (filters.status === 'ALL') return true;
      return trade.status === filters.status;
    };
    return trades
      .filter(statusFilter)
      .filter(trade => filters.direction === 'ALL' || trade.direction === filters.direction)
      .filter(trade => filters.asset === 'ALL' || trade.asset === filters.asset)
      .sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());
  }, [trades, filters]);


  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                    <p className="text-text-secondary mt-1">Here's your performance snapshot.</p>
                </div>
                <motion.button 
                    onClick={onNewTrade} 
                    className="bg-brand hover:bg-brand-hover text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <PlusIcon />
                    <span>New Trade</span>
                </motion.button>
            </div>
        </motion.div>
        
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, staggerChildren: 0.1 }}>
            <StatCard icon={<PlusIcon />} label="Total P/L" value={`${stats.totalPL >= 0 ? '+' : ''}$${stats.totalPL.toLocaleString()}`} isCurrency={true} intent={stats.totalPL >= 0 ? 'positive' : 'negative'} />
            <StatCard icon={<CheckCircleIcon />} label="Win Rate" value={`${stats.winRate}%`} intent={stats.winRate >= 50 ? 'positive' : 'negative'} />
            <StatCard icon={<ScaleIcon />} label="Profit Factor" value={stats.profitFactor.toFixed(2)} tooltip="Gross Profit / Gross Loss. Higher is better." intent={stats.profitFactor >= 1 ? 'positive' : 'neutral'} />
            <StatCard icon={<XCircleIcon />} label="Total Trades" value={stats.totalTrades} />
        </motion.div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                    <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                        <h2 className="text-xl font-semibold mb-4">Trades</h2>
                        <TradeFilters trades={trades} filters={filters} onFilterChange={setFilters} />
                        <div className="mt-4">
                            <TradeList
                                trades={filteredTrades}
                                prices={prices}
                                onEditTrade={onEditTrade}
                                onDeleteTrade={onDeleteTrade}
                                onSetPriceAlert={onSetPriceAlert}
                                onOpenJournal={onOpenJournal}
                            />
                        </div>
                    </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                    <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                        <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
                        <PerformanceChart tradeHistory={tradeHistory} />
                    </div>
                </motion.div>
            </div>

            <motion.div className="lg:col-span-1 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                    <h2 className="text-xl font-semibold mb-4">Market News</h2>
                    <MarketNews activeTrades={activeTrades} />
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                    <h2 className="text-xl font-semibold mb-4">AI Trade Ideas</h2>
                    <TradeIdeas ideas={tradeIdeas} onQuickTrade={onQuickTrade} />
                </div>
            </motion.div>
        </div>
    </div>
  );
};

export default Dashboard;