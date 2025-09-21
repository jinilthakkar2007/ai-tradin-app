import React from 'react';
import { motion } from 'framer-motion';
import { Alert } from '../types';

interface AlertItemProps {
  alert: Alert;
  onClick: () => void;
}

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const AlertItem = ({ alert, onClick }: AlertItemProps) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const borderColorClass = {
    success: 'border-accent-green',
    error: 'border-accent-red',
    info: 'border-brand',
  }[alert.type];

  return (
    <motion.div
      whileHover={{ scale: 1.015, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-surface p-4 rounded-lg shadow-md cursor-pointer border-l-4 ${borderColorClass} flex items-center gap-4 transition-all duration-200 hover:bg-border hover:shadow-xl relative`}
      role="button"
      tabIndex={0}
      aria-label={`View alert for ${alert.asset}`}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      {!alert.read && (
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand" title="Unread"></span>
          </span>
      )}
      <div className="flex-shrink-0 text-xl">{getIcon()}</div>
      <div className="flex-grow">
        <p className="font-semibold text-text-primary">{alert.asset}</p>
        <p className="text-sm text-text-secondary">{alert.message}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-text-dim">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p className="text-xs text-text-dim">{new Date(alert.timestamp).toLocaleDateString()}</p>
      </div>
    </motion.div>
  );
};

export default AlertItem;