import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Alert } from '../types';
import Toast from './Toast';

interface ToastContainerProps {
    toasts: Alert[];
    onDismiss: (id: string) => void;
    onShowAlert: (alert: Alert) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss, onShowAlert }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-3">
            <AnimatePresence initial={false}>
                {toasts.map(toast => (
                    <Toast key={toast.id} alert={toast} onDismiss={onDismiss} onShowAlert={onShowAlert} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
