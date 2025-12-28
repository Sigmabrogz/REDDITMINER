'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMinerStore } from '@/lib/store';

// Validation result type
interface ValidationResult {
  valid: boolean;
  message: string | null;
}

// Validate Reddit URL with specific feedback
function validateRedditUrl(url: string): ValidationResult {
  if (!url || url.length === 0) {
    return { valid: false, message: null }; // Empty, no message
  }

  if (url.length < 10) {
    return { valid: false, message: null }; // Still typing
  }

  // Check if it's even a URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { valid: false, message: 'URL must start with https://' };
  }

  // Check if it's Reddit
  if (!url.includes('reddit.com')) {
    return { valid: false, message: 'This doesn\'t look like a Reddit URL' };
  }

  // Check if it's a subreddit page (not a thread)
  if (url.includes('/r/') && !url.includes('/comments/')) {
    return { valid: false, message: 'This is a subreddit page. Paste a specific thread URL' };
  }

  // Check if it's a thread URL
  if (!url.includes('/comments/')) {
    return { valid: false, message: 'Paste a Reddit thread URL (should contain /comments/)' };
  }

  // Final regex check
  const REDDIT_URL_REGEX = /^https?:\/\/(www\.|old\.|new\.)?reddit\.com\/r\/[\w]+\/comments\/[\w]+/;
  if (!REDDIT_URL_REGEX.test(url)) {
    return { valid: false, message: 'Invalid Reddit thread URL format' };
  }

  return { valid: true, message: null };
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function URLInput() {
  const { url, setUrl, isLoading } = useMinerStore();
  const [localUrl, setLocalUrl] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, message: null });

  // Debounce the URL for store sync (300ms)
  const debouncedUrl = useDebounce(localUrl, 300);

  // Sync debounced URL to store
  useEffect(() => {
    setUrl(debouncedUrl);
  }, [debouncedUrl, setUrl]);

  // Validate on every local change (instant feedback)
  useEffect(() => {
    setValidation(validateRedditUrl(localUrl));
  }, [localUrl]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUrl(e.target.value);
  }, []);

  // Handle paste - common use case
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    // Get the pasted text directly from clipboard
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      // Set immediately with the pasted content
      setLocalUrl(pastedText);
    }
  }, []);

  const showError = validation.message && !validation.valid && localUrl.length > 15;
  const showSuccess = validation.valid && localUrl.length > 20;

  return (
    <div className="relative w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
        Reddit Thread URL
      </label>
      
      {/* Input container */}
      <motion.div
        className="relative"
        animate={showError ? { x: [0, -4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <input
          type="url"
          value={localUrl}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          placeholder="https://reddit.com/r/startups/comments/..."
          className="input pr-12"
          style={{
            borderColor: showError
              ? 'var(--error)' 
              : showSuccess
                ? 'var(--success)' 
                : isFocused 
                  ? 'var(--accent-primary)' 
                  : undefined,
          }}
        />
        
        {/* Validation icon */}
        <AnimatePresence mode="wait">
          {(showSuccess || showError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showSuccess ? (
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none"
                  className="text-[var(--success)]"
                >
                  <path 
                    d="M16.667 5L7.5 14.167 3.333 10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none"
                  className="text-[var(--error)]"
                >
                  <path 
                    d="M15 5L5 15M5 5l10 10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Helper text with specific error messages */}
      <AnimatePresence>
        {showError && validation.message && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-[var(--error)] mt-2"
          >
            {validation.message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Success hint */}
      <AnimatePresence>
        {showSuccess && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-[var(--success)] mt-2"
          >
            ✓ Valid Reddit thread URL
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
