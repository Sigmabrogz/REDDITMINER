// ============================================
// THREADMINER - Type Definitions
// ============================================

// Output format modes
export type OutputFormat = 'raw' | 'clean' | 'markdown' | 'insights';

// Depth levels for comment fetching
export type DepthLevel = 'top' | 'level2' | 'full';

// ============================================
// Reddit Raw Types (what Reddit API returns)
// ============================================

export interface RedditRawResponse {
  kind: string;
  data: {
    children: RedditRawChild[];
    after: string | null;
    before: string | null;
  };
}

export interface RedditRawChild {
  kind: 't1' | 't3' | 'more'; // t1 = comment, t3 = post, more = "load more"
  data: RedditRawPost | RedditRawComment | RedditRawMore;
}

export interface RedditRawPost {
  id: string;
  name: string;
  title: string;
  selftext: string;
  selftext_html: string | null;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  is_self: boolean;
  over_18: boolean;
  spoiler: boolean;
  locked: boolean;
  archived: boolean;
  link_flair_text: string | null;
  author_flair_text: string | null;
}

export interface RedditRawComment {
  id: string;
  name: string;
  body: string;
  body_html: string;
  author: string;
  score: number;
  created_utc: number;
  edited: boolean | number;
  parent_id: string;
  link_id: string;
  permalink: string;
  depth: number;
  is_submitter: boolean;
  distinguished: string | null;
  stickied: boolean;
  score_hidden: boolean;
  controversiality: number;
  total_awards_received: number;
  replies: '' | RedditRawResponse;
}

export interface RedditRawMore {
  id: string;
  name: string;
  count: number;
  depth: number;
  parent_id: string;
  children: string[];
}

// ============================================
// Normalized Types (our clean schema)
// ============================================

export interface NormalizedThread {
  id: string;
  title: string;
  body: string;
  bodyHtml: string | null;
  author: string;
  subreddit: string;
  score: number;
  upvoteRatio: number;
  commentCount: number;
  createdAt: string; // ISO string
  createdUtc: number;
  permalink: string;
  url: string;
  isSelf: boolean;
  isNsfw: boolean;
  isSpoiler: boolean;
  isLocked: boolean;
  isArchived: boolean;
  flair: string | null;
  authorFlair: string | null;
}

export interface NormalizedComment {
  id: string;
  body: string;
  bodyHtml: string;
  author: string;
  score: number;
  createdAt: string; // ISO string
  createdUtc: number;
  edited: boolean;
  editedAt: string | null;
  parentId: string; // 't3_xxx' for top-level, 't1_xxx' for replies
  threadId: string;
  permalink: string;
  depth: number;
  isOP: boolean;
  isDistinguished: boolean;
  isStickied: boolean;
  isScoreHidden: boolean;
  controversiality: number;
  awards: number;
}

export interface NormalizedData {
  thread: NormalizedThread;
  comments: NormalizedComment[];
  meta: {
    fetchedAt: string;
    totalComments: number;
    maxDepth: number;
    depthFilter: DepthLevel;
    truncated: boolean;
    moreCommentsAvailable: number;
  };
}

// ============================================
// Insights Types (LLM analysis output)
// ============================================

export interface PainPoint {
  id: string;
  title: string;
  description: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  exampleCommentIds: string[];
  keywords: string[];
}

export interface BuyingIntent {
  id: string;
  stage: 'curious' | 'evaluating' | 'ready';
  summary: string;
  quote: string;
  commentId: string;
  author: string;
  indicators: string[];
}

export interface SolutionMention {
  id: string;
  name: string;
  type: 'product' | 'service' | 'diy' | 'competitor' | 'workaround';
  sentiment: 'positive' | 'negative' | 'neutral';
  mentions: number;
  commentIds: string[];
}

export interface Persona {
  id: string;
  label: string;
  traits: string[];
  painPoints: string[];
  commentIds: string[];
  percentage: number;
}

export interface Objection {
  id: string;
  reason: string;
  frequency: number;
  commentIds: string[];
}

export interface InsightsData {
  thesis: string; // One-line summary
  pains: PainPoint[];
  buyingIntent: BuyingIntent[];
  solutions: SolutionMention[];
  personas: Persona[];
  objections: Objection[];
  meta: {
    analyzedAt: string;
    commentsAnalyzed: number;
    confidenceScore: number;
  };
}

// ============================================
// API Request/Response Types
// ============================================

export interface FetchThreadRequest {
  url: string;
  depth: DepthLevel;
  sort?: 'best' | 'top' | 'new' | 'controversial' | 'old' | 'qa';
  maxComments?: number;
  minScore?: number;
}

export interface FetchThreadResponse {
  success: boolean;
  data?: NormalizedData;
  raw?: [RedditRawResponse, RedditRawResponse]; // [post, comments]
  error?: string;
  cached?: boolean;
}

export interface AnalyzeRequest {
  threadId: string;
  data: NormalizedData;
}

export interface AnalyzeResponse {
  success: boolean;
  insights?: InsightsData;
  error?: string;
}

// ============================================
// Store Types
// ============================================

export interface MinerState {
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
  reset: () => void;
  mine: () => Promise<void>;
}

