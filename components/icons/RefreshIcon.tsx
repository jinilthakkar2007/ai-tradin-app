
import React from 'react';

interface RefreshIconProps {
    className?: string;
}

const RefreshIcon: React.FC<RefreshIconProps> = ({ className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0115.2 4.1L20 12M4 12l.8 1.9A9 9 0 0019.1 15" />
    </svg>
);

export default RefreshIcon;
