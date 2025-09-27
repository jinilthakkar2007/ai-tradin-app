import React, { useState, useEffect, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Trade, Prices } from '../types';

interface CloseTradeModalProps {
  trade: Trade;
  onClose: () => void;
  onConfirmClose: (closePrice: number) => void;
  prices: Prices;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

const CloseTradeModal = ({ trade, onClose, onConfirmClose, prices }: CloseTradeModalProps) => {
  const currentPrice = prices[trade.asset] || trade.entryPrice;
  const [closePrice, setClosePrice] = useState(currentPrice.toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setClosePrice(currentPrice.toString());
  }, [currentPrice]);

  const parsedClosePrice = parseFloat(closePrice);

  const { profitLoss, pnlColor } = useMemo(() => {
    if (isNaN(parsedClosePrice)) return { profitLoss: 0, pnlColor: 'text-text-secondary' };
    
    const pl = (parsedClosePrice - trade.entryPrice) * trade.quantity * (trade.direction === 'LONG' ? 1 : -1);
    const color = pl >= 0 ? 'text-accent-green' : 'text-accent-red';
    return { profitLoss: pl, pnlColor: color };
  }, [parsedClosePrice, trade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(parsedClosePrice) || parsedClosePrice <= 0) {
      setError('Please enter a valid positive closing price.');
      return;
    }
    setError(null);
    onConfirmClose(parsedClosePrice);
  };

  const isLong = trade.direction === 'LONG';

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-glass border border-white/10 rounded-lg shadow-2xl w-full max-w-sm"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-text-primary">Manually Close Trade</h2>
            <p className="text-sm text-text-secondary flex items-center gap-2">
              <span>{trade.asset}</span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isLong ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>{trade.direction}</span>
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-secondary">Entry Price</label>
                <p className="text-text-primary font-semibold">${trade.entryPrice.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs text-text-secondary">Quantity</label>
                <p className="text-text-primary font-semibold">{trade.quantity.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <label htmlFor="closePrice" className="block text-sm font-medium text-text-secondary mb-1">
                Close Price
              </label>
              <input
                type="number"
                id="closePrice"
                value={closePrice}
                onChange={(e) => setClosePrice(e.target.value)}
                className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand"
                step="any"
                required
                autoFocus
              />
            </div>
            
            <div className="bg-surface p-3 rounded-md border border-border">
              <p className="text-sm text-text-secondary">Estimated Profit / Loss</p>
              <p className={`text-2xl font-bold tabular-nums ${pnlColor}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {error && <p className="text-sm text-accent-red bg-accent-red/10 p-3 rounded-md">{error}</p>}
          </div>
          <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-white/10">
            <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Cancel</motion.button>
            <motion.button type="submit" whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">
              Confirm Close
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CloseTradeModal;
