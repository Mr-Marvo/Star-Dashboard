import React from 'react';

const EntryIcon = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M3.33301 9.99998C3.33301 6.85728 3.33301 5.28593 4.30932 4.30962C5.28563 3.33331 6.85698 3.33331 9.99967 3.33331C13.1424 3.33331 14.7137 3.33331 15.69 4.30962C16.6663 5.28593 16.6663 6.85728 16.6663 9.99998C16.6663 13.1427 16.6663 14.714 15.69 15.6903C14.7137 16.6666 13.1424 16.6666 9.99967 16.6666C6.85698 16.6666 5.28563 16.6666 4.30932 15.6903C3.33301 14.714 3.33301 13.1427 3.33301 9.99998Z" stroke="#1C274C" />
        <path d="M13.333 3.66669L13.333 16.3334" stroke="#1C274C" strokeLinecap="round" />
        <path d="M6.66699 3.66669L6.66699 16.3334" stroke="#1C274C" strokeLinecap="round" />
        <path d="M3.66699 6.66669L6.66699 6.66669M16.3337 6.66669L13.3337 6.66669" stroke="#1C274C" strokeLinecap="round" />
        <path d="M3.66699 13.3333L6.66699 13.3333M16.3337 13.3333L13.3337 13.3333" stroke="#1C274C" strokeLinecap="round" />
        <path d="M3.33301 10H16.6663" stroke="#1C274C" strokeLinecap="round" />
    </svg>
);

export default EntryIcon;
