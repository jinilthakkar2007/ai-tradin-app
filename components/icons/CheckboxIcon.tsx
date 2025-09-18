import React from 'react';
// FIX: Replace incorrect 'require' with a standard ES module import for framer-motion.
import { motion } from 'framer-motion';

interface CheckboxIconProps {
  state: 'checked' | 'unchecked' | 'indeterminate';
}

const CheckboxIcon: React.FC<CheckboxIconProps> = ({ state }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
      <rect x="1.5" y="1.5" width="17" height="17" rx="4.5" 
        className={state !== 'unchecked' ? "fill-brand stroke-brand" : "stroke-border fill-surface group-hover:stroke-brand/50"} 
        strokeWidth="2"
      />
      {state === 'checked' && (
        <motion.path 
            d="M6 10.5L9 13.5L14.5 8" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2 }}
        />
      )}
      {state === 'indeterminate' && (
        <motion.path 
            d="M6 10H14" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
        />
      )}
    </svg>
  );
};

export default CheckboxIcon;
