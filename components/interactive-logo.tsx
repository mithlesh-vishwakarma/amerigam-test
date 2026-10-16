'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopLoader } from './top-loader';
import logoAsset from '@/app/media/amerigam-logo-transparent.webp';

interface InteractiveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

export function InteractiveLogo({ className = '', size = 'md', priority = true }: InteractiveLogoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { triggerPulse } = useTopLoader();
  const [clickRipples, setClickRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Calculate click coordinates for interactive ripple
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now();

    setClickRipples((prev) => [...prev.slice(-2), { id: rippleId, x, y }]);
    setTimeout(() => {
      setClickRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 700);

    // Trigger the top horizontal blue line loader
    triggerPulse();

    // If already on /home, smoothly scroll to top
    if (pathname === '/home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const heights = {
    sm: 30,
    md: 38,
    lg: 46,
  };

  return (
    <Link
      href="/home"
      onClick={handleClick}
      aria-label="Amerigam Home"
      className={`interactive-brand-link ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <motion.div
        className="interactive-logo-container"
        whileHover={{
          scale: 1.05,
          filter: 'drop-shadow(0 0 10px rgba(0, 168, 237, 0.45)) brightness(1.1)',
        }}
        whileTap={{
          scale: 0.92,
          rotate: -1.5,
          filter: 'drop-shadow(0 0 14px rgba(0, 168, 237, 0.7)) brightness(1.2)',
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 22,
          mass: 0.8,
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '6px 10px',
          borderRadius: '12px',
          cursor: 'pointer',
        }}
      >
        {/* Click ripple / aura wave using framer-motion */}
        <AnimatePresence>
          {clickRipples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0.2, opacity: 0.85 }}
              animate={{ scale: 2.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: ripple.x,
                top: ripple.y,
                width: 40,
                height: 40,
                marginLeft: -20,
                marginTop: -20,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.75) 0%, rgba(0, 168, 237, 0.3) 60%, transparent 100%)',
                boxShadow: '0 0 16px rgba(0, 168, 237, 0.8)',
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>

        {/* Logo loaded directly from app/media */}
        <Image
          src={logoAsset}
          alt="Amerigam"
          height={heights[size]}
          width={heights[size] * 2.3}
          priority={priority}
          style={{
            height: `${heights[size]}px`,
            width: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 2px 6px rgba(0, 168, 237, 0.2))',
            transition: 'filter 0.2s ease',
          }}
        />
      </motion.div>
    </Link>
  );
}
