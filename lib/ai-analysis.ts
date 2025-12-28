// ============================================
// THREADMINER - Smart Signal Analysis
// https://github.com/Sigmabrogz/REDDITMINER
// Pattern-based detection for pain points,
// buying intent, solutions & shill detection
// ============================================

import { NormalizedComment } from './schemas';

// ============================================
// Types
// ============================================

export interface AnalyzedComment {
  comment: NormalizedComment;
  sentiment: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
  };
  signals: string[];
  shillScore: number;
  shillReasons: string[];
  relevanceScore: number;
}

export interface AIAnalysisResult {
  pains: AnalyzedComment[];
  intents: AnalyzedComment[];
  solutions: AnalyzedComment[];
  shillWarnings: AnalyzedComment[];
  topByEngagement: AnalyzedComment[];
  summary: {
    totalAnalyzed: number;
    sentimentBreakdown: {
      positive: number;
      negative: number;
      neutral: number;
    };
    avgScore: number;
    controversialCount: number;
    potentialShills: number;
  };
  modelLoaded: boolean;
}

// ============================================
// Pattern-Based Signal Detection
// ============================================

const PAIN_PATTERNS = [
  { pattern: /\b(hate|hated|hating)\b(?!\s+how much|\s+that i love)/i, weight: 3, signal: 'hate' },
  { pattern: /\b(frustrat|annoy|disappoint)/i, weight: 2, signal: 'frustration' },
  { pattern: /\b(broken|buggy|crash|glitch|bug)\b/i, weight: 3, signal: 'technical issue' },
  { pattern: /\b(doesn't work|won't work|stopped working|not working)/i, weight: 4, signal: 'not working' },
  { pattern: /\b(waste of (money|time)|regret|refund)/i, weight: 4, signal: 'regret/refund' },
  { pattern: /\b(terrible|awful|horrible|worst)\b/i, weight: 2, signal: 'negative' },
  { pattern: /\b(avoid|stay away|don't buy|wouldn't recommend)/i, weight: 4, signal: 'warning' },
  { pattern: /\bi wish (it|they|this) (had|would|could)/i, weight: 2, signal: 'feature request' },
  { pattern: /\bthe problem (is|with)/i, weight: 2, signal: 'problem' },
  { pattern: /\b(sucks?|crap|garbage|trash)\b/i, weight: 3, signal: 'strong negative' },
  { pattern: /\b(overpriced|expensive|not worth)/i, weight: 3, signal: 'price complaint' },
];

const INTENT_PATTERNS = [
  { pattern: /\b(should i (buy|get|switch|try)|worth (it|buying|the price|getting))/i, weight: 4, signal: 'purchase decision' },
  { pattern: /\b(looking for|searching for|need a|want a)\s+\w+/i, weight: 3, signal: 'searching' },
  { pattern: /\brecommend/i, weight: 2, signal: 'seeking advice' },
  { pattern: /\b(alternative to|instead of|vs\.?|versus|compared to)/i, weight: 3, signal: 'comparison' },
  { pattern: /\b(best|top|which)\s+\w+\s+(for|to|should)/i, weight: 3, signal: 'best option' },
  { pattern: /\bhelp me (find|choose|decide)/i, weight: 4, signal: 'help request' },
  { pattern: /\banyone (use|tried|know|recommend)/i, weight: 2, signal: 'community input' },
  { pattern: /\bwhat do you (think|recommend|suggest)/i, weight: 3, signal: 'opinion request' },
  { pattern: /\b(budget|price range|under \$?\d+)/i, weight: 2, signal: 'budget conscious' },
];

const SOLUTION_PATTERNS = [
  { pattern: /\bi (use|switched to|recommend|love using)\s+/i, weight: 2, signal: 'personal use' },
  { pattern: /\b(solved|fixed|works great|game changer)/i, weight: 3, signal: 'solution found' },
  { pattern: /\b(check out|try|look into)\s+/i, weight: 2, signal: 'recommendation' },
  { pattern: /\bafter (trying|using|switching)/i, weight: 2, signal: 'experience' },
  { pattern: /\b(highly recommend|can't recommend enough|10\/10)/i, weight: 3, signal: 'strong endorsement' },
  { pattern: /\b(been using|for \d+ (years?|months?))/i, weight: 2, signal: 'long-term use' },
];

// SHILL DETECTION
const SHILL_INDICATORS = [
  { pattern: /\b(affiliate|referral|promo code|discount code|use my link)/i, weight: 5, reason: 'Affiliate/referral link' },
  { pattern: /\b(i work for|i'm with|full disclosure|disclaimer)/i, weight: 2, reason: 'Disclosed affiliation' },
  { pattern: /https?:\/\/[^\s]+\?(ref|aff|utm_source|utm_campaign)/i, weight: 4, reason: 'Tracking URL detected' },
  { pattern: /\b(check out my|visit my|my website|my channel)/i, weight: 4, reason: 'Self-promotion' },
  { pattern: /\b(DM me|message me|contact me)/i, weight: 3, reason: 'Off-platform redirect' },
];

function detectPatterns(
  body: string,
  patterns: Array<{ pattern: RegExp; weight: number; signal: string }>
): { score: number; signals: string[] } {
  let score = 0;
  const signals: string[] = [];
  
  for (const { pattern, weight, signal } of patterns) {
    if (pattern.test(body)) {
      score += weight;
      if (!signals.includes(signal)) {
        signals.push(signal);
      }
    }
  }
  
  return { score, signals };
}

function detectShillIndicators(body: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  for (const { pattern, weight, reason } of SHILL_INDICATORS) {
    if (pattern.test(body)) {
      score += weight;
      reasons.push(reason);
    }
  }
  
  // Count hyperbolic words
  const hyperbolicCount = (body.match(/\b(amazing|perfect|incredible|awesome|fantastic|unbelievable)\b/gi) || []).length;
  if (hyperbolicCount >= 3) {
    score += hyperbolicCount - 2;
    reasons.push(`${hyperbolicCount} hyperbolic words`);
  }
  
  return { score: Math.max(0, score), reasons };
}

function inferSentimentFromPatterns(
  painScore: number,
  solutionScore: number,
  body: string
): AnalyzedComment['sentiment'] {
  // Simple keyword-based sentiment
  const positiveWords = (body.match(/\b(love|great|amazing|awesome|excellent|best|perfect|fantastic|wonderful|happy)\b/gi) || []).length;
  const negativeWords = (body.match(/\b(hate|terrible|awful|horrible|worst|bad|sucks|garbage|trash|useless|disappointed)\b/gi) || []).length;
  
  const netSentiment = positiveWords - negativeWords + (solutionScore * 0.5) - (painScore * 0.5);
  
  if (netSentiment > 1) {
    return { label: 'positive', score: Math.min(0.9, 0.6 + netSentiment * 0.1) };
  } else if (netSentiment < -1) {
    return { label: 'negative', score: Math.min(0.9, 0.6 + Math.abs(netSentiment) * 0.1) };
  }
  return { label: 'neutral', score: 0.5 };
}

// ============================================
// Main Analysis Function
// ============================================

export async function analyzeComments(
  comments: NormalizedComment[],
  options: {
    onProgress?: (progress: { step: string; percent: number }) => void;
  } = {}
): Promise<AIAnalysisResult> {
  const { onProgress } = options;
  
  const analyzed: AnalyzedComment[] = [];
  const sentimentBreakdown = { positive: 0, negative: 0, neutral: 0 };
  let totalScore = 0;
  let controversialCount = 0;
  
  onProgress?.({ step: 'Analyzing comments...', percent: 10 });
  
  // Analyze each comment
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    const body = comment.body;
    
    // Track stats
    totalScore += comment.score;
    if (comment.controversiality > 0) controversialCount++;
    
    // Pattern-based detection
    const painDetection = detectPatterns(body, PAIN_PATTERNS);
    const intentDetection = detectPatterns(body, INTENT_PATTERNS);
    const solutionDetection = detectPatterns(body, SOLUTION_PATTERNS);
    const shillDetection = detectShillIndicators(body);
    
    // Sentiment from patterns
    const sentiment = inferSentimentFromPatterns(painDetection.score, solutionDetection.score, body);
    
    // Update breakdown
    sentimentBreakdown[sentiment.label]++;
    
    // Combine all signals
    const allSignals = [
      ...painDetection.signals,
      ...intentDetection.signals,
      ...solutionDetection.signals,
    ];
    
    // Calculate relevance score
    const upvoteBoost = Math.log10(Math.max(comment.score, 1) + 1);
    const signalStrength = painDetection.score + intentDetection.score + solutionDetection.score;
    const relevanceScore = signalStrength * (1 + upvoteBoost * 0.5);
    
    analyzed.push({
      comment,
      sentiment,
      signals: allSignals,
      shillScore: shillDetection.score,
      shillReasons: shillDetection.reasons,
      relevanceScore,
    });
    
    // Progress update
    if (i % 50 === 0) {
      onProgress?.({ 
        step: `Analyzing... (${i + 1}/${comments.length})`, 
        percent: 10 + (i / comments.length) * 80 
      });
    }
  }
  
  onProgress?.({ step: 'Categorizing signals...', percent: 95 });
  
  // Categorize results
  const pains = analyzed
    .filter(a => {
      const painScore = detectPatterns(a.comment.body, PAIN_PATTERNS).score;
      return painScore > 0 || a.sentiment.label === 'negative';
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20);
  
  const intents = analyzed
    .filter(a => detectPatterns(a.comment.body, INTENT_PATTERNS).score > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20);
  
  const solutions = analyzed
    .filter(a => {
      const solutionScore = detectPatterns(a.comment.body, SOLUTION_PATTERNS).score;
      return solutionScore > 0 && a.shillScore < 3;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20);
  
  const shillWarnings = analyzed
    .filter(a => a.shillScore >= 3)
    .sort((a, b) => b.shillScore - a.shillScore)
    .slice(0, 10);
  
  const topByEngagement = analyzed
    .sort((a, b) => b.comment.score - a.comment.score)
    .slice(0, 10);
  
  onProgress?.({ step: 'Complete!', percent: 100 });
  
  return {
    pains,
    intents,
    solutions,
    shillWarnings,
    topByEngagement,
    summary: {
      totalAnalyzed: comments.length,
      sentimentBreakdown,
      avgScore: comments.length > 0 ? totalScore / comments.length : 0,
      controversialCount,
      potentialShills: shillWarnings.length,
    },
    modelLoaded: false, // Pattern-based only for now
  };
}
