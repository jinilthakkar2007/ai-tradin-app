import React, { useState, useCallback, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Trade, TradeDirection, TakeProfit } from '../types';

interface QuickTradeModalProps {
  onAddTrade: (trade: Omit<Trade, 'id' | 'status' | 'openDate'>) => void;
  onClose: () => void;
  prefillData?: Partial<Omit<Trade, 'id' | 'status' | 'openDate'>> | null;
}

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

const QuickTradeModal: React.FC<QuickTradeModalProps> = ({ onAddTrade, onClose, prefillData }) => {
  const [quantity, setQuantity] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { asset, direction, entryPrice } = prefillData || {};

  // Suggest some default SL/TP values based on price and direction
  useEffect(() => {
    if (entryPrice && direction) {
        const isLong = direction === 'LONG';
        const priceMove = entryPrice * 0.02; // 2% move for suggestion
        const suggestedSL = isLong ? entryPrice - priceMove : entryPrice + priceMove;
        const suggestedTP = isLong ? entryPrice + (priceMove * 2) : entryPrice - (priceMove * 2); // 1:2 RR
        
        const pricePrecision = entryPrice > 100 ? 2 : 4;
        setStopLoss(suggestedSL.toFixed(pricePrecision));
        setTakeProfit(suggestedTP.toFixed(pricePrecision));
    }
  }, [entryPrice, direction]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!asset || !direction || !entryPrice) {
        setError("Trade data is missing. Please close and try again.");
        return;
    }

    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    const qty = parseFloat(quantity);

    if (isNaN(sl) || sl <= 0 || isNaN(tp) || tp <= 0 || isNaN(qty) || qty <= 0) {
      setError("Please fill in all fields with valid positive numbers.");
      return;
    }
    
    if (direction === 'LONG' && (entryPrice <= sl || tp <= entryPrice)) {
      setError("For a LONG trade, entry price must be above stop loss, and TP must be above entry.");
      return;
    }

    if (direction === 'SHORT' && (entryPrice >= sl || tp >= entryPrice)) {
      setError("For a SHORT trade, entry price must be below stop loss, and TP must be below entry.");
      return;
    }

    const finalTPs: TakeProfit[] = [{
      level: 1,
      price: tp,
      hit: false
    }];

    const risk = Math.abs(((entryPrice - sl) / entryPrice) * 100);

    onAddTrade({
      asset,
      direction,
      entryPrice,
      quantity: qty,
      stopLoss: sl,
      takeProfits: finalTPs,
      riskPercentage: parseFloat(risk.toFixed(2)),
    });
  }, [asset, direction, entryPrice, quantity, stopLoss, takeProfit, onAddTrade]);
  
  if (!asset || !direction || !entryPrice) return null;

  const isLong = direction === 'LONG';

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
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className={`p-6 border-b border-white/10 border-t-4 rounded-t-lg ${isLong ? 'border-t-accent-green' : 'border-t-accent-red'}`}>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-text-primary">Quick Trade</h2>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isLong ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                    {direction}
                </span>
            </div>
            <p className="text-sm text-text-secondary">{asset} @ ${entryPrice.toLocaleString()}</p>
          </div>
          <div className="p-6 space-y-4">
             <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-text-secondary mb-1">Quantity / Size</label>
                <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 0.1 or 100" className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" step="any" required autoFocus />
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="stopLoss" className="block text-sm font-medium text-text-secondary mb-1">Stop Loss</label>
                <input type="number" id="stopLoss" value={stopLoss} onChange={e => setStopLoss(e.target.value)} className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" step="any" required />
              </div>
               <div>
                <label htmlFor="takeProfit" className="block text-sm font-medium text-text-secondary mb-1">Take Profit</label>
                <input type="number" id="takeProfit" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" step="any" required />
              </div>
            </div>
            {error && <p className="text-sm text-accent-red bg-accent-red/10 p-3 rounded-md">{error}</p>}
          </div>
          <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-white/10">
            <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Cancel</motion.button>
            <motion.button type="submit" whileTap={{ scale: 0.95 }} className={`py-2 px-5 rounded-md text-white font-semibold transition-colors ${isLong ? 'bg-accent-green hover:bg-accent-greenHover' : 'bg-accent-red hover:bg-accent-redHover'}`}>
              Confirm {direction}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default QuickTradeModal;