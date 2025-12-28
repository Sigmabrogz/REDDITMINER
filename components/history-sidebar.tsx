'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory, clearHistory, HistoryItem } from '@/lib/utils';
import { useMinerStore } from '@/lib/store';

export function HistorySidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const { setUrl } = useMinerStore();

  // Only run on client after hydration
  useEffect(() => {
    setMounted(true);
    setHistory(getHistory());
  }, []);

  // Refresh history when sidebar opens
  useEffect(() => {
    if (isOpen && mounted) {
      setHistory(getHistory());
    }
  }, [isOpen, mounted]);

  const handleSelectThread = (url: string) => {
    setUrl(url);
    setIsOpen(false);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  // Don't show button if no history
  if (history.length === 0 && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          fixed bottom-6 left-6 z-40 p-3 rounded-full shadow-lg
          transition-colors duration-200
          ${isOpen 
            ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)]' 
            : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }
          border-2 border-[var(--border-default)]
        `}
        title="Recent threads"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 6v4l2.5 2.5M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {history.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-primary)] text-[var(--text-inverse)] text-xs rounded-full flex items-center justify-center">
            {history.length}
          </span>
        )}
      </motion.button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] z-50
                bg-[var(--bg-secondary)] border-r-2 border-[var(--border-default)]
                flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b-2 border-[var(--border-subtle)] flex items-center justify-between">
                <h2 className="font-semibold text-[var(--text-primary)]">Recent Threads</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M15 5L5 15M5 5l10 10"
                      stroke="var(--text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* History list */}
              <div className="flex-1 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-muted)]">
                    <p>No recent threads</p>
                    <p className="text-xs mt-1">Mined threads will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {history.map((item, index) => (
                      <motion.button
                        key={item.url}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectThread(item.url)}
                        className="w-full p-4 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-[var(--accent-tertiary)] text-sm font-medium shrink-0">
                            r/{item.subreddit}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-primary)] mt-1 line-clamp-2">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
                          <span>{item.commentCount} comments</span>
                          <span>•</span>
                          <span>{new Date(item.minedAt).toLocaleDateString()}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {history.length > 0 && (
                <div className="p-4 border-t-2 border-[var(--border-subtle)]">
                  <button
                    onClick={handleClearHistory}
                    className="w-full py-2 text-sm text-[var(--error)] hover:bg-[var(--error)] hover:bg-opacity-10 rounded transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
