'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMinerStore } from '@/lib/store';

export function AdvancedOptions() {
  const [isOpen, setIsOpen] = useState(false);
  const { sort, setSort, maxComments, setMaxComments, minScore, setMinScore, isLoading } = useMinerStore();

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
        Advanced Options
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* Sort */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  disabled={isLoading}
                  className="input text-sm py-2"
                >
                  <option value="best">Best</option>
                  <option value="top">Top</option>
                  <option value="new">New</option>
                  <option value="controversial">Controversial</option>
                </select>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-70">
                  Reddit API sort order
                </p>
              </div>

              {/* Max Comments */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Limit Results
                </label>
                <select
                  value={maxComments}
                  onChange={(e) => setMaxComments(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="input text-sm py-2"
                >
                  <option value={50}>50 comments</option>
                  <option value={100}>100 comments</option>
                  <option value={200}>200 comments</option>
                  <option value={500}>500 comments</option>
                </select>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-70">
                  Truncates after fetch
                </p>
              </div>

              {/* Min Score */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Min Upvotes
                </label>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="input text-sm py-2"
                >
                  <option value={0}>All comments</option>
                  <option value={2}>2+ upvotes</option>
                  <option value={5}>5+ upvotes</option>
                  <option value={10}>10+ upvotes</option>
                  <option value={25}>25+ upvotes</option>
                  <option value={50}>50+ upvotes</option>
                </select>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-70">
                  Filters low-quality noise
                </p>
              </div>
            </div>
            
            {/* Honest disclaimer */}
            <p className="text-[10px] text-[var(--text-muted)] mt-4 pt-3 border-t border-[var(--border-subtle)] opacity-60">
              💡 These options filter results after Reddit returns data. Reddit's API limits to ~500 comments per request.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
