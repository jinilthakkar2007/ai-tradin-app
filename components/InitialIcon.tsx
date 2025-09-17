import React from 'react';

interface InitialIconProps {
  email: string;
  className?: string;
}

const getInitials = (email: string): string => {
  if (!email) return '?';
  const namePart = email.split('@')[0];
  if (!namePart) return email[0]?.toUpperCase() || '?';

  // Try splitting by common separators
  const parts = namePart.split(/[._-]/);
  if (parts.length > 1 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  // Fallback to the first two letters of the name part
  return namePart.substring(0, 2).toUpperCase();
};

const InitialIcon: React.FC<InitialIconProps> = ({ email, className = 'w-8 h-8' }) => {
  const initials = getInitials(email);

  // Generate a consistent color based on the email
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 50%, 40%)`;

  return (
    <div 
      className={`flex items-center justify-center rounded-full text-white font-bold ${className}`}
      style={{ backgroundColor: color }}
    >
      <span>{initials}</span>
    </div>
  );
};

export default InitialIcon;