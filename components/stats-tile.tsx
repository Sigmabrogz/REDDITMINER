'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatsTileProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: 'orange' | 'yellow' | 'teal' | 'purple';
  delay?: number;
}

export function StatsTile({ label, value, icon, color = 'orange', delay = 0 }: StatsTileProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Count-up animation
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const colorClasses = {
    orange: 'border-[var(--accent-primary)] text-[var(--accent-primary)]',
    yellow: 'border-[var(--accent-secondary)] text-[var(--accent-secondary)]',
    teal: 'border-[var(--accent-tertiary)] text-[var(--accent-tertiary)]',
    purple: 'border-[var(--accent-purple)] text-[var(--accent-purple)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`
        flex flex-col items-center justify-center p-4 rounded-xl
        bg-[var(--bg-secondary)] border-2 ${colorClasses[color]}
      `}
    >
      <div className="mb-2 opacity-80">
        {icon}
      </div>
      <motion.span
        key={displayValue}
        className="text-3xl font-bold font-mono"
      >
        {displayValue.toLocaleString()}
      </motion.span>
      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">
        {label}
      </span>
    </motion.div>
  );
}

// Pre-built icons for common stats
export const StatsIcons = {
  comments: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  signals: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  exports: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  depth: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18M9 17V9M13 17V5M17 17v-3" />
    </svg>
  ),
};

