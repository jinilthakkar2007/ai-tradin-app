import React from 'react';
import { motion } from 'framer-motion';
import ChatIcon from './icons/ChatIcon';

interface UpgradeToPremiumProps {
  onUpgradeClick: () => void;
}

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const UpgradeToPremium = ({ onUpgradeClick }: UpgradeToPremiumProps) => {
  return (
    <div className="bg-surface border-2 border-dashed border-brand/30 p-8 rounded-lg text-center shadow-glow-brand">
      <div className="mb-4 inline-block p-4 bg-brand/10 rounded-full text-brand">
         <ChatIcon />
      </div>
      <h3 className="text-2xl font-bold text-text-primary mb-2">Unlock the AI Trade Assistant</h3>
      <p className="text-text-secondary max-w-md mx-auto mb-6">
        Upgrade to Premium to get real-time market analysis, AI-generated trade setups, and conversational trading capabilities.
      </p>
      <ul className="text-left max-w-xs mx-auto space-y-2 mb-8 text-text-primary">
        <li className="flex items-center gap-3">
          <span className="text-accent-green">✔</span> <span>Interactive Market Analysis</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-accent-green">✔</span> <span>AI-Powered Trade Setups</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-accent-green">✔</span> <span>Direct Conversational Trading</span>
        </li>
      </ul>
      <motion.button
        onClick={onUpgradeClick}
        className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-lg transition-transform duration-200"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        Upgrade to Premium
      </motion.button>
    </div>
  );
};

export default UpgradeToPremium;