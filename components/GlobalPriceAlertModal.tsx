
import React, { useState, useCallback, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { MarketData, GlobalPriceAlert, AlertCondition } from '../types';
import TrashIcon from './icons/TrashIcon';

interface GlobalPriceAlertModalProps {
  data: {
    asset: MarketData;
    alert?: GlobalPriceAlert;
  };
  onClose: () => void;
  onSave: (alertData: Omit<GlobalPriceAlert, 'createdAt'>) => void;
  onDelete: (alertId: string) => void;
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

const GlobalPriceAlertModal = ({ data, onClose, onSave, onDelete }: GlobalPriceAlertModalProps) => {
  const { asset, alert } = data;
  const isEditing = !!alert;

  const [price, setPrice] = useState(alert?.price.toString() || '');
  const [condition, setCondition] = useState<AlertCondition>(alert?.condition || 'ABOVE');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alert && asset.price) {
      setPrice(asset.price.toFixed(2));
    }
  }, [alert, asset]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid positive price.');
      return;
    }

    onSave({
      id: alert?.id || `gpa-${Date.now()}`,
      asset: asset.symbol,
      price: priceValue,
      condition,
    });
  }, [price, condition, asset.symbol, alert, onSave]);

  const handleDelete = () => {
    if (alert && window.confirm(`Are you sure you want to delete the price alert for ${asset.symbol}?`)) {
        onDelete(alert.id);
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
        className="bg-glass border border-white/10 rounded-lg shadow-2xl w-full max-w-sm"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-text-primary">Set Price Alert</h2>
            <p className="text-sm text-text-secondary">
              {asset.symbol} - Current Price: ${asset.price.toLocaleString()}
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Alert me when the price is:
              </label>
              <div className="flex bg-surface border border-border rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`flex-1 py-1.5 text-sm rounded ${condition === 'ABOVE' ? 'bg-accent-green text-white' : 'text-text-secondary'}`}
                >
                  Above
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`flex-1 py-1.5 text-sm rounded ${condition === 'BELOW' ? 'bg-accent-red text-white' : 'text-text-secondary'}`}
                >
                  Below
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-1">
                Target Price
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 69000.00"
                className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand"
                step="any"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-accent-red bg-accent-red/10 p-3 rounded-md">{error}</p>}
          </div>
          <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-between items-center gap-3 border-t border-white/10">
            <div>
              {isEditing && (
                <motion.button
                  type="button"
                  onClick={handleDelete}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-accent-red/10 hover:bg-accent-red/20 rounded-md text-accent-red font-semibold transition-colors"
                  title="Delete Alert"
                >
                  <TrashIcon />
                </motion.button>
              )}
            </div>
            <div className="flex gap-3">
                <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
                className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors"
                >
                Cancel
                </motion.button>
                <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors"
                >
                {isEditing ? 'Update Alert' : 'Set Alert'}
                </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default GlobalPriceAlertModal;
