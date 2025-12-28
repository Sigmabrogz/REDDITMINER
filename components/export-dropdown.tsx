'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { NormalizedData } from '@/lib/schemas';
import { downloadFile, copyToClipboard } from '@/lib/utils';
import { toMarkdown, toCSV } from '@/lib/reddit';

interface ExportDropdownProps {
  data: NormalizedData;
  rawData?: object;
}

const exportOptions = [
  { id: 'json', label: 'Clean JSON', ext: '.json', icon: '{ }' },
  { id: 'raw', label: 'Raw JSON', ext: '.json', icon: '[ ]' },
  { id: 'markdown', label: 'Markdown', ext: '.md', icon: '#' },
  { id: 'csv', label: 'CSV', ext: '.csv', icon: '▤' },
];

export function ExportDropdown({ data, rawData }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check for mobile after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: string) => {
    const slug = data.thread.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `${slug}.json`;
        mimeType = 'application/json';
        break;
      case 'raw':
        content = JSON.stringify(rawData || data, null, 2);
        filename = `${slug}-raw.json`;
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = toMarkdown(data);
        filename = `${slug}.md`;
        mimeType = 'text/markdown';
        break;
      case 'csv':
        content = toCSV(data);
        filename = `${slug}-comments.csv`;
        mimeType = 'text/csv';
        break;
      default:
        return;
    }

    // On mobile, prefer copy to clipboard
    if (isMobile) {
      const success = await copyToClipboard(content);
      if (success) {
        setLastExported(format);
        setExportMessage('Copied to clipboard!');
        setIsOpen(false);
        
        // Celebration confetti!
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FF6B35', '#F7C94B', '#4ECDC4'],
        });
      }
    } else {
      // Desktop: try download
      const result = downloadFile(content, filename, mimeType);
      setLastExported(format);
      setExportMessage(result.fallbackUsed ? 'Copied to clipboard!' : 'Downloaded!');
      setIsOpen(false);

      // Celebration confetti!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF6B35', '#F7C94B', '#4ECDC4'],
      });
    }

    // Reset after animation
    setTimeout(() => {
      setLastExported(null);
      setExportMessage('');
    }, 2000);
  };

  // Quick copy button for mobile
  const handleQuickCopy = async () => {
    const content = JSON.stringify(data, null, 2);
    const success = await copyToClipboard(content);
    if (success) {
      setLastExported('quick');
      setExportMessage('JSON copied!');
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#FF6B35', '#F7C94B', '#4ECDC4'],
      });
      setTimeout(() => {
        setLastExported(null);
        setExportMessage('');
      }, 2000);
    }
  };

  return (
    <div ref={dropdownRef} className="relative flex gap-2">
      {/* Quick copy button (especially useful on mobile) */}
      <motion.button
        onClick={handleQuickCopy}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
          border-2 transition-colors duration-150
          ${lastExported === 'quick'
            ? 'bg-[var(--success)] border-[var(--success)] text-[var(--text-inverse)]'
            : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-tertiary)] hover:text-[var(--accent-tertiary)]'
          }
        `}
        title="Copy JSON to clipboard"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
        {isMobile ? 'Copy' : ''}
      </motion.button>

      {/* Export dropdown */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          border-2 transition-colors duration-150
          ${lastExported && lastExported !== 'quick'
            ? 'bg-[var(--success)] border-[var(--success)] text-[var(--text-inverse)]'
            : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {lastExported && lastExported !== 'quick' ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.333 4L6 11.333 2.667 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {exportMessage}
            </motion.span>
          ) : (
            <motion.span
              key="export"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14 10v2.667A1.333 1.333 0 0 1 12.667 14H3.333A1.333 1.333 0 0 1 2 12.667V10M4.667 6.667L8 10l3.333-3.333M8 10V2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 4.5l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-12 w-52 py-2 rounded-xl
              bg-[var(--bg-elevated)] border-2 border-[var(--border-default)]
              shadow-lg z-50"
          >
            {/* Mobile hint */}
            {isMobile && (
              <div className="px-4 py-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                📱 On mobile, content will be copied to clipboard
              </div>
            )}
            
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5
                  text-left text-sm text-[var(--text-secondary)]
                  hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
                  transition-colors"
              >
                <span className="w-6 text-center font-mono text-[var(--accent-tertiary)]">
                  {option.icon}
                </span>
                <span>{option.label}</span>
                <span className="ml-auto text-xs text-[var(--text-muted)]">
                  {isMobile ? 'copy' : option.ext}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
