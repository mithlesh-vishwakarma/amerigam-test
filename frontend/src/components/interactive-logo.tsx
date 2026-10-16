import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTopLoader } from './top-loader';

interface InteractiveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InteractiveLogo({ className = '', size = 'md' }: InteractiveLogoProps) {
  const location = useLocation();
  const { triggerPulse } = useTopLoader();

  const handleClick = () => {
    triggerPulse();
    if (location.pathname === '/home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const heights = {
    sm: 28,
    md: 34,
    lg: 42,
  };

  return (
    <Link
      to="/home"
      onClick={handleClick}
      aria-label="Amerigam Home"
      className={`brand-logo-link ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <img
        src="/media/amerigam-logo-transparent.webp"
        alt="Amerigam"
        height={heights[size]}
        style={{
          height: `${heights[size]}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Link>
  );
}
