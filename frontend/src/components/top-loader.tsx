import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface TopLoaderContextType {
  startLoading: () => void;
  stopLoading: () => void;
  triggerPulse: () => void;
  isLoading: boolean;
}

const TopLoaderContext = createContext<TopLoaderContextType>({
  startLoading: () => {},
  stopLoading: () => {},
  triggerPulse: () => {},
  isLoading: false,
});

export function useTopLoader() {
  return useContext(TopLoaderContext);
}

export function TopLoaderProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const location = useLocation();
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  const triggerPulse = useCallback(() => {
    clearAllTimers();
    setVisible(true);
    setProgress(15);

    timerRef.current.push(
      setTimeout(() => setProgress(45), 100),
      setTimeout(() => setProgress(80), 280),
      setTimeout(() => setProgress(100), 500),
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 850)
    );
  }, []);

  const startLoading = useCallback(() => {
    clearAllTimers();
    setVisible(true);
    setProgress(20);

    timerRef.current.push(
      setTimeout(() => setProgress(50), 200),
      setTimeout(() => setProgress(75), 600),
      setTimeout(() => setProgress(88), 1200)
    );
  }, []);

  const stopLoading = useCallback(() => {
    setProgress(100);
    timerRef.current.push(
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350)
    );
  }, []);

  // Trigger blue line loader on route navigation
  useEffect(() => {
    triggerPulse();
    return () => clearAllTimers();
  }, [location.pathname, triggerPulse]);

  return (
    <TopLoaderContext.Provider value={{ startLoading, stopLoading, triggerPulse, isLoading: visible }}>
      <TopLoaderBar visible={visible} progress={progress} />
      {children}
    </TopLoaderContext.Provider>
  );
}

function TopLoaderBar({ visible, progress }: { visible: boolean; progress: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Page loading"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
      }}
    >
      <motion.div
        initial={{ width: '0%' }}
        animate={{
          width: `${progress}%`,
        }}
        transition={{
          ease: [0.16, 1, 0.3, 1],
          duration: 0.35,
        }}
        style={{
          position: 'relative',
          height: '100%',
          background: 'linear-gradient(90deg, #0077ff 0%, #00a8ed 50%, #38bdf8 85%, #60a5fa 100%)',
          boxShadow: '0 0 12px rgba(0, 168, 237, 0.9), 0 0 4px rgba(56, 189, 248, 1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '-2px',
            width: '100px',
            height: '7px',
            background: 'radial-gradient(ellipse at right center, rgba(255, 255, 255, 0.95) 0%, rgba(56, 189, 248, 0.8) 40%, transparent 80%)',
            boxShadow: '0 0 10px #00e5ff',
          }}
        />
      </motion.div>
    </div>
  );
}
