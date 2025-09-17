import React from 'react';
import { motion } from 'framer-motion';
import { ProTrader } from '../types';
import { proTraderService } from '../services/proTraderService';
import UpgradeToPremium from './UpgradeToPremium';
import ProTraderCard from './ProTraderCard';

interface CopyTradingViewProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
  copiedTraders: Set<string>;
  onToggleCopy: (traderId: string) => void;
}

const CopyTradingView: React.FC<CopyTradingViewProps> = ({ isPremium, onUpgradeClick, copiedTraders, onToggleCopy }) => {
  if (!isPremium) {
    return (
      <div className="flex items-center justify-center h-full">
        <UpgradeToPremium onUpgradeClick={onUpgradeClick} />
      </div>
    );
  }
  
  const proTraders = proTraderService.getProTraders();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-text-primary">Copy Trading</h1>
        <p className="text-text-secondary mt-1">Automatically mirror the trades of professional traders.</p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {proTraders.map(trader => (
          <ProTraderCard 
            key={trader.id} 
            trader={trader}
            isCopying={copiedTraders.has(trader.id)}
            onToggleCopy={onToggleCopy}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default CopyTradingView;
