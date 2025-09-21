import React from 'react';
import { View } from '../types';
import PlusIcon from './icons/PlusIcon';
import ChartIcon from './icons/ChartIcon';
import HistoryIcon from './icons/HistoryIcon';
import BellIcon from './icons/BellIcon';
import ChatIcon from './icons/ChatIcon';

interface HeaderProps {
  onNewTrade: () => void;
  onNavigate: (view: View) => void;
  activeView: View;
  alertCount: number;
}

const Header: React.FC<HeaderProps> = ({ onNewTrade, onNavigate, activeView, alertCount }) => {
  const NavButton: React.FC<{
    view: View;
    icon: React.ReactNode;
    label: string;
    count?: number;
  }> = ({ view, icon, label, count }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
        activeView === view
          ? 'bg-brand text-text-primary'
          : 'text-text-secondary hover:bg-border'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-red text-xs font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <header className="bg-surface shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-text-primary">AI Trade Alerts</h1>
            <nav className="flex items-center space-x-2 bg-background p-1 rounded-xl">
              <NavButton view="chatbot" icon={<ChatIcon />} label="Chatbot" />
              <NavButton view="dashboard" icon={<ChartIcon />} label="Dashboard" />
              <NavButton view="history" icon={<HistoryIcon />} label="History" />
              <NavButton view="alerts" icon={<BellIcon />} label="Alerts" count={alertCount} />
            </nav>
          </div>
          <div className="flex items-center">
            <button
              onClick={onNewTrade}
              className="flex items-center justify-center bg-accent-green hover:bg-accent-greenHover text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
            >
              <PlusIcon />
              <span className="ml-2 hidden sm:inline">New Trade</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;