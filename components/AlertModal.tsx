import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Alert, Trade } from '../types';
import { getAICommentary } from '../services/geminiService';

interface AlertModalProps {
  alert: Alert;
  onClose: () => void;
  trades: Trade[];
  onCommentaryFetched: (alertId: string, commentary: string) => void;
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

const AlertModal = ({ alert, onClose, trades, onCommentaryFetched }: AlertModalProps) => {
  const isSuccess = alert.type === 'success';
  const [commentary, setCommentary] = useState(alert.aiCommentary ?? '');
  const [loadingCommentary, setLoadingCommentary] = useState(!alert.aiCommentary);
  const [commentaryError, setCommentaryError] = useState<string | null>(null);

  useEffect(() => {
    if (alert.aiCommentary) {
      setCommentary(alert.aiCommentary);
      setLoadingCommentary(false);
      return;
    }
    
    if (alert.tradeId === 'system-global') {
        setCommentary('No commentary available for global price alerts.');
        setLoadingCommentary(false);
        return;
    }

    let isCancelled = false;

    const fetchCommentary = async () => {
      setLoadingCommentary(true);
      setCommentaryError(null);
      const relevantTrade = trades.find(t => t.id === alert.tradeId);

      if (!relevantTrade) {
        setCommentaryError("Could not find associated trade to generate analysis.");
        setLoadingCommentary(false);
        return;
      }

      try {
        const newCommentary = await getAICommentary(relevantTrade);
        if (!isCancelled) {
          setCommentary(newCommentary);
          onCommentaryFetched(alert.id, newCommentary);
        }
      } catch (error) {
        if (!isCancelled && error instanceof Error) {
          setCommentaryError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setLoadingCommentary(false);
        }
      }
    };

    fetchCommentary();

    return () => {
      isCancelled = true;
    };
  }, [alert.id, alert.tradeId, alert.aiCommentary, trades, onCommentaryFetched]);

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
        className="bg-glass border-t-4 rounded-lg shadow-2xl w-full max-w-lg border border-white/10"
        style={{ borderTopColor: isSuccess ? '#238636' : (alert.type === 'error' ? '#DA3633' : '#388BFD') }}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-accent-green/10' : (alert.type === 'error' ? 'bg-accent-red/10' : 'bg-brand/10')}`}>
              {isSuccess ? (
                <span className="text-2xl">✅</span>
              ) : ( alert.type === 'error' ?
                <span className="text-2xl">❌</span> :
                <span className="text-2xl">ℹ️</span>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-bold text-text-primary">Trade Alert: {alert.asset}</h3>
              <p className="text-sm text-text-secondary mt-1">{alert.message}</p>
              <p className="text-xs text-text-dim mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-3xl leading-none">&times;</button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-brand mb-2">🤖 AI Commentary</h4>
            <div className="bg-surface p-4 rounded-md border border-border min-h-[6rem] flex items-center justify-center">
              {loadingCommentary ? (
                <div className="flex items-center gap-2 text-text-secondary">
                    <div className="w-4 h-4 border-2 border-t-brand border-border rounded-full animate-spin"></div>
                    <span>Generating AI analysis...</span>
                </div>
              ) : commentaryError ? (
                  <p className="text-sm text-accent-red text-center">{commentaryError}</p>
              ) : (
                <p className="text-text-secondary whitespace-pre-wrap font-mono text-sm">
                  {commentary}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-end border-t border-white/10">
           <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onClose} 
            className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors"
          >
            Dismiss
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AlertModal;
