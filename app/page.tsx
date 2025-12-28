'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMinerStore } from '@/lib/store';
import { 
  createCacheKey, 
  getCachedThread, 
  setCachedThread, 
  addToHistory 
} from '@/lib/utils';
import { URLInput } from '@/components/url-input';
import { FormatSelector } from '@/components/format-selector';
import { DepthSelector } from '@/components/depth-selector';
import { AdvancedOptions } from '@/components/advanced-options';
import { MineButton } from '@/components/mine-button';
import { ProgressBar } from '@/components/progress-bar';
import { ThreadHeader } from '@/components/thread-header';
import { StatsTile, StatsIcons } from '@/components/stats-tile';
import { JSONViewer } from '@/components/json-viewer';
import { MarkdownPreview } from '@/components/markdown-preview';
import { InsightsPanel } from '@/components/insights-panel';
import { ExportDropdown } from '@/components/export-dropdown';
import { HistorySidebar } from '@/components/history-sidebar';
import { PickaxeIcon, BoltIcon, AlertIcon, StarIcon, GitHubIcon, XIcon, ArrowLeftIcon } from '@/components/icons';
import confetti from 'canvas-confetti';
import { normalizeThread, buildJsonUrl } from '@/lib/reddit';
import { RedditRawResponse, NormalizedData } from '@/lib/schemas';

// ============================================
// CLIENT-SIDE FETCH WITH MULTIPLE PROXY FALLBACKS
// This runs in the USER's browser, bypassing Vercel IP blocking
// ============================================
async function fetchThreadClientSide(
  url: string,
  options: { sort: string; limit: number }
): Promise<[RedditRawResponse, RedditRawResponse]> {
  const jsonUrl = buildJsonUrl(url, options);
  
  // Multiple CORS proxies to try (in order of reliability)
  const proxies = [
    // Method 1: codetabs.com (most reliable)
    (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
    
    // Method 2: allorigins.win (backup)
    (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    
    // Method 3: corsproxy.io (backup)
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    
    // Method 4: cors-anywhere alternative
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  ];
  
  let lastError: Error | null = null;
  
  for (let i = 0; i < proxies.length; i++) {
    try {
      const proxyUrl = proxies[i](jsonUrl);
      console.log(`[ThreadMiner] Trying proxy ${i + 1}/${proxies.length}: ${proxyUrl.substring(0, 80)}...`);
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.log(`[ThreadMiner] Proxy ${i + 1} returned ${response.status}`);
        continue; // Try next proxy
      }
      
      let text = await response.text();
      
      // Handle allorigins.win wrapper format
      if (text.startsWith('{') && text.includes('"contents"')) {
        try {
          const wrapper = JSON.parse(text);
          text = wrapper.contents || wrapper.data || text;
        } catch {
          // Not JSON wrapper, continue with text
        }
      }
      
      // Check if response is HTML (error page) instead of JSON
      if (text.trim().startsWith('<')) {
        console.log(`[ThreadMiner] Proxy ${i + 1} returned HTML error`);
        continue; // Try next proxy
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log(`[ThreadMiner] Proxy ${i + 1} JSON parse failed:`, e);
        continue; // Try next proxy
      }
      
      if (!Array.isArray(data) || data.length < 2) {
        console.log(`[ThreadMiner] Proxy ${i + 1} returned invalid data structure`);
        continue; // Try next proxy
      }
      
      console.log(`[ThreadMiner] Success with proxy ${i + 1}!`);
      return data as [RedditRawResponse, RedditRawResponse];
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Unknown error');
      console.log(`[ThreadMiner] Proxy ${i + 1} error:`, e);
      continue; // Try next proxy
    }
  }
  
  // All proxies failed
  throw lastError || new Error('All fetch methods failed. Reddit may be blocking requests. Please try again later.');
}

export default function Home() {
  const store = useMinerStore();
  const [showResults, setShowResults] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track client-side mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for cached data on URL change (only after mount)
  useEffect(() => {
    if (!mounted) return;
    
    if (store.url && !store.isLoading) {
      const cacheKey = createCacheKey(store.url, store.depth, store.sort);
      const cached = getCachedThread(cacheKey);
      setFromCache(!!cached);
    } else {
      setFromCache(false);
    }
  }, [store.url, store.depth, store.sort, store.isLoading, mounted]);

  const handleMine = async () => {
    // Check cache first
    const cacheKey = createCacheKey(store.url, store.depth, store.sort);
    const cached = getCachedThread(cacheKey);
    
    if (cached) {
      // Use cached data
      store.setResults(cached.raw as [unknown, unknown] as Parameters<typeof store.setResults>[0], cached.data);
      setShowResults(true);
      setFromCache(true);
      
      // Small celebration for cache hit
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#4ECDC4'],
      });
      return;
    }

    // Fresh fetch - try multiple methods
    setFromCache(false);
    store.setLoading(true, 'fetching');

    try {
      let result: { raw: [RedditRawResponse, RedditRawResponse]; data: NormalizedData } | null = null;
      let serverFailed = false;

      // METHOD 1: Try server-side API first (works locally, may fail on Vercel)
      try {
        console.log('[ThreadMiner] Attempting server-side fetch...');
        const response = await fetch('/api/fetch-thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: store.url,
            depth: store.depth,
            sort: store.sort,
            maxComments: store.maxComments,
            minScore: store.minScore,
          }),
        });

        const serverResult = await response.json();

        if (serverResult.success) {
          console.log('[ThreadMiner] Server-side fetch succeeded!');
          result = {
            raw: serverResult.raw,
            data: serverResult.data,
          };
        } else {
          // Server returned error - try client-side fallback
          console.log('[ThreadMiner] Server-side failed:', serverResult.error);
          serverFailed = true;
        }
      } catch (serverError) {
        // Network error on server route - try client-side fallback
        console.log('[ThreadMiner] Server-side error:', serverError);
        serverFailed = true;
      }

      // METHOD 2: Client-side fallback with CORS proxies (bypasses Vercel IP blocking)
      if (serverFailed || !result) {
        console.log('[ThreadMiner] Falling back to client-side fetch with proxies...');
        store.setLoading(true, 'fetching');
        
        try {
          const raw = await fetchThreadClientSide(store.url, {
            sort: store.sort,
            limit: Math.min(store.maxComments * 2, 500),
          });

          store.setLoading(true, 'normalizing');

          // Normalize the data client-side
          const normalized = normalizeThread(raw, {
            depth: store.depth,
            maxComments: store.maxComments,
            minScore: store.minScore,
          });

          result = { raw, data: normalized };
          console.log('[ThreadMiner] Client-side fetch succeeded!');
        } catch (clientError) {
          // Both methods failed
          console.error('[ThreadMiner] All methods failed:', clientError);
          store.setLoading(false, 'idle');
          store.setError(clientError instanceof Error ? clientError.message : 'Failed to fetch thread. Please try again.');
          return;
        }
      }

      if (!result || !result.data) {
        store.setLoading(false, 'idle');
        store.setError('Failed to fetch thread. Please try again.');
        return;
      }

      // Step 3: If insights mode, extract signals
      if (store.format === 'insights') {
        store.setLoading(true, 'analyzing');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Cache the result
      setCachedThread(cacheKey, result.data, result.raw);

      // Add to history
      addToHistory({
        url: result.data.thread.permalink,
        title: result.data.thread.title,
        subreddit: result.data.thread.subreddit,
        commentCount: result.data.meta.totalComments,
      });

      store.setResults(result.raw, result.data);
      setShowResults(true);

      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B35', '#F7C94B', '#4ECDC4'],
      });
    } catch (error) {
      store.setLoading(false, 'idle');
      store.setError(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleBack = () => {
    setShowResults(false);
    setFromCache(false);
    store.reset();
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b-2 border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PickaxeIcon size={28} className="text-[var(--accent-primary)]" />
            <h1 className="font-mono font-bold text-xl text-[var(--text-primary)]">
              THREAD<span className="text-[var(--accent-primary)]">MINER</span>
            </h1>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-3">
            {/* GitHub */}
            <a
              href="https://github.com/Sigmabrogz/REDDITMINER"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-all text-sm"
            >
              <GitHubIcon size={16} />
              <span className="hidden sm:inline">Star</span>
              <StarIcon size={14} className="text-[var(--accent-secondary)]" />
            </a>
            
            {/* Twitter/X */}
            <a
              href="https://x.com/0x_Vivek"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-all text-sm"
            >
              <XIcon size={14} />
              <span className="hidden sm:inline">Follow</span>
            </a>
          </div>
        </div>
      </header>

      {/* History Sidebar - only renders after mount */}
      <HistorySidebar />

      <AnimatePresence mode="wait">
        {!showResults ? (
          /* Input View */
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-2xl mx-auto px-4 py-12"
          >
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
                Mine any Reddit thread
              </h2>
              <p className="text-[var(--text-secondary)] text-lg">
                Get clean JSON, markdown, or extract insights from any thread
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card space-y-6"
            >
              {store.isLoading ? (
                <ProgressBar step={store.loadingStep} />
              ) : (
                <>
                  <URLInput />
                  
                  {/* Cache indicator - only show after mount */}
                  {mounted && (
                    <AnimatePresence>
                      {fromCache && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 text-sm text-[var(--accent-tertiary)] bg-[var(--accent-tertiary)] bg-opacity-10 px-3 py-2 rounded-lg"
                        >
                          <BoltIcon size={16} />
                          <span>Cached result available - will load instantly!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  
                  <FormatSelector />
                  <DepthSelector />
                  <AdvancedOptions />
                  <MineButton onMine={handleMine} />

                  {/* Error display */}
                  <AnimatePresence>
                    {store.error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-lg bg-[var(--error)] bg-opacity-10 border-2 border-[var(--error)] text-[var(--error)] text-sm"
                      >
                        <div className="flex items-start gap-3">
                          <AlertIcon size={20} />
                          <div>
                            <p className="font-medium">Error</p>
                            <p className="mt-1 opacity-90">{store.error}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>

            {/* Footer tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-[var(--text-muted)] text-sm mt-8"
            >
              Open source • No signup • Free forever •{' '}
              <a 
                href="https://github.com/Sigmabrogz/REDDITMINER" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--accent-tertiary)] hover:underline"
              >
                Contribute on GitHub
              </a>
            </motion.p>
          </motion.div>
        ) : (
          /* Results View */
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-4 py-8"
          >
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeftIcon size={16} />
                New Thread
              </button>

              <div className="flex items-center gap-3">
                {fromCache && (
                  <span className="flex items-center gap-1 text-xs text-[var(--accent-tertiary)] bg-[var(--accent-tertiary)] bg-opacity-10 px-2 py-1 rounded">
                    <BoltIcon size={12} />
                    Cached
                  </span>
                )}
                {store.normalizedData && (
                  <ExportDropdown data={store.normalizedData} rawData={store.rawData || undefined} />
                )}
              </div>
            </div>

            {store.normalizedData && (
              <>
                {/* Thread header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <ThreadHeader thread={store.normalizedData.thread} />
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <StatsTile
                    label="Comments"
                    value={store.normalizedData.meta.totalComments}
                    icon={StatsIcons.comments}
                    color="orange"
                    delay={0}
                  />
                  <StatsTile
                    label="Score"
                    value={store.normalizedData.thread.score}
                    icon={StatsIcons.signals}
                    color="yellow"
                    delay={0.1}
                  />
                  <StatsTile
                    label="Max Depth"
                    value={store.normalizedData.meta.maxDepth}
                    icon={StatsIcons.depth}
                    color="teal"
                    delay={0.2}
                  />
                  <StatsTile
                    label="Exports"
                    value={4}
                    icon={StatsIcons.exports}
                    color="purple"
                    delay={0.3}
                  />
                </div>

                {/* Content based on format */}
                {store.format === 'raw' && store.rawData && (
                  <JSONViewer data={store.rawData} title="raw-reddit-response.json" />
                )}

                {store.format === 'clean' && (
                  <JSONViewer data={store.normalizedData} title="normalized-thread.json" />
                )}

                {store.format === 'markdown' && (
                  <MarkdownPreview data={store.normalizedData} />
                )}

                {store.format === 'insights' && (
                  <InsightsPanel data={store.normalizedData} />
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
