import React from 'react';
import { View, User } from '../types';
import { motion } from 'framer-motion';

import LogoIcon from './icons/LogoIcon';
import MarketIcon from './icons/MarketIcon';
import ChartIcon from './icons/ChartIcon';
import PieChartIcon from './icons/PieChartIcon';
import BellIcon from './icons/BellIcon';
import ChatIcon from './icons/ChatIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import UserProfile from './UserProfile';
import FlaskIcon from './icons/FlaskIcon';
import CopyIcon from './icons/CopyIcon';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  user: User;
  onLogout: () => void;
  onShowSettings: () => void;
  onShowAccount: () => void;
  alertCount: number;
}

const navItems = [
    { view: 'dashboard' as const, icon: <ChartIcon />, label: 'Dashboard', premium: false },
    { view: 'portfolio' as const, icon: <PieChartIcon />, label: 'Portfolio', premium: false },
    { view: 'market' as const, icon: <MarketIcon />, label: 'Market', premium: false },
    { view: 'alerts' as const, icon: <BellIcon />, label: 'Alerts', premium: false },
    { view: 'copy-trading' as const, icon: <CopyIcon />, label: 'Copy Trading', premium: true },
    { view: 'chatbot' as const, icon: <ChatIcon />, label: 'AI Chatbot', premium: true },
    { view: 'strategy' as const, icon: <BrainCircuitIcon />, label: 'Strategy AI', premium: true },
    { view: 'backtesting' as const, icon: <FlaskIcon />, label: 'Backtesting', premium: true },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, user, onLogout, onShowSettings, onShowAccount, alertCount }) => {
    const isPremium = user.subscriptionTier === 'Premium';

    const NavButton: React.FC<{
        view: View;
        icon: React.ReactNode;
        label: string;
        isPremiumFeature?: boolean;
        count?: number;
    }> = ({ view, icon, label, isPremiumFeature, count }) => {
        const isActive = activeView === view;
        const isDisabled = isPremiumFeature && !isPremium;

        return (
            <motion.button
                onClick={() => onNavigate(view)}
                disabled={isDisabled}
                className={`relative w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors duration-200 group text-text-secondary hover:text-text-primary
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-label={label}
                whileTap={{ scale: 0.98 }}
            >
                {isActive && (
                    <motion.span
                        layoutId="active-pill"
                        className="absolute inset-0 bg-brand/10"
                        style={{ borderRadius: 8 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                )}
                <span className={`relative z-10 transition-colors ${isActive ? 'text-text-primary' : ''}`}>{icon}</span>
                <span className={`relative z-10 font-semibold transition-colors ${isActive ? 'text-text-primary' : ''}`}>{label}</span>
                {isPremiumFeature && !isPremium && (
                    <span className="absolute right-2 text-xs bg-accent-yellow/20 text-accent-yellow px-2 py-0.5 rounded-full z-10">
                        PRO
                    </span>
                )}
                {count !== undefined && count > 0 && (
                    <span className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-red text-xs font-bold text-white z-10">
                        {count}
                    </span>
                )}
            </motion.button>
        );
    };

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col p-4 sticky top-0">
        <div className="flex items-center gap-3 mb-8 px-2">
            <LogoIcon />
            <h1 className="text-xl font-bold text-text-primary">AI Trades</h1>
        </div>
      
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
              <NavButton 
                key={item.view} 
                view={item.view} 
                icon={item.icon} 
                label={item.label} 
                isPremiumFeature={item.premium} 
                count={item.view === 'alerts' ? alertCount : undefined}
              />
          ))}
        </nav>

        <div className="mt-auto">
            <UserProfile user={user} onLogout={onLogout} onShowAccount={onShowAccount} onShowSettings={onShowSettings}/>
        </div>
    </aside>
  );
};

export default Sidebar;