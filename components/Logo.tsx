import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* App icon base */}
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="6"
        fill="url(#gradient)"
      />
      {/* Lens/scope overlay */}
      <circle
        cx="16"
        cy="16"
        r="8"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.9"
      />
      <circle
        cx="16"
        cy="16"
        r="4"
        fill="white"
        opacity="0.7"
      />
      {/* Corner accent */}
      <rect
        x="20"
        y="8"
        width="4"
        height="4"
        rx="1"
        fill="white"
        opacity="0.8"
      />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;

