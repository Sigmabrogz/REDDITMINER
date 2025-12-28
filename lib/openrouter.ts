// ============================================
// THREADMINER - OpenRouter AI Integration
// https://github.com/Sigmabrogz/REDDITMINER
// Uses xiaomi/mimo-v2-flash:free model
// ============================================

import { NormalizedComment } from './schemas';

const OPENROUTER_API_KEY = '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';
const MODEL = 'xiaomi/mimo-v2-flash:free';

export interface AIInsight {
  painPoints: {
    text: string;
    comment: NormalizedComment;
    confidence: number;
  }[];
  buyingIntent: {
    text: string;
    comment: NormalizedComment;
    stage: 'awareness' | 'consideration' | 'decision';
  }[];
  solutions: {
    text: string;
    comment: NormalizedComment;
    productMentioned?: string;
  }[];
  shillWarnings: {
    text: string;
    comment: NormalizedComment;
    reason: string;
  }[];
  summary: string;
}

export async function analyzeWithAI(
  comments: NormalizedComment[],
  threadTitle: string,
  onProgress?: (step: string) => void
): Promise<AIInsight | null> {
  try {
    onProgress?.('Preparing comments for AI analysis...');
    
    // Take top 50 comments by score for analysis (to stay within token limits)
    const topComments = [...comments]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
    
    // Format comments for the prompt
    const commentsText = topComments
      .map((c, i) => `[${i + 1}] (score: ${c.score}, by u/${c.author}): "${c.body.slice(0, 500)}"`)
      .join('\n\n');
    
    const prompt = `Analyze these Reddit comments from the thread "${threadTitle}".

COMMENTS:
${commentsText}

Provide a JSON response with this exact structure:
{
  "painPoints": [{"index": 1, "text": "summary of pain point", "confidence": 0.9}],
  "buyingIntent": [{"index": 2, "text": "what they want to buy", "stage": "consideration"}],
  "solutions": [{"index": 3, "text": "solution mentioned", "productMentioned": "ProductName"}],
  "shillWarnings": [{"index": 4, "text": "why suspicious", "reason": "affiliate link"}],
  "summary": "2-3 sentence summary of key insights"
}

Rules:
- "index" refers to the comment number [1], [2], etc.
- Only include items with strong signals, not every comment
- "stage" must be: awareness, consideration, or decision
- Be concise, max 50 words per text field
- Return valid JSON only, no markdown`;

    onProgress?.('Sending to AI model...');
    
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
            content: 'You are an expert market researcher analyzing Reddit comments. Extract actionable insights about pain points, buying intent, and product recommendations. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return null;
    }

    onProgress?.('Processing AI response...');
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return null;
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    if (content.includes('```')) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      jsonStr = match ? match[1] : content;
    }
    
    const parsed = JSON.parse(jsonStr.trim());
    
    // Map indices back to actual comments
    const result: AIInsight = {
      painPoints: (parsed.painPoints || []).map((p: { index: number; text: string; confidence: number }) => ({
        text: p.text,
        comment: topComments[p.index - 1] || topComments[0],
        confidence: p.confidence || 0.8,
      })),
      buyingIntent: (parsed.buyingIntent || []).map((b: { index: number; text: string; stage: string }) => ({
        text: b.text,
        comment: topComments[b.index - 1] || topComments[0],
        stage: b.stage as 'awareness' | 'consideration' | 'decision',
      })),
      solutions: (parsed.solutions || []).map((s: { index: number; text: string; productMentioned?: string }) => ({
        text: s.text,
        comment: topComments[s.index - 1] || topComments[0],
        productMentioned: s.productMentioned,
      })),
      shillWarnings: (parsed.shillWarnings || []).map((w: { index: number; text: string; reason: string }) => ({
        text: w.text,
        comment: topComments[w.index - 1] || topComments[0],
        reason: w.reason,
      })),
      summary: parsed.summary || 'Analysis complete.',
    };

    return result;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return null;
  }
}

