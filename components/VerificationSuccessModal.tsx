
import React, { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

interface VerificationSuccessModalProps {
  onContinue: () => void;
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

const VerificationSuccessModal = ({ onContinue }: VerificationSuccessModalProps) => {
    // Auto-continue after a few seconds for a smoother UX
    useEffect(() => {
        const timer = setTimeout(() => {
            onContinue();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onContinue]);
    
    return (
        <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[101] p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <motion.div
                className="bg-glass border border-white/10 rounded-lg shadow-2xl w-full max-w-sm"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <div className="p-8 text-center flex flex-col items-center">
                    <motion.div
                        className="mb-4 text-accent-green"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Verification Successful!</h2>
                    <p className="text-text-secondary mb-6">
                        You're all set up. Welcome aboard! Redirecting you to the dashboard...
                    </p>
                    <motion.button
                        onClick={onContinue}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors"
                    >
                        Enter Dashboard
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default VerificationSuccessModal;
