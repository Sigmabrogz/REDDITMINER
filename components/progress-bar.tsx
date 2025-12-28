'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  step: 'idle' | 'fetching' | 'normalizing' | 'analyzing';
}

const steps = [
  { id: 'fetching', label: 'Fetching from Reddit', icon: '🌐' },
  { id: 'normalizing', label: 'Processing comments', icon: '⚙️' },
  { id: 'analyzing', label: 'Extracting signals', icon: '🔍' },
];

export function ProgressBar({ step }: ProgressBarProps) {
  const currentStepIndex = steps.findIndex(s => s.id === step);
  const progress = step === 'idle' ? 0 : ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto text-center"
    >
      {/* Animated pickaxe */}
      <motion.div
        animate={{ rotate: [-10, 10, -10] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-4xl mb-4"
      >
        ⛏️
      </motion.div>

      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        Mining thread...
      </h3>

      {/* Progress bar */}
      <div className="relative h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[var(--accent-primary)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Steps checklist */}
      <div className="mt-6 space-y-3 text-left">
        {steps.map((s, index) => {
          const isActive = s.id === step;
          const isComplete = currentStepIndex > index;
          const isPending = currentStepIndex < index;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                ${isActive ? 'bg-[var(--bg-tertiary)]' : ''}
              `}
            >
              {/* Status icon */}
              <div className="w-6 h-6 flex items-center justify-center">
                {isComplete ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[var(--success)]"
                  >
                    ✓
                  </motion.span>
                ) : isActive ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {s.icon}
                  </motion.span>
                ) : (
                  <span className="text-[var(--text-muted)]">○</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-sm font-medium
                  ${isComplete ? 'text-[var(--text-secondary)]' : ''}
                  ${isActive ? 'text-[var(--text-primary)]' : ''}
                  ${isPending ? 'text-[var(--text-muted)]' : ''}
                `}
              >
                {s.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto text-xs text-[var(--accent-primary)]"
                >
                  in progress...
                </motion.div>
              )}

              {/* Complete indicator */}
              {isComplete && (
                <span className="ml-auto text-xs text-[var(--success)]">
                  done
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xs text-[var(--text-muted)]"
      >
        💡 Large threads may take a few seconds
      </motion.p>
    </motion.div>
  );
}
