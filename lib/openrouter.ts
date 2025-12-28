// ============================================
// THREADMINER - Founder-Focused AI Analysis
// https://github.com/Sigmabrogz/REDDITMINER
// Sharp insights for builders, not fluff
// ============================================

import { NormalizedComment } from './schemas';

// API key must be set via environment variable
// Create .env.local with: NEXT_PUBLIC_OPENROUTER_API_KEY=your-key
// Get your free key at: https://openrouter.ai/keys
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
const MODEL = 'xiaomi/mimo-v2-flash:free';

// ============================================
// Founder-Focused Insight Types
// ============================================

export interface MarketSignals {
  demandStrength: 'hot' | 'warm' | 'cold';
  demandReason: string;
  priceRange: string;
  urgency: 'high' | 'medium' | 'low';
  urgencyReason: string;
}

export interface GoldNugget {
  insight: string;
  actionable: string;
  comment: NormalizedComment;
}

export interface BuyerSignal {
  quote: string;
  stage: 'ready' | 'researching' | 'curious';
  followUp: string;
  comment: NormalizedComment;
}

export interface CompetitorIntel {
  name: string;
  sentiment: 'loved' | 'hated' | 'meh';
  weakness: string;
  commentIndex: number;
}

export interface RedFlag {
  issue: string;
  severity: 'dealbreaker' | 'caution' | 'minor';
  comment: NormalizedComment;
}

export interface ShillWarning {
  reason: string;
  comment: NormalizedComment;
}

export interface AIInsight {
  // The ONE thing a founder should know
  tldr: string;
  
  // Market pulse
  marketSignals: MarketSignals;
  
  // Problems worth solving (max 5)
  goldNuggets: GoldNugget[];
  
  // People ready to pay
  buyerSignals: BuyerSignal[];
  
  // Competitor landscape
  competitors: CompetitorIntel[];
  
  // Why this market might suck
  redFlags: RedFlag[];
  
  // Suspicious activity
  shills: ShillWarning[];
}

// ============================================
// AI Analysis Function
// ============================================

export async function analyzeWithAI(
  comments: NormalizedComment[],
  threadTitle: string,
  onProgress?: (step: string) => void
): Promise<AIInsight | null> {
  if (!OPENROUTER_API_KEY) {
    console.log('OpenRouter API key not configured.');
    return null;
  }

  try {
    onProgress?.('Scanning for founder insights...');
    
    // Take top 50 comments by score
    const topComments = [...comments]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
    
    // Format comments
    const commentsText = topComments
      .map((c, i) => `[${i + 1}] (score: ${c.score}, u/${c.author}): "${c.body.slice(0, 400)}"`)
      .join('\n\n');
    
    const prompt = `You are a sharp startup analyst. A founder is evaluating this Reddit thread for product-market fit signals.

THREAD: "${threadTitle}"

COMMENTS:
${commentsText}

Extract ACTIONABLE insights. Be ruthless - only flag what matters for building/selling a product.

Return this exact JSON structure:
{
  "tldr": "One killer insight a founder should act on TODAY (be specific, not generic)",
  "marketSignals": {
    "demandStrength": "hot|warm|cold",
    "demandReason": "Why this demand level (1 sentence)",
    "priceRange": "$X-$Y range mentioned or 'unclear'",
    "urgency": "high|medium|low",
    "urgencyReason": "Why this urgency (1 sentence)"
  },
  "goldNuggets": [
    {"index": 1, "insight": "Exact problem to solve", "actionable": "What to build/do about it"}
  ],
  "buyerSignals": [
    {"index": 2, "quote": "Key phrase showing buying intent", "stage": "ready|researching|curious", "followUp": "How founder could reach this person"}
  ],
  "competitors": [
    {"name": "ProductX", "sentiment": "loved|hated|meh", "weakness": "Gap founder can exploit"}
  ],
  "redFlags": [
    {"index": 3, "issue": "Why this market might be bad", "severity": "dealbreaker|caution|minor"}
  ],
  "shills": [
    {"index": 4, "reason": "Why this comment is suspicious"}
  ]
}

RULES:
- tldr: ONE actionable sentence. "Users want better UX" = useless. "D2C brands need Instagram-first agencies under $2k/month" = gold.
- goldNuggets: Max 5. Problems people will PAY to solve. Skip generic complaints.
- buyerSignals: Only people actively looking to spend money. Include their exact words.
- competitors: Only if explicitly named. Note what people love/hate about them.
- redFlags: Market saturation, price sensitivity, regulatory issues, or signs of low willingness to pay.
- shills: Overly promotional comments, affiliate vibes, or suspiciously detailed product pitches.
- If a category has nothing valuable, return empty array []. Don't pad with weak signals.
- Return ONLY valid JSON, no markdown.`;

    onProgress?.('AI analyzing market signals...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://threadminer.app',
        'X-Title': 'ThreadMiner',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a ruthless startup analyst. Extract only actionable insights that help founders find product-market fit. No fluff, no generic advice. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return null;
    }

    onProgress?.('Extracting actionable intel...');
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return null;
    }

    // Parse JSON (handle markdown code blocks)
    let jsonStr = content;
    if (content.includes('```')) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      jsonStr = match ? match[1] : content;
    }
    
    const parsed = JSON.parse(jsonStr.trim());
    
    // Map to typed result
    const result: AIInsight = {
      tldr: parsed.tldr || 'No clear actionable insight found.',
      
      marketSignals: {
        demandStrength: parsed.marketSignals?.demandStrength || 'cold',
        demandReason: parsed.marketSignals?.demandReason || 'Insufficient data',
        priceRange: parsed.marketSignals?.priceRange || 'unclear',
        urgency: parsed.marketSignals?.urgency || 'low',
        urgencyReason: parsed.marketSignals?.urgencyReason || 'No urgency signals detected',
      },
      
      goldNuggets: (parsed.goldNuggets || []).slice(0, 5).map((g: { index: number; insight: string; actionable: string }) => ({
        insight: g.insight,
        actionable: g.actionable,
        comment: topComments[g.index - 1] || topComments[0],
      })),
      
      buyerSignals: (parsed.buyerSignals || []).map((b: { index: number; quote: string; stage: string; followUp: string }) => ({
        quote: b.quote,
        stage: b.stage as 'ready' | 'researching' | 'curious',
        followUp: b.followUp,
        comment: topComments[b.index - 1] || topComments[0],
      })),
      
      competitors: (parsed.competitors || []).map((c: { name: string; sentiment: string; weakness: string; index?: number }) => ({
        name: c.name,
        sentiment: c.sentiment as 'loved' | 'hated' | 'meh',
        weakness: c.weakness,
        commentIndex: c.index || 0,
      })),
      
      redFlags: (parsed.redFlags || []).map((r: { index: number; issue: string; severity: string }) => ({
        issue: r.issue,
        severity: r.severity as 'dealbreaker' | 'caution' | 'minor',
        comment: topComments[r.index - 1] || topComments[0],
      })),
      
      shills: (parsed.shills || []).map((s: { index: number; reason: string }) => ({
        reason: s.reason,
        comment: topComments[s.index - 1] || topComments[0],
      })),
    };

    return result;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return null;
  }
}
