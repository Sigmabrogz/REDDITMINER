'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NormalizedData } from '@/lib/schemas';
import { 
  analyzeComments, 
  AIAnalysisResult, 
  AnalyzedComment,
} from '@/lib/ai-analysis';
import { analyzeWithAI, AIInsight } from '@/lib/openrouter';
import { 
  FireIcon, 
  MoneyIcon, 
  CheckIcon, 
  AlertIcon, 
  TrophyIcon, 
  SearchIcon,
  SparklesIcon,
  UserIcon,
  StarIcon,
} from '@/components/icons';

interface InsightsPanelProps {
  data: NormalizedData;
}

type TabType = 'pains' | 'intents' | 'solutions' | 'shills' | 'top';

export function InsightsPanel({ data }: InsightsPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ step: '', percent: 0 });
  const [activeTab, setActiveTab] = useState<TabType>('pains');
  const [useAI, setUseAI] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  // Run analysis on mount
  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      setIsAnalyzing(true);
      setProgress({ step: 'Starting analysis...', percent: 0 });
      setAiError(null);

      try {
        // First, run pattern-based analysis (fast)
        const patternResult = await analyzeComments(data.comments, {
          onProgress: (p) => {
            if (!cancelled) setProgress(p);
          },
        });

        if (!cancelled) {
          setAnalysis(patternResult);
        }

        // Then, try AI analysis if enabled
        if (useAI && !cancelled) {
          setProgress({ step: 'Running AI analysis...', percent: 50 });
          
          const aiResult = await analyzeWithAI(
            data.comments,
            data.thread.title,
            (step) => {
              if (!cancelled) setProgress({ step, percent: 75 });
            }
          );

          if (!cancelled && aiResult) {
            setAiInsight(aiResult);
          } else if (!cancelled && !aiResult) {
            // AI not available - pattern matching is still great!
            setAiError(null); // Don't show error, pattern matching works well
          }
        }

        setProgress({ step: 'Complete!', percent: 100 });
      } catch (error) {
        console.error('Analysis failed:', error);
        setAiError('Analysis failed. Using pattern matching only.');
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
  }, [data.comments, data.thread.title, useAI]);

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

  const tabs: { id: TabType; label: string; count: number; icon: React.ReactNode; color: string }[] = [
    { id: 'pains', label: 'Pain Points', count: analysis.pains.length, icon: <FireIcon size={16} />, color: 'var(--error)' },
    { id: 'intents', label: 'Buying Intent', count: analysis.intents.length, icon: <MoneyIcon size={16} />, color: 'var(--accent-secondary)' },
    { id: 'solutions', label: 'Solutions', count: analysis.solutions.length, icon: <CheckIcon size={16} />, color: 'var(--success)' },
    { id: 'shills', label: 'Shill Warnings', count: analysis.shillWarnings.length, icon: <AlertIcon size={16} />, color: 'var(--warning, #f59e0b)' },
    { id: 'top', label: 'Top Comments', count: analysis.topByEngagement.length, icon: <TrophyIcon size={16} />, color: 'var(--accent-tertiary)' },
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
      {/* AI Summary (if available) */}
      {aiInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon size={18} className="text-purple-400" />
            <span className="text-sm font-medium text-purple-400">AI Summary</span>
          </div>
          <p className="text-[var(--text-primary)] text-sm">{aiInsight.summary}</p>
        </motion.div>
      )}

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
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Suspicious</p>
        </div>
      </motion.div>

      {/* AI Status Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2"
      >
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          aiInsight 
            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
            : 'bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)] border border-[var(--accent-tertiary)]/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${aiInsight ? 'bg-purple-400' : 'bg-[var(--accent-tertiary)]'}`} />
          {aiInsight ? (
            <>
              <SparklesIcon size={12} />
              AI-Powered Analysis
            </>
          ) : (
            <>
              <SearchIcon size={12} />
              Smart Pattern Analysis
            </>
          )}
        </span>
        {aiError && (
          <span className="text-xs text-[var(--text-muted)]">{aiError}</span>
        )}
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
            <span style={{ color: activeTab === tab.id ? tab.color : undefined }}>{tab.icon}</span>
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
              {activeTabData.icon}
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
                <SearchIcon size={32} className="mx-auto mb-2 opacity-50" />
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
        className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] text-center"
      >
        {aiInsight ? (
          <>
            <SparklesIcon size={12} />
            Analyzed using Mimo AI via OpenRouter
          </>
        ) : (
          <>
            <SearchIcon size={12} />
            Analyzed using smart pattern matching
          </>
        )}
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
            <span className="flex items-center gap-1 text-[var(--accent-secondary)]">
              <UserIcon size={12} />
              u/{item.comment.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <StarIcon size={12} />
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
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] border border-yellow-500/30"
                >
                  <AlertIcon size={10} />
                  {reason}
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
