import React, { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { Trade, TakeProfit } from '../types';
import PlusIcon from './icons/PlusIcon';

interface EditTradeModalProps {
  trade: Trade;
  onUpdateTrade: (trade: Trade) => void;
  onSimulateOutcome: (tradeId: string) => void;
  onClose: () => void;
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

const EditTradeModal: React.FC<EditTradeModalProps> = ({ trade, onUpdateTrade, onSimulateOutcome, onClose }) => {
  const [stopLoss, setStopLoss] = useState(trade.stopLoss.toString());
  const [takeProfits, setTakeProfits] = useState<string[]>(trade.takeProfits.map(tp => tp.price.toString()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStopLoss(trade.stopLoss.toString());
    setTakeProfits(trade.takeProfits.map(tp => tp.price.toString()));
  }, [trade]);

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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { entryPrice, direction } = trade;
    const sl = parseFloat(stopLoss);
    const tps = takeProfits.map(p => parseFloat(p)).filter(p => !isNaN(p) && p > 0);

    if (isNaN(sl) || sl <= 0 || tps.length === 0) {
      setError("Please fill in all fields with valid positive numbers.");
      return;
    }

    if (direction === 'LONG' && (entryPrice <= sl || tps.some(tp => tp <= entryPrice))) {
      setError("For a LONG trade, entry price must be above stop loss, and TPs must be above entry.");
      return;
    }

    if (direction === 'SHORT' && (entryPrice >= sl || tps.some(tp => tp >= entryPrice))) {
      setError("For a SHORT trade, entry price must be below stop loss, and TPs must be below entry.");
      return;
    }
    
    const finalTPs: TakeProfit[] = tps.map((price, i) => ({
      level: i + 1,
      price,
      hit: trade.takeProfits[i]?.hit || false // Preserve hit status of existing TPs if any
    }));

    const risk = Math.abs(((entryPrice - sl) / entryPrice) * 100);

    const updatedTrade: Trade = {
      ...trade,
      stopLoss: sl,
      takeProfits: finalTPs,
      riskPercentage: parseFloat(risk.toFixed(2)),
    };

    onUpdateTrade(updatedTrade);

  }, [stopLoss, takeProfits, trade, onUpdateTrade]);

  const handleSimulateClick = () => {
    if (window.confirm(`This will immediately close the trade for ${trade.asset} with a random outcome (TP or SL) and discard any unsaved changes. Are you sure?`)) {
        onSimulateOutcome(trade.id);
    }
  };

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
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-text-primary">Edit Trade: {trade.asset}</h2>
            <p className="text-sm text-text-secondary">Entry: ${trade.entryPrice.toLocaleString()} ({trade.direction})</p>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="stopLoss" className="block text-sm font-medium text-text-secondary mb-1">Stop Loss</label>
              <input type="number" id="stopLoss" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="e.g., 67000.00" className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand" step="any" required />
            </div>
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
            {error && <p className="text-sm text-accent-red bg-accent-red/10 p-3 rounded-md">{error}</p>}
          </div>
          <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-white/10">
            <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Cancel</motion.button>
            <motion.button type="button" onClick={handleSimulateClick} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-surface border border-accent-yellow/50 text-accent-yellow hover:bg-accent-yellow/10 rounded-md font-semibold transition-colors">Simulate Outcome</motion.button>
            <motion.button type="submit" whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">Save Changes</motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditTradeModal;