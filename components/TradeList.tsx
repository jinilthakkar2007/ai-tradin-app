import React from 'react';
// FIX: Import Variants to correctly type the animation variants.
import { motion, Variants } from 'framer-motion';
import { Trade, Prices, PriceAlert } from '../types';
import TradeItem from './TradeItem';
import ChartIcon from './icons/ChartIcon';

interface TradeListProps {
  trades: Trade[];
  prices: Prices;
  isHistory: boolean;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
  onSetPriceAlert?: (tradeId: string, priceAlert: Omit<PriceAlert, 'triggered'> | null) => void;
  onOpenJournal?: (trade: Trade) => void;
  onToggleSelect?: (tradeId: string) => void;
  selectedTradeIds?: Set<string>;
}

// FIX: Explicitly type containerVariants with the Variants type from framer-motion.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// FIX: Explicitly type itemVariants with the Variants type from framer-motion.
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 14
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
        duration: 0.2
    }
  }
};

const TradeList: React.FC<TradeListProps> = ({ trades, prices, isHistory, onEditTrade, onDeleteTrade, onSetPriceAlert, onOpenJournal, onToggleSelect, selectedTradeIds }) => {
  if (trades.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-surface border-2 border-dashed border-border rounded-xl">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-brand/10 text-brand">
            <ChartIcon />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-text-primary">{isHistory ? 'No Closed Trades Yet' : 'No Active Trades'}</h3>
        <p className="mt-2 text-text-secondary">{isHistory ? 'Your completed trades will appear here.' : 'Add a new trade to start monitoring.'}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout /* Micro-interaction: Animate layout changes */
    >
      {trades.map(trade => (
        <motion.div key={trade.id} variants={itemVariants} layout exit="exit">
          <TradeItem
            trade={trade}
            currentPrice={isHistory ? undefined : prices[trade.asset]}
            isHistory={isHistory}
            onEditTrade={onEditTrade}
            onDeleteTrade={onDeleteTrade}
            onSetPriceAlert={onSetPriceAlert}
            onOpenJournal={onOpenJournal}
            isSelected={selectedTradeIds?.has(trade.id)}
            onToggleSelect={onToggleSelect}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TradeList;