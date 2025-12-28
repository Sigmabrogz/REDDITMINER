// ============================================
// THREADMINER - Global State Store (Zustand)
// https://github.com/Sigmabrogz/REDDITMINER
// ============================================

import { create } from 'zustand';
import {
  OutputFormat,
  DepthLevel,
  NormalizedData,
  InsightsData,
  RedditRawResponse,
} from './schemas';

interface MinerStore {
  // Input state
  url: string;
  format: OutputFormat;
  depth: DepthLevel;
  sort: 'best' | 'top' | 'new' | 'controversial';
  maxComments: number;
  minScore: number;
  
  // Loading state
  isLoading: boolean;
  loadingStep: 'idle' | 'fetching' | 'normalizing' | 'analyzing';
  progress: number;
  
  // Results
  rawData: [RedditRawResponse, RedditRawResponse] | null;
  normalizedData: NormalizedData | null;
  insightsData: InsightsData | null;
  
  // Error
  error: string | null;
  
  // Actions
  setUrl: (url: string) => void;
  setFormat: (format: OutputFormat) => void;
  setDepth: (depth: DepthLevel) => void;
  setSort: (sort: 'best' | 'top' | 'new' | 'controversial') => void;
  setMaxComments: (max: number) => void;
  setMinScore: (min: number) => void;
  setLoading: (isLoading: boolean, step?: 'idle' | 'fetching' | 'normalizing' | 'analyzing') => void;
  setProgress: (progress: number) => void;
  setResults: (raw: [RedditRawResponse, RedditRawResponse] | null, normalized: NormalizedData | null) => void;
  setInsights: (insights: InsightsData | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  url: '',
  format: 'clean' as OutputFormat,
  depth: 'level2' as DepthLevel,
  sort: 'best' as const,
  maxComments: 500,
  minScore: 0,
  isLoading: false,
  loadingStep: 'idle' as const,
  progress: 0,
  rawData: null,
  normalizedData: null,
  insightsData: null,
  error: null,
};

export const useMinerStore = create<MinerStore>((set) => ({
  ...initialState,
  
  setUrl: (url) => set({ url, error: null }),
  
  setFormat: (format) => set({ format }),
  
  setDepth: (depth) => set({ depth }),
  
  setSort: (sort) => set({ sort }),
  
  setMaxComments: (maxComments) => set({ maxComments }),
  
  setMinScore: (minScore) => set({ minScore }),
  
  setLoading: (isLoading, step = 'idle') => set({ 
    isLoading, 
    loadingStep: step,
    error: isLoading ? null : undefined,
  }),
  
  setProgress: (progress) => set({ progress }),
  
  setResults: (rawData, normalizedData) => set({ 
    rawData, 
    normalizedData,
    isLoading: false,
    loadingStep: 'idle',
    progress: 100,
  }),
  
  setInsights: (insightsData) => set({ insightsData }),
  
  setError: (error) => set({ 
    error, 
    isLoading: false, 
    loadingStep: 'idle',
    progress: 0,
  }),
  
  reset: () => set(initialState),
}));

