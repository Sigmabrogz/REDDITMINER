'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NormalizedData } from '@/lib/schemas';
import { 
  analyzeComments, 
  AIAnalysisResult, 
  AnalyzedComment,
} from '@/lib/ai-analysis';

interface InsightsPanelProps {
  data: NormalizedData;
}

type TabType = 'pains' | 'intents' | 'solutions' | 'shills' | 'top';

export function InsightsPanel({ data }: InsightsPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ step: '', percent: 0 });
  const [activeTab, setActiveTab] = useState<TabType>('pains');

  // Run analysis on mount
  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      setIsAnalyzing(true);
      setProgress({ step: 'Starting analysis...', percent: 0 });

      try {
        const result = await analyzeComments(data.comments, {
          onProgress: (p) => {
            if (!cancelled) setProgress(p);
          },
        });

        if (!cancelled) {
          setAnalysis(result);
        }
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        if (!cancelled) {
          setIsAnalyzing(false);
        }
      }
    }

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [data.comments]);

  // Loading state
  if (isAnalyzing || !analysis) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card py-12"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full"
          />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            {progress.step || 'Analyzing...'}
          </h3>
          <div className="w-64 mx-auto h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--accent-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  const tabs: { id: TabType; label: string; count: number; emoji: string; color: string }[] = [
    { id: 'pains', label: 'Pain Points', count: analysis.pains.length, emoji: '🔥', color: 'var(--error)' },
    { id: 'intents', label: 'Buying Intent', count: analysis.intents.length, emoji: '💰', color: 'var(--accent-secondary)' },
    { id: 'solutions', label: 'Solutions', count: analysis.solutions.length, emoji: '✅', color: 'var(--success)' },
    { id: 'shills', label: 'Shill Warnings', count: analysis.shillWarnings.length, emoji: '⚠️', color: 'var(--warning, #f59e0b)' },
    { id: 'top', label: 'Top Comments', count: analysis.topByEngagement.length, emoji: '🏆', color: 'var(--accent-tertiary)' },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab)!;
  
  const getActiveComments = (): AnalyzedComment[] => {
    switch (activeTab) {
      case 'pains': return analysis.pains;
      case 'intents': return analysis.intents;
      case 'solutions': return analysis.solutions;
      case 'shills': return analysis.shillWarnings;
      case 'top': return analysis.topByEngagement;
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
          <span className="text-xl font-bold text-[var(--text-primary)]">{analysis.summary.totalAnalyzed}</span>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Analyzed</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-green-500/30 text-center">
          <span className="text-xl font-bold text-green-400">{analysis.summary.sentimentBreakdown.positive}</span>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Positive</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-red-500/30 text-center">
          <span className="text-xl font-bold text-red-400">{analysis.summary.sentimentBreakdown.negative}</span>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Negative</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-gray-500/30 text-center">
          <span className="text-xl font-bold text-gray-400">{analysis.summary.sentimentBreakdown.neutral}</span>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Neutral</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-yellow-500/30 text-center">
          <span className="text-xl font-bold text-yellow-400">{analysis.summary.potentialShills}</span>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Sus 👀</p>
        </div>
      </motion.div>

      {/* AI Status Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)] border border-[var(--accent-tertiary)]/30">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-tertiary)]" />
          ⚡ Smart Pattern Analysis
        </span>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id 
                ? 'bg-[var(--bg-tertiary)] border-2 text-[var(--text-primary)]' 
                : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }
            `}
            style={{ 
              borderColor: activeTab === tab.id ? tab.color : undefined,
            }}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            <span 
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ 
                backgroundColor: activeTab === tab.id ? tab.color : 'var(--bg-tertiary)',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border-2 border-[var(--border-subtle)] overflow-hidden"
        >
          {/* Header */}
          <div 
            className="px-4 py-3 border-b-2 border-[var(--border-subtle)]"
            style={{ backgroundColor: `color-mix(in srgb, ${activeTabData.color} 10%, transparent)` }}
          >
            <h3 className="font-semibold flex items-center gap-2" style={{ color: activeTabData.color }}>
              <span>{activeTabData.emoji}</span> 
              {activeTabData.label}
              <span className="text-xs font-normal text-[var(--text-muted)]">
                ({activeTabData.count} found)
              </span>
            </h3>
          </div>

          {/* Comments List */}
          <div className="divide-y divide-[var(--border-subtle)] max-h-[600px] overflow-y-auto">
            {getActiveComments().length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)]">
                <span className="text-3xl block mb-2">🔍</span>
                No {activeTabData.label.toLowerCase()} detected in this thread.
              </div>
            ) : (
              getActiveComments().map((item, index) => (
                <CommentCard 
                  key={item.comment.id} 
                  item={item} 
                  index={index}
                  type={activeTab}
                  color={activeTabData.color}
                />
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-[var(--text-muted)] text-center"
      >
        ⚡ Analyzed using smart pattern matching • Detects pain points, buying intent, solutions & shills
      </motion.p>
    </div>
  );
}

// ============================================
// Comment Card Component
// ============================================

interface CommentCardProps {
  item: AnalyzedComment;
  index: number;
  type: TabType;
  color: string;
}

function CommentCard({ item, index, type, color }: CommentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = item.comment.body.length > 300;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="p-4 hover:bg-[var(--bg-tertiary)] transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Index */}
        <span className="text-sm font-mono text-[var(--text-muted)] w-6 flex-shrink-0">
          {index + 1}.
        </span>

        <div className="flex-1 min-w-0">
          {/* Comment body */}
          <p className={`text-sm text-[var(--text-primary)] ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
            &ldquo;{item.comment.body}&rdquo;
          </p>
          
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-[var(--accent-tertiary)] hover:underline mt-1"
            >
              {expanded ? 'Show less' : 'Show more...'}
            </button>
          )}

          {/* Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="text-[var(--accent-secondary)]">u/{item.comment.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              {item.comment.score}
            </span>
            
            {/* Sentiment badge */}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              item.sentiment.label === 'positive' ? 'bg-green-500/20 text-green-400' :
              item.sentiment.label === 'negative' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {item.sentiment.label} ({Math.round(item.sentiment.score * 100)}%)
            </span>

            {item.comment.isOP && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-medium">
                OP
              </span>
            )}
          </div>

          {/* Signals/Reasons */}
          {type === 'shills' && item.shillReasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.shillReasons.map((reason, i) => (
                <span 
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] border border-yellow-500/30"
                >
                  ⚠️ {reason}
                </span>
              ))}
            </div>
          )}

          {type !== 'shills' && type !== 'top' && item.signals.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.signals.slice(0, 5).map((signal, i) => (
                <span 
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[10px] border"
                  style={{ 
                    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                    borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
                    color: color,
                  }}
                >
                  {signal}
                </span>
              ))}
              {item.signals.length > 5 && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  +{item.signals.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
