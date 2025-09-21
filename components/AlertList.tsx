import React from 'react';
// FIX: Import Variants to correctly type the animation variants.
import { motion, Variants } from 'framer-motion';
import { Alert } from '../types';
import AlertItem from './AlertItem';

interface AlertListProps {
  alerts: Alert[];
  onShowAlert: (alert: Alert) => void;
}

// FIX: Explicitly type containerVariants with the Variants type from framer-motion.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// FIX: Explicitly type itemVariants with the Variants type from framer-motion.
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 14
    },
  },
};

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const AlertList = ({ alerts, onShowAlert }: AlertListProps) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-surface/50 border-2 border-dashed border-border p-12 rounded-lg text-center text-text-secondary mt-4">
        <p className="text-lg font-medium">No alerts match the current filters.</p>
        <p className="mt-2">Try adjusting your filter settings or wait for a new alert.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {alerts.map((alert) => (
        <motion.div key={alert.id} variants={itemVariants}>
          <AlertItem alert={alert} onClick={() => onShowAlert(alert)} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AlertList;