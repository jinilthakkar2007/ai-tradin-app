import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Alert } from '../types';
import AlertFilters from './AlertFilters';
import AlertList from './AlertList';

interface AlertsViewProps {
  alerts: Alert[];
  onShowAlert: (alert: Alert) => void;
}

type AlertTypeFilter = 'all' | 'success' | 'error' | 'info';
type ReadStatusFilter = 'all' | 'unread';

const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onShowAlert }) => {
  const [typeFilter, setTypeFilter] = useState<AlertTypeFilter>('all');
  const [readStatusFilter, setReadStatusFilter] = useState<ReadStatusFilter>('all');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const typeMatch = typeFilter === 'all' || alert.type === typeFilter;
      const readMatch = readStatusFilter === 'all' || (readStatusFilter === 'unread' && !alert.read);
      return typeMatch && readMatch;
    });
  }, [alerts, typeFilter, readStatusFilter]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
        <p className="text-text-secondary mt-1">Review all your trade alerts and AI-powered notifications.</p>
      </motion.div>

      <motion.div 
        className="bg-background-surface border border-background-light rounded-lg p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">All Alerts</h2>
            <AlertFilters 
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                readStatusFilter={readStatusFilter}
                onReadStatusChange={setReadStatusFilter}
            />
        </div>
        <AlertList alerts={filteredAlerts} onShowAlert={onShowAlert} />
      </motion.div>
    </div>
  );
};

export default AlertsView;
