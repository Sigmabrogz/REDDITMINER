// ============================================
// API: Fetch Reddit Thread
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { fetchThread } from '@/lib/reddit';
import { FetchThreadRequest } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body: FetchThreadRequest = await request.json();
    
    // Validate required fields
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Set defaults
    const fetchRequest: FetchThreadRequest = {
      url: body.url,
      depth: body.depth || 'level2',
      sort: body.sort || 'best',
      maxComments: body.maxComments || 500,
      minScore: body.minScore || 0,
    };
    
    // Fetch and normalize
    const result = await fetchThread(fetchRequest);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Fetch thread error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

