import React, { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Alert } from '../types';

interface ToastProps {
    alert: Alert;
    onDismiss: (id: string) => void;
    onShowAlert: (alert: Alert) => void;
}
    
const toastVariants: Variants = {
    hidden: { opacity: 0, x: 100, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, x: 50, scale: 0.8, transition: { duration: 0.3, ease: 'easeOut' } }
};

const Toast: React.FC<ToastProps> = ({ alert, onDismiss, onShowAlert }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(alert.id);
        }, 4000); // Auto-dismiss after 4 seconds

        return () => clearTimeout(timer);
    }, [alert.id, onDismiss]);
    
    const getIcon = () => {
        switch (alert.type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'info': return 'ℹ️';
            default: return '🔔';
        }
    };
    
    const borderColorClass = {
        success: 'border-accent-green',
        error: 'border-accent-red',
        info: 'border-accent-blue',
    }[alert.type];

    const handleToastClick = () => {
        onShowAlert(alert);
    };

    return (
        <motion.div
            layout
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`w-full bg-background-surface rounded-lg shadow-2xl overflow-hidden border-l-4 ${borderColorClass} flex items-start cursor-pointer`}
            onClick={handleToastClick}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex-shrink-0 text-xl p-4">{getIcon()}</div>
            <div className="flex-grow py-3 pr-2">
                <p className="font-semibold text-text-primary text-sm">{alert.asset}</p>
                <p className="text-sm text-text-secondary">{alert.message}</p>
                <p className="text-xs text-text-secondary mt-1">Click to view details</p>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(alert.id);
                }}
                className="p-2 text-text-dim hover:text-text-primary transition-colors"
                aria-label="Dismiss notification"
            >
                &times;
            </button>
        </motion.div>
    );
};

export default Toast;