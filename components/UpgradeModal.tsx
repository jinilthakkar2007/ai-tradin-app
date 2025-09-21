import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import CreditCardIcon from './icons/CreditCardIcon';
import PayPalIcon from './icons/PayPalIcon';

interface UpgradeModalProps {
    onClose: () => void;
    onUpgrade: () => void;
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

// FIX: Explicitly type stepVariants with the Variants type from framer-motion.
const stepVariants: Variants = {
  hidden: { opacity: 0, x: 30, position: 'absolute' as 'absolute' },
  visible: { opacity: 1, x: 0, position: 'relative' as 'relative' },
  exit: { opacity: 0, x: -30, position: 'absolute' as 'absolute' },
};

const LoadingSpinner = () => (
    <motion.div 
        className="w-12 h-12 border-4 border-t-brand border-border rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
);

const SuccessCheckmark = () => (
    <motion.svg
        className="w-16 h-16 text-accent-green"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
    </motion.svg>
);


// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const UpgradeModal = ({ onClose, onUpgrade }: UpgradeModalProps) => {
    const [step, setStep] = useState<'plan' | 'method' | 'card_details' | 'processing' | 'success'>('plan');
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'paypal' | null>(null);

    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
    const [formError, setFormError] = useState('');

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'number') {
            formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
        }
        if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
            if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
        }
        if (name === 'cvc') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 4) formattedValue = formattedValue.slice(0, 4);
        }
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    };

    const validateCardDetails = (): boolean => {
        if (cardDetails.number.length !== 19) {
            setFormError('Please enter a valid 16-digit card number.');
            return false;
        }
        const [month, year] = cardDetails.expiry.split('/');
        if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry) || parseInt(month) > 12 || parseInt(month) < 1) {
            setFormError('Please enter a valid expiry date (MM/YY).');
            return false;
        }
        if (cardDetails.cvc.length < 3 || cardDetails.cvc.length > 4) {
            setFormError('Please enter a valid CVC.');
            return false;
        }
        setFormError('');
        return true;
    };

    const handlePayment = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (selectedMethod === 'card' && !validateCardDetails()) {
            return;
        }
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onUpgrade();
            }, 1500);
        }, 2500);
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
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative min-h-[450px] flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                        {step === 'plan' && (
                            <motion.div key="plan" variants={stepVariants} initial="visible" animate="visible" exit="exit" className="w-full">
                                <div className="p-8 text-center">
                                    <h2 className="text-2xl font-bold text-text-primary mb-2">Upgrade to Premium</h2>
                                    <p className="text-text-secondary mb-6">Unlock all features and take your trading to the next level.</p>
                                    
                                    <div className="bg-surface p-4 rounded-lg border border-border mb-6 text-left">
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-3 text-text-primary"><span className="text-accent-green">✔</span> Full access to the AI Trade Assistant</li>
                                            <li className="flex items-center gap-3 text-text-primary"><span className="text-accent-green">✔</span> AI-generated trade setups & Copy Trading</li>
                                            <li className="flex items-center gap-3 text-text-primary"><span className="text-accent-green">✔</span> Strategy Builder & Backtesting Tools</li>
                                            <li className="flex items-center gap-3 text-text-primary"><span className="text-accent-green">✔</span> Priority support</li>
                                        </ul>
                                    </div>
                                    <p className="text-xs text-text-dim mb-4">You will not be charged for this demo.</p>
                                </div>

                                <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex flex-col sm:flex-row justify-end gap-3 border-t border-white/10">
                                    <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={onClose} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Maybe Later</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => setStep('method')} className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">Upgrade for $9.99/mo</motion.button>
                                </div>
                            </motion.div>
                        )}
                        
                        {step === 'method' && (
                             <motion.div key="method" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                                <div className="p-8">
                                    <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">Select Payment Method</h2>
                                    <p className="text-text-secondary mb-8 text-center">Complete your secure transaction.</p>
                                    <div className="space-y-4">
                                        <button onClick={() => { setSelectedMethod('card'); setStep('card_details'); }} className="w-full flex items-center gap-4 p-4 bg-surface rounded-lg border-2 border-border hover:border-brand transition-colors">
                                            <CreditCardIcon />
                                            <span className="font-semibold text-text-primary">Credit or Debit Card</span>
                                        </button>
                                        <button onClick={() => { setSelectedMethod('paypal'); handlePayment(); }} className="w-full flex items-center gap-4 p-4 bg-surface rounded-lg border-2 border-border hover:border-brand transition-colors">
                                            <PayPalIcon />
                                            <span className="font-semibold text-text-primary">PayPal</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-white/10">
                                    <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => setStep('plan')} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Back</motion.button>
                                </div>
                             </motion.div>
                        )}

                        {step === 'card_details' && (
                             <motion.form key="card_details" onSubmit={handlePayment} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                                <div className="p-8">
                                    <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">Card Details</h2>
                                    <p className="text-text-secondary mb-6 text-center">Enter your card information to upgrade.</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-text-secondary mb-1 block text-left">Card Number</label>
                                            <input type="text" name="number" value={cardDetails.number} onChange={handleCardInputChange} placeholder="0000 0000 0000 0000" required className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-text-secondary mb-1 block text-left">Expiry (MM/YY)</label>
                                                <input type="text" name="expiry" value={cardDetails.expiry} onChange={handleCardInputChange} placeholder="MM/YY" required className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-text-secondary mb-1 block text-left">CVC</label>
                                                <input type="text" name="cvc" value={cardDetails.cvc} onChange={handleCardInputChange} placeholder="123" required className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand" />
                                            </div>
                                        </div>
                                        {formError && <p className="text-sm text-accent-red mt-2">{formError}</p>}
                                    </div>
                                </div>
                                <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-between gap-3 border-t border-white/10">
                                    <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => setStep('method')} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Back</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">Pay $9.99</motion.button>
                                </div>
                             </motion.form>
                        )}
                        
                        {(step === 'processing' || step === 'success') && (
                             <motion.div key="status" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex flex-col items-center justify-center flex-grow p-8">
                                {step === 'processing' ? (
                                    <>
                                        <LoadingSpinner />
                                        <h2 className="text-xl font-semibold text-text-primary mt-4">Processing Payment...</h2>
                                        <p className="text-text-secondary">Please do not close this window.</p>
                                    </>
                                ) : (
                                    <>
                                        <SuccessCheckmark />
                                        <h2 className="text-xl font-semibold text-text-primary mt-4">Payment Successful!</h2>
                                        <p className="text-text-secondary">Your account has been upgraded to Premium.</p>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UpgradeModal;