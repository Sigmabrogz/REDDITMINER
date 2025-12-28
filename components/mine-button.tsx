'use client';

import { motion } from 'framer-motion';
import { useMinerStore } from '@/lib/store';
import { isValidRedditUrl } from '@/lib/reddit';

interface MineButtonProps {
  onMine: () => void;
}

export function MineButton({ onMine }: MineButtonProps) {
  const { url, isLoading, loadingStep, progress } = useMinerStore();
  const isValid = isValidRedditUrl(url);

  const getButtonText = () => {
    switch (loadingStep) {
      case 'fetching':
        return 'Fetching...';
      case 'normalizing':
        return 'Processing...';
      case 'analyzing':
        return 'Analyzing...';
      default:
        return 'Mine Thread';
    }
  };

  return (
    <motion.button
      onClick={onMine}
      disabled={!isValid || isLoading}
      whileHover={isValid && !isLoading ? { y: -3, scale: 1.02 } : {}}
      whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
      className={`
        relative w-full py-4 px-6 rounded-xl font-semibold text-lg
        transition-all duration-200 overflow-hidden
        ${isValid && !isLoading
          ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)] cursor-pointer hover:shadow-[var(--shadow-glow-orange)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
        }
        border-2 border-transparent
      `}
      style={{
        borderColor: isValid ? 'var(--accent-primary)' : 'var(--border-subtle)',
      }}
    >
      {/* Progress bar background */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-[var(--accent-secondary)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          style={{ transformOrigin: 'left' }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {isLoading ? (
          <>
            {/* Spinner */}
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="25 75"
              />
            </motion.svg>
            {getButtonText()}
          </>
        ) : (
          <>
            {/* Pickaxe icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Mine Thread
          </>
        )}
      </span>
    </motion.button>
  );
}

