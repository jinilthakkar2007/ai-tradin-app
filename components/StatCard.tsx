

import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tooltip?: string;
  isCurrency?: boolean;
  intent?: 'positive' | 'negative' | 'neutral';
}

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const StatCard = ({ icon, label, value, tooltip, intent = 'neutral' }: StatCardProps) => {
    
    const intentClasses = {
        positive: {
            text: 'text-accent-green',
            icon: 'text-accent-green',
        },
        negative: {
            text: 'text-accent-red',
            icon: 'text-accent-red',
        },
        neutral: {
            text: 'text-text-primary',
            icon: 'text-text-secondary',
        }
    }[intent];

    return (
        <motion.div 
            className="bg-surface border border-border p-5 rounded-xl flex flex-col justify-between"
            title={tooltip}
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300 } }}
        >
            <div className="flex justify-between items-center">
                <p className="text-sm text-text-secondary font-medium">{label}</p>
                <div className={`text-lg ${intentClasses.icon}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className={`text-3xl font-bold tabular-nums mt-2 ${intentClasses.text}`}>
                    {value}
                </p>
            </div>
        </motion.div>
    );
};

export default StatCard;
