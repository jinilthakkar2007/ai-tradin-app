import React, { useState, useCallback } from 'react';
// FIX: Import Variants to correctly type the animation variants.
import { motion, Variants } from 'framer-motion';
import { Trade, TradeDirection } from '../types';
import { ASSET_SYMBOLS } from '../constants';
import PlusIcon from './icons/PlusIcon';

interface NewTradeFormProps {
  onAddTrade: (trade: Omit<Trade, 'id' | 'status' | 'openDate'>, reasoning?: string) => void;
  onAddAndSimulate: (trade: Omit<Trade, 'id' | 'status' | 'openDate'>, reasoning?: string) => void;
  onClose: () => void;
  prefillData?: Partial<Omit<Trade, 'id' | 'status' | 'openDate'>> | null;
}

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

// FIX: Explicitly type modalVariants with the Variants type from framer-motion.
const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

const NewTradeForm: React.FC<NewTradeFormProps> = ({ onAddTrade, onAddAndSimulate, onClose, prefillData }) => {
  const [asset, setAsset] = useState(prefillData?.asset || ASSET_SYMBOLS[0]);
  const [direction, setDirection] = useState<TradeDirection>(prefillData?.direction || 'LONG');
  const [entryPrice, setEntryPrice] = useState(prefillData?.entryPrice?.toString() || '');
  const [quantity, setQuantity] = useState(prefillData?.quantity?.toString() || '');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfits, setTakeProfits] = useState<string[]>(['']);
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTpChange = (index: number, value: string) => {
    const newTps = [...takeProfits];
    newTps[index] = value;
    setTakeProfits(newTps);
  };

  const addTpField = () => {
    if (takeProfits.length < 5) {
      setTakeProfits([...takeProfits, '']);
    }
  };

  const removeTpField = (index: number) => {
    if (takeProfits.length > 1) {
      const newTps = takeProfits.filter((_, i) => i !== index);
      setTakeProfits(newTps);
    }
  };

  const handleTradeCreation = useCallback((callback: (tradeData: Omit<Trade, 'id' | 'status' | 'openDate'>, reasoning?: string) => void) => {
    setError(null);

    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const qty = parseFloat(quantity);
    const tps = takeProfits.map(p => parseFloat(p)).filter(p => !isNaN(p) && p > 0);

    if (isNaN(entry) || entry <= 0 || isNaN(sl) || sl <= 0 || isNaN(qty) || qty <= 0 || tps.length === 0) {
      setError("Please fill in all required fields with valid positive numbers.");
      return;
    }

    if (direction === 'LONG' && (entry <= sl || tps.some(tp => tp <= entry))) {
      setError("For a LONG trade, entry price must be above stop loss, and TPs must be above entry.");
      return;
    }

    if (direction === 'SHORT' && (entry >= sl || tps.some(tp => tp >= entry))) {
      setError("For a SHORT trade, entry price must be below stop loss, and TPs must be below entry.");
      return;
    }

    const finalTPs = tps.map((price, i) => ({
      level: i + 1,
      price,
      hit: false
    }));

    const risk = Math.abs(((entry - sl) / entry) * 100);

    callback({
      asset,
      direction,
      entryPrice: entry,
      quantity: qty,
      stopLoss: sl,
      takeProfits: finalTPs,
      riskPercentage: parseFloat(risk.toFixed(2)),
    }, reasoning.trim());
  }, [asset, direction, entryPrice, quantity, stopLoss, takeProfits, reasoning]);
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleTradeCreation(onAddTrade);
  }

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
        className="bg-glass border border-white/10 rounded-lg shadow-2xl w-full max-w-md"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-text-primary">Log New Trade</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Asset & Direction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="asset" className="block text-sm font-medium text-text-secondary mb-1">Asset</label>
                <select id="asset" value={asset} onChange={e => setAsset(e.target.value)} className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand">
                  {ASSET_SYMBOLS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Direction</label>
                <div className="flex bg-surface border border-border rounded-md p-0.5">
                  <button type="button" onClick={() => setDirection('LONG')} className={`flex-1 py-1.5 text-sm rounded ${direction === 'LONG' ? 'bg-accent-green text-white' : 'text-text-secondary'}`}>LONG</button>
                  <button type="button" onClick={() => setDirection('SHORT')} className={`flex-1 py-1.5 text-sm rounded ${direction === 'SHORT' ? 'bg-accent-red text-white' : 'text-text-secondary'}`}>SHORT</button>
                </div>
              </div>
            </div>
             {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="entryPrice" className="block text-sm font-medium text-text-secondary mb-1">Entry Price</label>
                <input type="number" id="entryPrice" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="e.g., 68500.00" className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" step="any" required />
              </div>
               <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-text-secondary mb-1">Quantity / Size</label>
                <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 0.1 or 100" className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" step="any" required />
              </div>
            </div>
            <div>
                <label htmlFor="stopLoss" className="block text-sm font-medium text-text-secondary mb-1">Stop Loss</label>
                <input type="number" id="stopLoss" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="e.g., 67000.00" className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" step="any" required />
              </div>
            {/* Take Profits */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Take Profit Levels</label>
              <div className="space-y-2">
                {takeProfits.map((tp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="number" value={tp} onChange={e => handleTpChange(index, e.target.value)} placeholder={`TP ${index + 1} Price`} className="flex-grow bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" step="any" required />
                    {takeProfits.length > 1 && (
                      <button type="button" onClick={() => removeTpField(index)} className="p-2 text-text-secondary hover:text-accent-red rounded-full bg-border">&times;</button>
                    )}
                  </div>
                ))}
              </div>
              {takeProfits.length < 5 && (
                 <button type="button" onClick={addTpField} className="flex items-center gap-2 text-sm text-brand hover:text-brand-hover mt-2">
                  <PlusIcon /> Add Another TP
                </button>
              )}
            </div>
             {/* Reasoning */}
            <div>
              <label htmlFor="reasoning" className="block text-sm font-medium text-text-secondary mb-1">Reason for Trade (Optional)</label>
              <textarea
                id="reasoning"
                value={reasoning}
                onChange={e => setReasoning(e.target.value)}
                placeholder="e.g., 'Entering on bullish divergence signal on 4H chart...'"
                className="w-full bg-surface border border-border text-text-primary rounded-md p-2 h-20 focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>
            {error && <p className="text-sm text-accent-red bg-accent-red/10 p-3 rounded-md">{error}</p>}
          </div>
          <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-white/10">
            <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Cancel</motion.button>
            <motion.button type="button" onClick={() => handleTradeCreation(onAddAndSimulate)} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-surface border border-accent-yellow/50 text-accent-yellow hover:bg-accent-yellow/10 rounded-md font-semibold transition-colors">Add & Simulate</motion.button>
            <motion.button type="submit" whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">Add Trade</motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewTradeForm;