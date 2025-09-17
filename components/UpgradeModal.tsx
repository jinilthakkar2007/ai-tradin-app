import React from 'react';
// FIX: Import Variants to correctly type the animation variants.
import { motion, Variants } from 'framer-motion';

interface UpgradeModalProps {
    onClose: () => void;
    onUpgrade: () => void;
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


const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
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
                className="bg-glass border border-white/10 rounded-lg shadow-2xl w-full max-w-md text-center"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Upgrade to Premium</h2>
                    <p className="text-text-secondary mb-6">Unlock all features and take your trading to the next level with our AI-powered assistant.</p>
                    
                    <div className="bg-surface p-4 rounded-lg border border-border mb-6 text-left">
                         <ul className="space-y-2">
                            <li className="flex items-center gap-3 text-text-primary"><span className="text-accent-green">✔</span> Full access to the AI Trade Assistant</li>
                            <li className="flex items-center gap-3 text-text-primary"><span className="text-accent-green">✔</span> AI-generated trade setups</li>
                            <li className="flex items-center gap-3 text-text-primary"><span className="text-accent-green">✔</span> In-depth market analysis on demand</li>
                            <li className="flex items-center gap-3 text-text-primary"><span className="text-accent-green">✔</span> Priority support</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <span className="text-4xl font-bold text-text-primary">$9.99</span>
                        <span className="text-text-secondary">/ month</span>
                    </div>

                    <p className="text-xs text-text-dim mb-4">For this demo, clicking "Upgrade" will instantly unlock Premium features without actual payment.</p>
                </div>

                <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex flex-col sm:flex-row justify-end gap-3 border-t border-white/10">
                    <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={onClose} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Maybe Later</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={onUpgrade} className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">Upgrade Now</motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UpgradeModal;