import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Trade } from '../types';
import JournalIcon from './icons/JournalIcon';

interface JournalModalProps {
  trade: Trade;
  onClose: () => void;
  onAddNote: (note: string) => void;
}

// FIX: Explicitly type backdropVariants with the Variants type from framer-motion.
const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

// FIX: Explicitly type modalVariants with the Variants type from framer-motion.
const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const JournalModal = ({ trade, onClose, onAddNote }: JournalModalProps) => {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
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
        className="bg-glass border border-white/10 rounded-lg shadow-2xl w-full max-w-lg"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <JournalIcon />
            <h2 className="text-xl font-semibold text-text-primary">Trade Journal</h2>
          </div>
          <div className="text-sm text-text-secondary mt-1 flex items-center gap-2">
            <span>{trade.asset}</span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isLong ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>{trade.direction}</span>
          </div>
        </div>
        
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          {trade.journal && trade.journal.length > 0 ? (
            <div className="space-y-4">
              {[...trade.journal].reverse().map((entry, index) => (
                <div key={index} className="bg-surface p-3 rounded-md border border-border">
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{entry.note}</p>
                  <p className="text-xs text-text-dim mt-2 text-right">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary py-8">No journal entries yet. Add your first note below.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 border-t border-white/10 bg-surface/50 rounded-b-lg">
          <label htmlFor="new-note" className="block text-sm font-medium text-text-secondary mb-1">Add New Note</label>
          <textarea
            id="new-note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="e.g., 'Price is consolidating near resistance...'"
            className="w-full bg-surface border border-border text-text-primary rounded-md p-2 h-20 focus:ring-2 focus:ring-brand focus:border-brand"
            required
          />
          <div className="flex justify-end gap-3 mt-4">
            <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Close</motion.button>
            <motion.button type="submit" whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">Save Note</motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default JournalModal;