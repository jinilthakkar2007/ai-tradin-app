import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { UserSettings } from '../types';

interface SettingsModalProps {
  settings: UserSettings;
  onClose: () => void;
  onSave: (newSettings: UserSettings) => void;
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

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const SettingsModal = ({ settings, onClose, onSave }: SettingsModalProps) => {
  const [currentSettings, setCurrentSettings] = useState<UserSettings>(settings);

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  const handleCheckboxChange = (category: 'notifications' | 'chart', key: string, value: boolean) => {
    setCurrentSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleNumberChange = (category: 'chart', key: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
        setCurrentSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: numValue,
            },
        }));
    }
  };

  const Toggle: React.FC<{ label: string; isChecked: boolean; onChange: (checked: boolean) => void; }> = ({ label, isChecked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer p-3 bg-surface rounded-md border border-border hover:border-brand/50 transition-colors">
      <span className="text-text-primary">{label}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={isChecked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`block w-10 h-6 rounded-full transition-colors ${isChecked ? 'bg-brand' : 'bg-border'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isChecked ? 'transform translate-x-4' : ''}`}></div>
      </div>
    </label>
  );

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
        className="bg-glass border border-white/10 rounded-lg shadow-2xl w-full max-w-lg"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-text-primary">User Settings</h2>
        </div>
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* General Settings */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-3">General</h3>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-text-secondary mb-1">Default Currency</label>
              <select 
                id="currency" 
                value={currentSettings.defaultCurrency} 
                onChange={e => setCurrentSettings(prev => ({ ...prev, defaultCurrency: e.target.value as UserSettings['defaultCurrency'] }))} 
                className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-3">Notifications</h3>
            <div className="space-y-3">
              <Toggle label="TP/SL Hit Alerts" isChecked={currentSettings.notifications.tradeAlerts} onChange={(val) => handleCheckboxChange('notifications', 'tradeAlerts', val)} />
              <Toggle label="AI Commentary Ready" isChecked={currentSettings.notifications.aiCommentary} onChange={(val) => handleCheckboxChange('notifications', 'aiCommentary', val)} />
              <Toggle label="Market News Updates" isChecked={currentSettings.notifications.marketNews} onChange={(val) => handleCheckboxChange('notifications', 'marketNews', val)} />
            </div>
          </section>

          {/* Chart Settings */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-3">Chart Preferences</h3>
            <div className="space-y-3">
              <Toggle label="Show Moving Average (MA) by Default" isChecked={currentSettings.chart.defaultMA} onChange={(val) => handleCheckboxChange('chart', 'defaultMA', val)} />
              <Toggle label="Show RSI by Default" isChecked={currentSettings.chart.defaultRSI} onChange={(val) => handleCheckboxChange('chart', 'defaultRSI', val)} />
               <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                    <label htmlFor="maPeriod" className="block text-sm font-medium text-text-secondary mb-1">Default MA Period</label>
                    <input 
                        type="number" 
                        id="maPeriod" 
                        value={currentSettings.chart.maPeriod} 
                        onChange={e => handleNumberChange('chart', 'maPeriod', e.target.value)} 
                        className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        min="1"
                    />
                </div>
                <div>
                    <label htmlFor="rsiPeriod" className="block text-sm font-medium text-text-secondary mb-1">Default RSI Period</label>
                    <input 
                        type="number" 
                        id="rsiPeriod" 
                        value={currentSettings.chart.rsiPeriod} 
                        onChange={e => handleNumberChange('chart', 'rsiPeriod', e.target.value)} 
                        className="w-full bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        min="1"
                    />
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="bg-surface/50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-white/10">
          <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-white/5 hover:bg-white/10 rounded-md text-text-primary font-semibold transition-colors">Cancel</motion.button>
          <motion.button type="button" onClick={handleSave} whileTap={{ scale: 0.95 }} className="py-2 px-5 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors">Save Settings</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;