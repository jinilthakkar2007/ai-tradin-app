import React from 'react';
import { motion } from 'framer-motion';
import { ProTrader } from '../types';

interface ProTraderCardProps {
    trader: ProTrader;
    isCopying: boolean;
    onToggleCopy: (traderId: string) => void;
}

const Stat: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color = 'text-text-primary' }) => (
    <div className="text-center">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
    </div>
);

const ProTraderCard: React.FC<ProTraderCardProps> = ({ trader, isCopying, onToggleCopy }) => {

    const getRiskColor = (risk: 'Low' | 'Medium' | 'High') => {
        switch (risk) {
            case 'Low': return 'text-accent-green';
            case 'Medium': return 'text-yellow-400';
            case 'High': return 'text-accent-red';
            default: return 'text-text-secondary';
        }
    };
    
    const plColor = trader.stats.monthlyPL >= 0 ? 'text-accent-green' : 'text-accent-red';

    return (
        <motion.div 
            className="bg-background-surface border border-background-light rounded-xl overflow-hidden shadow-lg flex flex-col"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="p-6 flex flex-col items-center text-center">
                <img src={trader.avatar} alt={trader.name} className="w-24 h-24 rounded-full mb-4 border-4 border-background-light" />
                <h3 className="text-xl font-bold text-text-primary">{trader.name}</h3>
                <p className="text-sm text-text-secondary mt-1 h-10">{trader.bio}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 px-6 py-4 border-y border-background-light bg-background">
                <Stat label="Monthly P/L" value={`${trader.stats.monthlyPL >= 0 ? '+' : ''}${trader.stats.monthlyPL.toFixed(2)}%`} color={plColor} />
                <Stat label="Win Rate" value={`${trader.stats.winRate.toFixed(1)}%`} />
                <Stat label="Risk" value={trader.stats.riskScore} color={getRiskColor(trader.stats.riskScore)} />
            </div>
             <p className="text-center text-xs text-text-dim py-2 bg-background">
                {trader.stats.followers.toLocaleString()} followers
            </p>

            <div className="mt-auto p-4">
                <motion.button
                    onClick={() => onToggleCopy(trader.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-2.5 px-5 rounded-md font-semibold transition-colors duration-200 ${
                        isCopying 
                        ? 'bg-accent-blue text-white hover:bg-accent-blueHover' 
                        : 'bg-background-light text-text-primary hover:bg-accent-blue/20 hover:text-accent-blue'
                    }`}
                >
                    {isCopying ? 'Stop Copying' : 'Copy Trader'}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ProTraderCard;
