import React from 'react';
// FIX: Import Variants to correctly type the animation variants.
import { motion, Variants } from 'framer-motion';
import { Trade, Prices, PriceAlert } from '../types';
import TradeItem from './TradeItem';
import ChartIcon from './icons/ChartIcon';

interface TradeListProps {
  trades: Trade[];
  prices: Prices;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
  onSetPriceAlert?: (tradeId: string, priceAlert: Omit<PriceAlert, 'triggered'> | null) => void;
  onCloseTrade?: (trade: Trade) => void;
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

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const TradeList = ({ trades, prices, onEditTrade, onDeleteTrade, onSetPriceAlert, onCloseTrade, onOpenJournal, onToggleSelect, selectedTradeIds }: TradeListProps) => {
  if (trades.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-surface border-2 border-dashed border-border rounded-xl">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-brand/10 text-brand">
            <ChartIcon />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-text-primary">No Trades Found</h3>
        <p className="mt-2 text-text-secondary">No trades match the current filters. Try adjusting your filters or adding a new trade.</p>
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
            currentPrice={prices[trade.asset]}
            onEditTrade={onEditTrade}
            onDeleteTrade={onDeleteTrade}
            onSetPriceAlert={onSetPriceAlert}
            onCloseTrade={onCloseTrade}
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