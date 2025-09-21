

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { welcomeImageBase64 } from '../assets/welcome-image';
import TradeIcon from './icons/TradeIcon';
import BellIcon from './icons/BellIcon';
import SparklesIcon from './icons/SparklesIcon';
import LogoIcon from './icons/LogoIcon';

interface OnboardingModalProps {
  onComplete: () => void;
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

// FIX: Explicitly type contentVariants with the Variants type from framer-motion.
const contentVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.4 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const onboardingSteps = [
  {
    icon: <LogoIcon />,
    title: 'Welcome to AI Trades',
    description: 'Your intelligent dashboard for monitoring trades and receiving real-time alerts powered by AI.',
    image: welcomeImageBase64,
  },
  {
    icon: <TradeIcon />,
    title: 'Log Your Active Trades',
    description: 'Easily add your long or short positions, including entry price, stop loss, and multiple take-profit levels.',
  },
  {
    icon: <BellIcon />,
    title: 'Real-Time Monitoring & Alerts',
    description: 'We track market prices for you. Get instant notifications the moment a TP or SL is triggered.',
  },
  {
    icon: <SparklesIcon />,
    title: 'Gain Insights with AI Commentary',
    description: 'After a trade closes, our AI analyzes the outcome, providing concise, actionable commentary to refine your strategy.',
  },
  {
    icon: '🎉',
    title: "You're All Set!",
    description: "You're ready to start tracking your trades. Click the button below to jump into your dashboard.",
  },
];

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[101] p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-glass border border-white/10 rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        key="onboarding-modal"
      >
        <div className="p-8 text-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col items-center"
                >
                    <div className="mb-4 text-brand text-3xl flex items-center justify-center h-16 w-16 bg-brand/10 rounded-full">
                        {step.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">{step.title}</h2>
                    <p className="text-text-secondary h-16">{step.description}</p>
                </motion.div>
            </AnimatePresence>
        </div>

        <div className="px-8 pb-8">
            <div className="flex justify-center gap-2 mb-6">
                {onboardingSteps.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            currentStep === index ? 'bg-brand scale-125' : 'bg-border'
                        }`}
                    />
                ))}
            </div>

            <div className="flex justify-between items-center gap-4">
                <motion.button
                    onClick={handleBack}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={currentStep === 0}
                >
                    Back
                </motion.button>
                <motion.button
                    onClick={handleNext}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors"
                >
                    {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                </motion.button>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingModal;