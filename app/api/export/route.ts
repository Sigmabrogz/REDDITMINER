// ============================================
// API: Export Thread Data
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { NormalizedData } from '@/lib/schemas';
import { toMarkdown, toCSV } from '@/lib/reddit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, format } = body as { 
      data: NormalizedData; 
      format: 'json' | 'markdown' | 'csv' 
    };
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Data is required' },
        { status: 400 }
      );
    }
    
    let content: string;
    let filename: string;
    let mimeType: string;
    
    const slug = data.thread.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50);
    
    switch (format) {
      case 'markdown':
        content = toMarkdown(data);
        filename = `${slug}.md`;
        mimeType = 'text/markdown';
        break;
        
      case 'csv':
        content = toCSV(data);
        filename = `${slug}-comments.csv`;
        mimeType = 'text/csv';
        break;
        
      case 'json':
      default:
        content = JSON.stringify(data, null, 2);
        filename = `${slug}.json`;
        mimeType = 'application/json';
        break;
    }
    
    return NextResponse.json({
      success: true,
      content,
      filename,
      mimeType,
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      },
      { status: 500 }
    );
  }
}

