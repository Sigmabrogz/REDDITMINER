'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NormalizedData } from '@/lib/schemas';
import { analyzeWithAI, AIInsight } from '@/lib/openrouter';
import { 
  FireIcon, 
  MoneyIcon, 
  CheckIcon, 
  AlertIcon, 
  SearchIcon,
  SparklesIcon,
  UserIcon,
  StarIcon,
  TargetIcon,
  TrendUpIcon,
  ShieldIcon,
  ZapIcon,
} from '@/components/icons';

interface InsightsPanelProps {
  data: NormalizedData;
}

type TabType = 'nuggets' | 'buyers' | 'competitors' | 'risks';

export function InsightsPanel({ data }: InsightsPanelProps) {
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [progress, setProgress] = useState('Starting analysis...');
  const [activeTab, setActiveTab] = useState<TabType>('nuggets');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await analyzeWithAI(
          data.comments,
          data.thread.title,
          (step) => {
            if (!cancelled) setProgress(step);
          }
        );

        if (!cancelled) {
          if (result) {
            setAiInsight(result);
          } else {
            setError('AI analysis unavailable. Try again later.');
          }
        }
      } catch (err) {
        console.error('Analysis failed:', err);
        if (!cancelled) {
          setError('Analysis failed. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsAnalyzing(false);
        }
      }
    }

    runAnalysis();
    return () => { cancelled = true; };
  }, [data.comments, data.thread.title]);

  // Loading state
  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card py-16"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full"
          />
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Mining for Gold
          </h3>
          <p className="text-[var(--text-muted)] text-sm">{progress}</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error || !aiInsight) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card py-12 text-center"
      >
        <AlertIcon size={48} className="mx-auto mb-4 text-[var(--error)]" />
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
          {error || 'Analysis unavailable'}
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          Try refreshing or check back later.
        </p>
      </motion.div>
    );
  }

  const tabs: { id: TabType; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'nuggets', label: 'Gold Nuggets', count: aiInsight.goldNuggets.length, icon: <FireIcon size={16} /> },
    { id: 'buyers', label: 'Buyer Signals', count: aiInsight.buyerSignals.length, icon: <MoneyIcon size={16} /> },
    { id: 'competitors', label: 'Competitors', count: aiInsight.competitors.length, icon: <TargetIcon size={16} /> },
    { id: 'risks', label: 'Red Flags', count: aiInsight.redFlags.length + aiInsight.shills.length, icon: <AlertIcon size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* TL;DR - The ONE Thing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 via-purple-500/10 to-[var(--accent-secondary)]/20 border-2 border-[var(--accent-primary)]/30 p-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <ZapIcon size={20} className="text-[var(--accent-primary)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
              TL;DR for Founders
            </span>
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)] leading-relaxed">
            {aiInsight.tldr}
          </p>
        </div>
      </motion.div>

      {/* Market Pulse Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {/* Demand Strength */}
        <div className={`p-4 rounded-xl border-2 ${
          aiInsight.marketSignals.demandStrength === 'hot' 
            ? 'bg-green-500/10 border-green-500/30' 
            : aiInsight.marketSignals.demandStrength === 'warm'
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-gray-500/10 border-gray-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendUpIcon size={16} className={
              aiInsight.marketSignals.demandStrength === 'hot' ? 'text-green-400' :
              aiInsight.marketSignals.demandStrength === 'warm' ? 'text-yellow-400' : 'text-gray-400'
            } />
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Demand</span>
          </div>
          <p className={`text-xl font-bold capitalize ${
            aiInsight.marketSignals.demandStrength === 'hot' ? 'text-green-400' :
            aiInsight.marketSignals.demandStrength === 'warm' ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {aiInsight.marketSignals.demandStrength}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
            {aiInsight.marketSignals.demandReason}
          </p>
        </div>

        {/* Price Range */}
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-2">
            <MoneyIcon size={16} className="text-[var(--accent-secondary)]" />
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Price Range</span>
          </div>
          <p className="text-xl font-bold text-[var(--accent-secondary)]">
            {aiInsight.marketSignals.priceRange}
          </p>
        </div>

        {/* Urgency */}
        <div className={`p-4 rounded-xl border-2 ${
          aiInsight.marketSignals.urgency === 'high' 
            ? 'bg-red-500/10 border-red-500/30' 
            : aiInsight.marketSignals.urgency === 'medium'
            ? 'bg-orange-500/10 border-orange-500/30'
            : 'bg-gray-500/10 border-gray-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <FireIcon size={16} className={
              aiInsight.marketSignals.urgency === 'high' ? 'text-red-400' :
              aiInsight.marketSignals.urgency === 'medium' ? 'text-orange-400' : 'text-gray-400'
            } />
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Urgency</span>
          </div>
          <p className={`text-xl font-bold capitalize ${
            aiInsight.marketSignals.urgency === 'high' ? 'text-red-400' :
            aiInsight.marketSignals.urgency === 'medium' ? 'text-orange-400' : 'text-gray-400'
          }`}>
            {aiInsight.marketSignals.urgency}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
            {aiInsight.marketSignals.urgencyReason}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon size={16} className="text-purple-400" />
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Signals Found</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-purple-400">
              {aiInsight.goldNuggets.length + aiInsight.buyerSignals.length}
            </span>
            <span className="text-xs text-[var(--text-muted)]">actionable</span>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${activeTab === tab.id 
                ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/25' 
                : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/50'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--bg-tertiary)]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'nuggets' && (
            <GoldNuggetsTab nuggets={aiInsight.goldNuggets} />
          )}
          {activeTab === 'buyers' && (
            <BuyerSignalsTab signals={aiInsight.buyerSignals} />
          )}
          {activeTab === 'competitors' && (
            <CompetitorsTab competitors={aiInsight.competitors} />
          )}
          {activeTab === 'risks' && (
            <RisksTab redFlags={aiInsight.redFlags} shills={aiInsight.shills} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]"
      >
        <SparklesIcon size={12} />
        Powered by Mimo AI via OpenRouter
      </motion.p>
    </div>
  );
}

// ============================================
// Gold Nuggets Tab
// ============================================

function GoldNuggetsTab({ nuggets }: { nuggets: AIInsight['goldNuggets'] }) {
  if (nuggets.length === 0) {
    return <EmptyState message="No strong problem signals detected in this thread." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">
        Problems people will PAY to solve:
      </p>
      {nuggets.map((nugget, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-5 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center">
              <span className="text-sm font-bold text-[var(--accent-primary)]">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                {nugget.insight}
              </h4>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckIcon size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Ship This</span>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{nugget.actionable}</p>
                </div>
              </div>
              <CommentSource comment={nugget.comment} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// Buyer Signals Tab
// ============================================

function BuyerSignalsTab({ signals }: { signals: AIInsight['buyerSignals'] }) {
  if (signals.length === 0) {
    return <EmptyState message="No active buying intent detected in this thread." />;
  }

  const stageColors = {
    ready: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    researching: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    curious: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">
        People actively looking to spend money:
      </p>
      {signals.map((signal, index) => {
        const colors = stageColors[signal.stage];
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-xl ${colors.bg} border-2 ${colors.border}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <MoneyIcon size={16} className={colors.text} />
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                {signal.stage === 'ready' ? 'Ready to Buy' : 
                 signal.stage === 'researching' ? 'Actively Researching' : 'Curious'}
              </span>
            </div>
            <blockquote className="text-[var(--text-primary)] font-medium mb-3 pl-3 border-l-2 border-[var(--text-muted)]">
              &ldquo;{signal.quote}&rdquo;
            </blockquote>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--bg-primary)]/50">
              <TargetIcon size={16} className="text-[var(--accent-tertiary)] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-[var(--accent-tertiary)] uppercase tracking-wider">How to Reach</span>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{signal.followUp}</p>
              </div>
            </div>
            <CommentSource comment={signal.comment} />
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// Competitors Tab
// ============================================

function CompetitorsTab({ competitors }: { competitors: AIInsight['competitors'] }) {
  if (competitors.length === 0) {
    return <EmptyState message="No competitors mentioned in this thread." />;
  }

  const sentimentConfig = {
    loved: { icon: <StarIcon size={14} />, color: 'text-green-400', bg: 'bg-green-500/20' },
    hated: { icon: <AlertIcon size={14} />, color: 'text-red-400', bg: 'bg-red-500/20' },
    meh: { icon: <SearchIcon size={14} />, color: 'text-gray-400', bg: 'bg-gray-500/20' },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">
        Products/services mentioned and how people feel about them:
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {competitors.map((comp, index) => {
          const config = sentimentConfig[comp.sentiment];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-[var(--text-primary)]">{comp.name}</h4>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                  {config.icon}
                  {comp.sentiment}
                </span>
              </div>
              {comp.weakness && (
                <div className="p-3 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
                  <span className="text-xs font-medium text-[var(--accent-primary)] uppercase tracking-wider">Gap to Exploit</span>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{comp.weakness}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Risks Tab
// ============================================

function RisksTab({ redFlags, shills }: { redFlags: AIInsight['redFlags']; shills: AIInsight['shills'] }) {
  if (redFlags.length === 0 && shills.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-green-500/10 border-2 border-green-500/30 text-center">
        <ShieldIcon size={32} className="mx-auto mb-3 text-green-400" />
        <h3 className="font-semibold text-green-400 mb-1">All Clear</h3>
        <p className="text-sm text-[var(--text-muted)]">No major red flags or suspicious activity detected.</p>
      </div>
    );
  }

  const severityConfig = {
    dealbreaker: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
    caution: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
    minor: { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' },
  };

  return (
    <div className="space-y-6">
      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
            <AlertIcon size={16} className="text-red-400" />
            Market Risks ({redFlags.length})
          </h3>
          {redFlags.map((flag, index) => {
            const config = severityConfig[flag.severity];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl ${config.bg} border-2 ${config.border}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                    {flag.severity}
                  </span>
                </div>
                <p className="text-[var(--text-primary)]">{flag.issue}</p>
                <CommentSource comment={flag.comment} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Shill Warnings */}
      {shills.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
            <ShieldIcon size={16} className="text-yellow-400" />
            Suspicious Activity ({shills.length})
          </h3>
          {shills.map((shill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30"
            >
              <p className="text-[var(--text-primary)]">{shill.reason}</p>
              <CommentSource comment={shill.comment} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Shared Components
// ============================================

function CommentSource({ comment }: { comment: AIInsight['goldNuggets'][0]['comment'] }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <UserIcon size={12} />
        <span>u/{comment.author}</span>
        <span className="opacity-50">|</span>
        <StarIcon size={12} />
        <span>{comment.score}</span>
        <span className="ml-2 text-[var(--accent-tertiary)]">
          {expanded ? 'Hide source' : 'View source'}
        </span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm text-[var(--text-secondary)] overflow-hidden"
          >
            &ldquo;{comment.body}&rdquo;
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)] text-center">
      <SearchIcon size={32} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
      <p className="text-[var(--text-muted)]">{message}</p>
    </div>
  );
}
