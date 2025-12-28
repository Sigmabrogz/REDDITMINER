'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { copyToClipboard } from '@/lib/utils';

interface JSONViewerProps {
  data: object;
  title?: string;
}

export function JSONViewer({ data, title }: JSONViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    const success = await copyToClipboard(jsonString);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Custom theme matching our design system
  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'var(--bg-secondary)',
      margin: 0,
      padding: '16px',
      fontSize: '13px',
      lineHeight: '1.5',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: 'transparent',
      fontFamily: 'var(--font-mono)',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-secondary)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-3">
          {/* Collapse toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-[var(--bg-elevated)] rounded transition-colors"
          >
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </button>
          
          {title && (
            <span className="font-mono text-sm text-[var(--text-secondary)]">
              {title}
            </span>
          )}
          
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {(jsonString.length / 1024).toFixed(1)} KB
          </span>
        </div>

        {/* Copy button */}
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm
            bg-[var(--bg-secondary)] border border-[var(--border-default)]
            hover:border-[var(--accent-primary)] transition-colors"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[var(--success)] flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M11.667 3.5L5.25 9.917 2.333 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[var(--text-secondary)] flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="4.667"
                    y="4.667"
                    width="7.333"
                    height="7.333"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M2 9.333V2.667A.667.667 0 0 1 2.667 2h6.666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Code content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-h-[500px] overflow-auto">
              <SyntaxHighlighter
                language="json"
                style={customStyle}
                showLineNumbers
                lineNumberStyle={{
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  paddingRight: '16px',
                  minWidth: '40px',
                }}
              >
                {jsonString}
              </SyntaxHighlighter>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

