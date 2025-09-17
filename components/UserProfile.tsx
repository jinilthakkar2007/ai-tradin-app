import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import UserIcon from './icons/UserIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import LogoutIcon from './icons/LogoutIcon';
import InitialIcon from './InitialIcon';
import SettingsIcon from './icons/SettingsIcon';

interface UserProfileProps {
  user: User; // User is now non-nullable
  onLogout: () => void;
  onShowAccount: () => void;
  onShowSettings: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onShowAccount, onShowSettings }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user.name || user.email.split('@')[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-1.5 rounded-full bg-background-surface hover:bg-background-light border border-transparent hover:border-background-light transition-colors"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
      >
        {user.picture ? (
           <img
            src={user.picture}
            alt="User avatar"
            className="w-8 h-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <InitialIcon email={user.email} />
        )}
       
        <span className="hidden sm:inline font-semibold text-text-primary">{displayName}</span>
        <ChevronDownIcon />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background-surface border border-background-light rounded-md shadow-lg z-50 py-1">
          <div className="px-4 py-3 border-b border-background-light">
            <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { onShowAccount(); setDropdownOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-primary hover:bg-background-light transition-colors"
          >
            <UserIcon />
            <span>Account Info</span>
          </button>
           <button
            onClick={() => { onShowSettings(); setDropdownOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-primary hover:bg-background-light transition-colors"
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>
          <div className="my-1 border-t border-background-light"></div>
          <button
            onClick={() => { onLogout(); setDropdownOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-accent-red hover:bg-background-light transition-colors"
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;