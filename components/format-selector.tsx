'use client';

import { motion } from 'framer-motion';
import { useMinerStore } from '@/lib/store';
import { OutputFormat } from '@/lib/schemas';

const formats: { id: OutputFormat; label: string; desc: string }[] = [
  { id: 'raw', label: 'RAW', desc: 'Original Reddit JSON' },
  { id: 'clean', label: 'CLEAN', desc: 'Normalized schema' },
  { id: 'markdown', label: 'MD', desc: 'Readable markdown' },
  { id: 'insights', label: 'INTEL', desc: 'AI analysis' },
];

export function FormatSelector() {
  const { format, setFormat, isLoading } = useMinerStore();

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
        Output Format
      </label>
      
      <div className="grid grid-cols-4 gap-2">
        {formats.map((f) => (
          <motion.button
            key={f.id}
            onClick={() => setFormat(f.id)}
            disabled={isLoading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-3 rounded-lg border-2 transition-colors duration-150
              ${format === f.id 
                ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--text-inverse)]' 
                : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="font-mono font-semibold text-sm">{f.label}</span>
            <span className={`
              block text-xs mt-1
              ${format === f.id ? 'text-[var(--text-inverse)] opacity-80' : 'text-[var(--text-muted)]'}
            `}>
              {f.desc}
            </span>
            
            {/* Active indicator */}
            {format === f.id && (
              <motion.div
                layoutId="format-indicator"
                className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent-secondary)] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

