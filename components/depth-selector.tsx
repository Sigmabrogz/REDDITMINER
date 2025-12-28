'use client';

import { motion } from 'framer-motion';
import { useMinerStore } from '@/lib/store';
import { DepthLevel } from '@/lib/schemas';

const depths: { id: DepthLevel; label: string; desc: string; estimate: string }[] = [
  { id: 'top', label: 'Quick Scan', desc: 'Top comments only', estimate: '~50 comments • fastest' },
  { id: 'level2', label: 'Standard', desc: 'With direct replies', estimate: '~200 comments • recommended' },
  { id: 'full', label: 'Deep Dive', desc: 'Complete thread', estimate: '500+ comments • slower' },
];

export function DepthSelector() {
  const { depth, setDepth, isLoading } = useMinerStore();

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
        Comment Depth
      </label>
      
      <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--border-subtle)]">
        {depths.map((d) => (
          <motion.button
            key={d.id}
            onClick={() => setDepth(d.id)}
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex-1 py-2 px-3 rounded-md transition-colors duration-150
              ${depth === d.id 
                ? 'text-[var(--text-inverse)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Background pill */}
            {depth === d.id && (
              <motion.div
                layoutId="depth-pill"
                className="absolute inset-0 bg-[var(--accent-tertiary)] rounded-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            
            <span className="relative z-10 font-medium text-sm">{d.label}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Description with estimate */}
      <motion.div
        key={depth}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 flex items-center justify-between"
      >
        <span className="text-xs text-[var(--text-muted)]">
          {depths.find(d => d.id === depth)?.desc}
        </span>
        <span className="text-xs text-[var(--accent-tertiary)] font-mono">
          {depths.find(d => d.id === depth)?.estimate}
        </span>
      </motion.div>
    </div>
  );
}
