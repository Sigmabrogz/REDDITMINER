// ============================================
// THREADMINER - Reddit Fetch & Normalize Logic
// https://github.com/Sigmabrogz/REDDITMINER
// ============================================

import {
  RedditRawResponse,
  RedditRawComment,
  RedditRawPost,
  RedditRawMore,
  NormalizedThread,
  NormalizedComment,
  NormalizedData,
  DepthLevel,
  FetchThreadRequest,
  FetchThreadResponse,
} from './schemas';

// ============================================
// URL Parsing & Validation
// ============================================

const REDDIT_URL_REGEX = /^https?:\/\/(www\.|old\.|new\.)?reddit\.com\/r\/[\w]+\/comments\/[\w]+/;

export function isValidRedditUrl(url: string): boolean {
  return REDDIT_URL_REGEX.test(url);
}

export function parseRedditUrl(url: string): {
  subreddit: string;
  postId: string;
  slug: string;
} | null {
  try {
    const match = url.match(/reddit\.com\/r\/([\w]+)\/comments\/([\w]+)(?:\/([^/?]+))?/);
    if (!match) return null;
    
    return {
      subreddit: match[1],
      postId: match[2],
      slug: match[3] || '',
    };
  } catch {
    return null;
  }
}

export function buildJsonUrl(
  url: string,
  options: {
    sort?: string;
    limit?: number;
    depth?: number;
  } = {}
): string {
  // Clean the URL and add .json
  let cleanUrl = url.split('?')[0]; // Remove query params
  if (!cleanUrl.endsWith('/')) cleanUrl += '/';
  cleanUrl = cleanUrl.replace(/\/$/, '.json');
  
  // Add query params
  const params = new URLSearchParams();
  if (options.sort) params.set('sort', options.sort);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.depth) params.set('depth', options.depth.toString());
  
  const queryString = params.toString();
  return queryString ? `${cleanUrl}?${queryString}` : cleanUrl;
}

// ============================================
// Error Types for Specific Feedback
// ============================================

export class RedditAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorType: 'rate_limit' | 'not_found' | 'forbidden' | 'server_error' | 'network' | 'parse'
  ) {
    super(message);
    this.name = 'RedditAPIError';
  }
}

// ============================================
// Fetch Raw Thread Data with Retry Logic
// ============================================

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited, wait and retry
      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error');
      
      // Wait before retry on network errors
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw new RedditAPIError(
    'Network error: Could not connect to Reddit. Check your internet connection.',
    0,
    'network'
  );
}

export async function fetchRawThread(
  url: string,
  options: {
    sort?: string;
    limit?: number;
  } = {}
): Promise<[RedditRawResponse, RedditRawResponse]> {
  const jsonUrl = buildJsonUrl(url, options);
  
  let response: Response;
  
  try {
    // Use browser-like User-Agent to avoid Reddit bot detection
    const browserUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    response = await fetchWithRetry(jsonUrl, {
      headers: {
        'User-Agent': browserUserAgent,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.reddit.com/',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
  } catch (error) {
    if (error instanceof RedditAPIError) throw error;
    throw new RedditAPIError(
      'Network error: Could not connect to Reddit.',
      0,
      'network'
    );
  }
  
  // Handle specific HTTP errors with helpful messages
  if (!response.ok) {
    switch (response.status) {
      case 404:
        throw new RedditAPIError(
          'Thread not found. It may have been deleted, or the URL is incorrect.',
          404,
          'not_found'
        );
      case 403:
        throw new RedditAPIError(
          'Access denied. This subreddit may be private, quarantined, or banned.',
          403,
          'forbidden'
        );
      case 429:
        throw new RedditAPIError(
          'Reddit rate limit hit. Please wait 60 seconds and try again.',
          429,
          'rate_limit'
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new RedditAPIError(
          'Reddit servers are having issues. Try again in a few minutes.',
          response.status,
          'server_error'
        );
      default:
        throw new RedditAPIError(
          `Reddit returned an error (${response.status}). Try again later.`,
          response.status,
          'server_error'
        );
    }
  }
  
  // Parse JSON
  let data;
  try {
    data = await response.json();
  } catch {
    throw new RedditAPIError(
      'Failed to parse Reddit response. The thread may be corrupted or too large.',
      0,
      'parse'
    );
  }
  
  // Validate response structure
  if (!Array.isArray(data) || data.length < 2) {
    throw new RedditAPIError(
      'Invalid response from Reddit. This might not be a valid thread URL.',
      0,
      'parse'
    );
  }
  
  return data as [RedditRawResponse, RedditRawResponse];
}

// ============================================
// Normalize Thread Data
// ============================================

function normalizePost(raw: RedditRawPost): NormalizedThread {
  return {
    id: raw.id,
    title: raw.title,
    body: raw.selftext || '',
    bodyHtml: raw.selftext_html || null,
    author: raw.author,
    subreddit: raw.subreddit,
    score: raw.score,
    upvoteRatio: raw.upvote_ratio,
    commentCount: raw.num_comments,
    createdAt: new Date(raw.created_utc * 1000).toISOString(),
    createdUtc: raw.created_utc,
    permalink: `https://reddit.com${raw.permalink}`,
    url: raw.url,
    isSelf: raw.is_self,
    isNsfw: raw.over_18,
    isSpoiler: raw.spoiler,
    isLocked: raw.locked,
    isArchived: raw.archived,
    flair: raw.link_flair_text,
    authorFlair: raw.author_flair_text,
  };
}

function normalizeComment(raw: RedditRawComment, threadId: string): NormalizedComment {
  const editedAt = typeof raw.edited === 'number' 
    ? new Date(raw.edited * 1000).toISOString() 
    : null;
  
  return {
    id: raw.id,
    body: raw.body || '[deleted]',
    bodyHtml: raw.body_html || '',
    author: raw.author || '[deleted]',
    score: raw.score,
    createdAt: new Date(raw.created_utc * 1000).toISOString(),
    createdUtc: raw.created_utc,
    edited: !!raw.edited,
    editedAt,
    parentId: raw.parent_id,
    threadId,
    permalink: `https://reddit.com${raw.permalink}`,
    depth: raw.depth,
    isOP: raw.is_submitter,
    isDistinguished: !!raw.distinguished,
    isStickied: raw.stickied,
    isScoreHidden: raw.score_hidden,
    controversiality: raw.controversiality,
    awards: raw.total_awards_received || 0,
  };
}

// Recursively flatten comments from nested structure
function flattenComments(
  listing: RedditRawResponse,
  threadId: string,
  depthFilter: DepthLevel,
  minScore: number = 0
): { comments: NormalizedComment[]; moreCount: number } {
  const comments: NormalizedComment[] = [];
  let moreCount = 0;
  
  const maxDepth = depthFilter === 'top' ? 0 : depthFilter === 'level2' ? 1 : Infinity;
  
  function processChildren(children: typeof listing.data.children) {
    for (const child of children) {
      if (child.kind === 'more') {
        const more = child.data as RedditRawMore;
        moreCount += more.count || more.children?.length || 0;
        continue;
      }
      
      if (child.kind === 't1') {
        const commentData = child.data as RedditRawComment;
        
        // Skip if beyond depth filter
        if (commentData.depth > maxDepth) {
          // Count skipped comments
          if (commentData.replies && typeof commentData.replies !== 'string') {
            moreCount += countNestedComments(commentData.replies);
          }
          continue;
        }
        
        // Skip if below score threshold (but don't skip deleted)
        if (commentData.author !== '[deleted]' && commentData.score < minScore) {
          continue;
        }
        
        comments.push(normalizeComment(commentData, threadId));
        
        // Process nested replies
        if (commentData.replies && typeof commentData.replies !== 'string') {
          const nested = flattenComments(
            commentData.replies,
            threadId,
            depthFilter,
            minScore
          );
          comments.push(...nested.comments);
          moreCount += nested.moreCount;
        }
      }
    }
  }
  
  if (listing.data?.children) {
    processChildren(listing.data.children);
  }
  
  return { comments, moreCount };
}

function countNestedComments(listing: RedditRawResponse): number {
  let count = 0;
  
  for (const child of listing.data?.children || []) {
    if (child.kind === 'more') {
      count += (child.data as RedditRawMore).count || 0;
    } else if (child.kind === 't1') {
      count += 1;
      const comment = child.data as RedditRawComment;
      if (comment.replies && typeof comment.replies !== 'string') {
        count += countNestedComments(comment.replies);
      }
    }
  }
  
  return count;
}

export function normalizeThread(
  raw: [RedditRawResponse, RedditRawResponse],
  options: {
    depth: DepthLevel;
    maxComments?: number;
    minScore?: number;
  }
): NormalizedData {
  const [postListing, commentsListing] = raw;
  
  // Extract post data
  const postChild = postListing.data.children[0];
  if (!postChild || postChild.kind !== 't3') {
    throw new RedditAPIError(
      'Invalid thread data: could not find post content.',
      0,
      'parse'
    );
  }
  
  const thread = normalizePost(postChild.data as RedditRawPost);
  
  // Extract and flatten comments
  const { comments, moreCount } = flattenComments(
    commentsListing,
    thread.id,
    options.depth,
    options.minScore
  );
  
  // Apply max comments limit
  let finalComments = comments;
  let truncated = false;
  
  if (options.maxComments && comments.length > options.maxComments) {
    finalComments = comments.slice(0, options.maxComments);
    truncated = true;
  }
  
  // Calculate max depth in results
  const maxDepth = finalComments.reduce((max, c) => Math.max(max, c.depth), 0);
  
  return {
    thread,
    comments: finalComments,
    meta: {
      fetchedAt: new Date().toISOString(),
      totalComments: finalComments.length,
      maxDepth,
      depthFilter: options.depth,
      truncated,
      moreCommentsAvailable: moreCount + (truncated ? comments.length - finalComments.length : 0),
    },
  };
}

// ============================================
// Main Fetch Function (combines fetch + normalize)
// ============================================

export async function fetchThread(
  request: FetchThreadRequest
): Promise<FetchThreadResponse> {
  try {
    // Validate URL
    if (!isValidRedditUrl(request.url)) {
      return {
        success: false,
        error: 'Invalid Reddit URL. Please paste a link to a Reddit thread (should contain /r/subreddit/comments/).',
      };
    }
    
    // Fetch raw data
    const raw = await fetchRawThread(request.url, {
      sort: request.sort,
      limit: request.maxComments ? Math.min(request.maxComments * 2, 500) : 500,
    });
    
    // Normalize
    const normalized = normalizeThread(raw, {
      depth: request.depth,
      maxComments: request.maxComments,
      minScore: request.minScore,
    });
    
    return {
      success: true,
      data: normalized,
      raw,
      cached: false,
    };
  } catch (error) {
    // Handle our custom errors with specific messages
    if (error instanceof RedditAPIError) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    // Generic fallback
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
    };
  }
}

// ============================================
// Export Formatters
// ============================================

export function toMarkdown(data: NormalizedData): string {
  const { thread, comments, meta } = data;
  
  let md = '';
  
  // Header
  md += `# ${thread.title}\n\n`;
  md += `**r/${thread.subreddit}** • ${thread.score} points • ${thread.commentCount} comments\n`;
  md += `Posted by u/${thread.author} • ${new Date(thread.createdAt).toLocaleDateString()}\n\n`;
  
  // Post body
  if (thread.body) {
    md += `---\n\n${thread.body}\n\n`;
  }
  
  md += `---\n\n## Comments (${meta.totalComments} shown)\n\n`;
  
  // Build comment tree
  const topLevel = comments.filter(c => c.parentId.startsWith('t3_'));
  
  function renderComment(comment: NormalizedComment, indent: number = 0): string {
    const prefix = '  '.repeat(indent);
    const replies = comments.filter(c => c.parentId === `t1_${comment.id}`);
    
    let result = `${prefix}> **u/${comment.author}** • ${comment.score} points`;
    if (comment.isOP) result += ' • OP';
    result += '\n';
    
    // Add comment body with proper indentation
    const bodyLines = comment.body.split('\n');
    for (const line of bodyLines) {
      result += `${prefix}> ${line}\n`;
    }
    result += '\n';
    
    // Render replies
    for (const reply of replies) {
      result += renderComment(reply, indent + 1);
    }
    
    return result;
  }
  
  for (const comment of topLevel) {
    md += renderComment(comment);
  }
  
  // Footer
  md += `\n---\n\n*Mined by ThreadMiner • ${meta.fetchedAt}*\n`;
  
  return md;
}

export function toCSV(data: NormalizedData): string {
  const headers = [
    'id',
    'author',
    'body',
    'score',
    'depth',
    'parent_id',
    'created_at',
    'is_op',
    'awards',
    'permalink',
  ];
  
  const escapeCSV = (str: string) => {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const rows = data.comments.map(c => [
    c.id,
    c.author,
    escapeCSV(c.body.replace(/\n/g, ' ')),
    c.score.toString(),
    c.depth.toString(),
    c.parentId,
    c.createdAt,
    c.isOP ? 'true' : 'false',
    c.awards.toString(),
    c.permalink,
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

// ============================================
// Signal Extraction (Basic keyword-based)
// ============================================

const PAIN_KEYWORDS = [
  'hate', 'annoying', 'broken', 'sucks', 'problem', 'issue', 'frustrated',
  'terrible', 'worst', 'disappointed', 'useless', 'waste', 'awful', 'horrible',
  'doesn\'t work', 'stopped working', 'can\'t believe', 'never again', 'avoid'
];

const INTENT_KEYWORDS = [
  'recommend', 'best', 'should i buy', 'worth it', 'alternative', 'looking for',
  'suggestions', 'advice', 'which one', 'vs', 'compared to', 'better than',
  'where can i', 'how do i', 'anyone know', 'help me find'
];

const SOLUTION_KEYWORDS = [
  'i use', 'i switched to', 'try', 'works great', 'solved', 'fixed',
  'recommend', 'love', 'best', 'perfect for'
];

export interface BasicSignals {
  pains: { comment: NormalizedComment; keywords: string[] }[];
  intents: { comment: NormalizedComment; keywords: string[] }[];
  solutions: { comment: NormalizedComment; keywords: string[] }[];
}

export function extractBasicSignals(comments: NormalizedComment[]): BasicSignals {
  const pains: BasicSignals['pains'] = [];
  const intents: BasicSignals['intents'] = [];
  const solutions: BasicSignals['solutions'] = [];

  for (const comment of comments) {
    const bodyLower = comment.body.toLowerCase();
    
    // Check for pain points
    const painMatches = PAIN_KEYWORDS.filter(k => bodyLower.includes(k));
    if (painMatches.length > 0 && comment.score >= 2) {
      pains.push({ comment, keywords: painMatches });
    }
    
    // Check for buying intent
    const intentMatches = INTENT_KEYWORDS.filter(k => bodyLower.includes(k));
    if (intentMatches.length > 0) {
      intents.push({ comment, keywords: intentMatches });
    }
    
    // Check for solutions mentioned
    const solutionMatches = SOLUTION_KEYWORDS.filter(k => bodyLower.includes(k));
    if (solutionMatches.length > 0 && comment.score >= 5) {
      solutions.push({ comment, keywords: solutionMatches });
    }
  }

  // Sort by score
  pains.sort((a, b) => b.comment.score - a.comment.score);
  intents.sort((a, b) => b.comment.score - a.comment.score);
  solutions.sort((a, b) => b.comment.score - a.comment.score);

  return {
    pains: pains.slice(0, 20),
    intents: intents.slice(0, 20),
    solutions: solutions.slice(0, 20),
  };
}
