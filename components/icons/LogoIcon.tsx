import React from 'react';

const LogoIcon: React.FC = () => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
    >
        <path
            d="M4 28V4L14.4 14.4L28 4V28L17.6 17.6L4 28Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
        />
        <path
            d="M20.8 14.4L28 21.6V4L20.8 11.2V14.4Z"
            fill="currentColor"
            fillOpacity="0.3"
        />
    </svg>
);

export default LogoIcon;
