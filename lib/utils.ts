// ============================================
// THREADMINER - Utility Functions
// ============================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NormalizedData } from './schemas';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format relative time
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Generate a short ID
export function shortId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Copy to clipboard with fallback
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Check if mobile device
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Download file with mobile fallback
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): { success: boolean; fallbackUsed: boolean } {
  // On mobile, try to use share API first
  if (isMobileDevice() && navigator.share) {
    navigator.share({
      title: filename,
      text: content,
    }).catch(() => {
      // Share failed, fall back to copy
      copyToClipboard(content);
    });
    return { success: true, fallbackUsed: true };
  }

  // Standard download
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, fallbackUsed: false };
  } catch {
    // If download fails, copy to clipboard
    copyToClipboard(content);
    return { success: true, fallbackUsed: true };
  }
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Hash string (simple)
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Create cache key
export function createCacheKey(
  url: string,
  depth: string,
  sort: string
): string {
  return `threadminer:${hashString(`${url}:${depth}:${sort}`)}`;
}

// ============================================
// LocalStorage Cache for Threads
// ============================================

const CACHE_VERSION = '1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedThread {
  version: string;
  timestamp: number;
  data: NormalizedData;
  raw: unknown;
}

export function getCachedThread(cacheKey: string): { data: NormalizedData; raw: unknown } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const parsed: CachedThread = JSON.parse(cached);
    
    // Check version and TTL
    if (parsed.version !== CACHE_VERSION) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return { data: parsed.data, raw: parsed.raw };
  } catch {
    return null;
  }
}

export function setCachedThread(
  cacheKey: string,
  data: NormalizedData,
  raw: unknown
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cached: CachedThread = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data,
      raw,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cached));
  } catch {
    // localStorage full or unavailable, ignore
  }
}

// ============================================
// Thread History
// ============================================

const HISTORY_KEY = 'threadminer:history';
const MAX_HISTORY = 20;

export interface HistoryItem {
  url: string;
  title: string;
  subreddit: string;
  commentCount: number;
  minedAt: string;
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<HistoryItem, 'minedAt'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getHistory();
    
    // Remove duplicate if exists
    const filtered = history.filter(h => h.url !== item.url);
    
    // Add new item at the beginning
    filtered.unshift({
      ...item,
      minedAt: new Date().toISOString(),
    });
    
    // Keep only MAX_HISTORY items
    const trimmed = filtered.slice(0, MAX_HISTORY);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable, ignore
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}
