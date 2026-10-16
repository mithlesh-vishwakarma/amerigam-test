import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTopLoader } from './top-loader';

interface InteractiveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function InteractiveLogo({
  className = '',
  size = 'md',
  showText = true,
}: InteractiveLogoProps) {
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

  const fontSizes = {
    sm: 19,
    md: 23,
    lg: 28,
  };

  const gaps = {
    sm: 8,
    md: 10,
    lg: 12,
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
        gap: `${gaps[size]}px`,
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <img
        src="/media/amerigam-logo-transparent.webp"
        alt="Amerigam"
        height={heights[size]}
        className="brand-logo-img"
        style={{
          height: `${heights[size]}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
        }}
      />
      {showText && (
        <span
          className="brand-logo-text"
          style={{
            color: '#ffffff',
            fontSize: `${fontSizes[size]}px`,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1,
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Amerigam
        </span>
      )}
    </Link>
  );
}
