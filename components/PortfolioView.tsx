
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Trade, UserStats } from '../types';
import StatCard from './StatCard';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ScaleIcon } from './icons/StatIcons';


interface PortfolioViewProps {
  stats: UserStats;
  activeTrades: Trade[];
  tradeHistory: Trade[];
}

const COLORS = ['#1F6FEB', '#238636', '#F7B93E', '#DA3633', '#8B949E', '#A371F7', '#E879F9'];

const PortfolioView: React.FC<PortfolioViewProps> = ({ stats, activeTrades, tradeHistory }) => {
  
  const allocationData = useMemo(() => {
    if (activeTrades.length === 0) return [];

    const allocationMap = new Map<string, number>();
    let totalValue = 0;

    activeTrades.forEach(trade => {
      const positionValue = trade.entryPrice * trade.quantity;
      allocationMap.set(trade.asset, (allocationMap.get(trade.asset) || 0) + positionValue);
      totalValue += positionValue;
    });
    
    if (totalValue === 0) return [];

    return Array.from(allocationMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalValue) * 100).toFixed(2),
    }));
  }, [activeTrades]);

  const portfolioHistoryData = useMemo(() => {
    if (tradeHistory.length === 0) return [];
    
    const sortedHistory = [...tradeHistory].sort((a, b) => new Date(a.closeDate!).getTime() - new Date(b.closeDate!).getTime());
    let cumulativePL = 0;

    return sortedHistory.map(trade => {
      const pnl = (trade.closePrice! - trade.entryPrice) * trade.quantity * (trade.direction === 'LONG' ? 1 : -1);
      cumulativePL += pnl;
      return {
        date: new Date(trade.closeDate!).toLocaleDateString(),
        'Portfolio P/L': parseFloat(cumulativePL.toFixed(2)),
      };
    });
  }, [tradeHistory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-background-light rounded-lg shadow-lg">
          <p className="label text-text-primary font-semibold">{label}</p>
          <p className="intro tabular-nums text-accent-blue">
              Portfolio P/L: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const AllocationTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border border-background-light rounded-lg shadow-lg">
          <p className="label text-text-primary font-semibold">{data.name}</p>
          <p className="intro tabular-nums text-text-secondary">Value: ${data.value.toLocaleString()}</p>
          <p className="intro tabular-nums text-text-secondary">Allocation: {data.percentage}%</p>
        </div>
      );
    }
    return null;
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 bg-background-surface border border-background-light rounded-lg p-4 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <h2 className="text-xl font-semibold mb-4">Portfolio Value Over Time</h2>
            {portfolioHistoryData.length > 0 ? (
                <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioHistoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                        <XAxis dataKey="date" stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#388BFD', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Line type="monotone" dataKey="Portfolio P/L" stroke="#1F6FEB" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-80 flex items-center justify-center text-text-secondary">No closed trades to show historical performance.</div>
            )}
        </motion.div>

         <motion.div className="lg:col-span-1 bg-background-surface border border-background-light rounded-lg p-4 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <h2 className="text-xl font-semibold mb-4">Asset Allocation</h2>
            {allocationData.length > 0 ? (
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={allocationData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius="80%"
                                fill="#8884d8"
                                dataKey="value"
                                stroke="#161B22"
                            >
                                {allocationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<AllocationTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-80 flex items-center justify-center text-text-secondary">No active trades to show allocation.</div>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioView;