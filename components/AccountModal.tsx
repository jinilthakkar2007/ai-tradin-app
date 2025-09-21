import React from 'react';
// FIX: Import Variants to correctly type the animation variants.
import { motion, Variants } from 'framer-motion';
import { User, UserStats } from '../types';
import InitialIcon from './InitialIcon';

interface AccountModalProps {
  user: User;
  stats: UserStats;
  onClose: () => void;
  onOpenUpgradeModal: () => void;
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
const AccountModal = ({ user, stats, onClose, onOpenUpgradeModal }: AccountModalProps) => {
  const isPremium = user.subscriptionTier === 'Premium';
  const displayName = user.name || user.email.split('@')[0];

  const StatCard: React.FC<{ label: string; value: string | number; color?: string; tooltip?: string; }> = ({ label, value, color, tooltip }) => (
    <div className="bg-surface p-4 rounded-lg border border-border text-center" title={tooltip}>
        <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold tabular-nums ${color || 'text-text-primary'}`}>{value}</p>
    </div>
  );

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
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-text-primary">Account Information</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col items-center text-center mb-6">
                {user.picture ? (
                    <img 
                        src={user.picture} 
                        alt="User avatar" 
                        className="w-24 h-24 rounded-full mb-4 border-2 border-brand"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <InitialIcon email={user.email} className="w-24 h-24 text-4xl mb-4 border-2 border-brand" />
                )}
                <p className="text-xl font-bold text-text-primary">{displayName}</p>
                <p className="text-text-secondary mt-1">{user.email}</p>
                 <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-semibold ${isPremium ? 'bg-accent-yellow/10 text-accent-yellow' : 'bg-brand/10 text-brand'}`}>
                    {user.subscriptionTier} Member
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary text-center">Performance Stats</h3>
                
                <StatCard 
                    label="Total P/L"
                    value={`${stats.totalPL >= 0 ? '+' : ''}$${stats.totalPL.toLocaleString()}`}
                    color={stats.totalPL >= 0 ? 'text-accent-green' : 'text-accent-red'}
                />

                <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Win Rate" value={`${stats.winRate}%`} />
                    <StatCard label="Total Trades" value={stats.totalTrades} />
                    <StatCard label="Avg. Win" value={`$${stats.avgWin.toLocaleString()}`} color="text-accent-green" />
                    <StatCard label="Avg. Loss" value={`$${stats.avgLoss.toLocaleString()}`} color="text-accent-red" />
                </div>
                 <StatCard 
                    label="Profit Factor" 
                    value={stats.profitFactor} 
                    tooltip="Gross Profit / Gross Loss. Higher is better." 
                />
            </div>
        </div>
        <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-white/10">
           {!isPremium ? (
              <>
                  <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose} 
                      className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors"
                  >
                      Close
                  </motion.button>
                  <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onOpenUpgradeModal} 
                      className="py-2 px-5 bg-accent-green hover:bg-accent-greenHover rounded-md text-white font-semibold transition-colors"
                  >
                      Upgrade Plan
                  </motion.button>
              </>
          ) : (
              <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose} 
                  className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors"
              >
                  Close
              </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccountModal;