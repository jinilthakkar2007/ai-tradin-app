import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trade } from '../types';
import TradeList from './TradeList';
import TrashIcon from './icons/TrashIcon';
import CheckboxIcon from './icons/CheckboxIcon';

interface HistoryViewProps {
  tradeHistory: Trade[];
  onOpenJournal: (trade: Trade) => void;
  onDeleteTrades: (tradeIds: string[]) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ tradeHistory, onOpenJournal, onDeleteTrades }) => {
  const [selectedTradeIds, setSelectedTradeIds] = useState<Set<string>>(new Set());

  const handleToggleSelect = (tradeId: string) => {
    setSelectedTradeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tradeId)) {
        newSet.delete(tradeId);
      } else {
        newSet.add(tradeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTradeIds.size === tradeHistory.length) {
      setSelectedTradeIds(new Set());
    } else {
      setSelectedTradeIds(new Set(tradeHistory.map(t => t.id)));
    }
  };

  const handleDeleteSelected = () => {
    const idsToDelete = Array.from(selectedTradeIds);
    if (idsToDelete.length === 0) return;

    if (window.confirm(`Are you sure you want to permanently delete ${idsToDelete.length} trade(s)? This action cannot be undone.`)) {
      onDeleteTrades(idsToDelete);
      setSelectedTradeIds(new Set());
    }
  };

  const numSelected = selectedTradeIds.size;
  const allSelected = numSelected === tradeHistory.length && tradeHistory.length > 0;
  const someSelected = numSelected > 0 && !allSelected;
  const checkboxState = allSelected ? 'checked' : someSelected ? 'indeterminate' : 'unchecked';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-text-primary">Trade History</h1>
        <p className="text-text-secondary mt-1">Review all your past closed trades.</p>
      </motion.div>

      <motion.div 
        className="bg-surface border border-border rounded-lg p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
      >
        {tradeHistory.length > 0 && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <button onClick={handleSelectAll} className="flex items-center gap-2 p-1 group">
              <CheckboxIcon state={checkboxState} />
              <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                {allSelected ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>
        )}
        <TradeList
          trades={tradeHistory}
          prices={{}} // No live prices needed for history
          // FIX: Removed unsupported 'isHistory' prop. The TradeItem component correctly determines
          // if a trade is historical based on its 'status' property.
          onOpenJournal={onOpenJournal}
          selectedTradeIds={selectedTradeIds}
          onToggleSelect={handleToggleSelect}
        />
      </motion.div>

       <AnimatePresence>
        {numSelected > 0 && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md z-40"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="bg-glass border border-white/10 rounded-xl shadow-2xl p-3 flex items-center justify-between mx-4">
              <span className="text-sm font-semibold text-text-primary">{numSelected} selected</span>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setSelectedTradeIds(new Set())}
                  whileTap={{ scale: 0.95 }}
                  className="py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded-md text-text-secondary font-semibold transition-colors text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteSelected}
                  whileTap={{ scale: 0.95 }}
                  className="py-1.5 px-3 bg-accent-red hover:bg-accent-redHover rounded-md text-white font-semibold transition-colors text-sm flex items-center gap-1.5"
                >
                  <TrashIcon />
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryView;