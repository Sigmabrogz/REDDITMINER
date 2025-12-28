'use client';

import { NormalizedData } from '@/lib/schemas';

interface ThreadHeaderProps {
  thread: NormalizedData['thread'];
}

export function ThreadHeader({ thread }: ThreadHeaderProps) {
  return (
    <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-subtle)]">
      {/* Subreddit and meta */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
        <span className="px-2 py-0.5 bg-[var(--accent-tertiary)] text-[var(--text-inverse)] rounded font-medium text-xs">
          r/{thread.subreddit}
        </span>
        <span>•</span>
        <span>{thread.commentCount.toLocaleString()} comments</span>
        <span>•</span>
        <span>{(thread.upvoteRatio * 100).toFixed(0)}% upvoted</span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
        {thread.title}
      </h2>

      {/* Author and date */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span>Posted by</span>
        <span className="text-[var(--accent-secondary)]">u/{thread.author}</span>
        <span>•</span>
        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Flair */}
      {thread.flair && (
        <div className="mt-2">
          <span className="px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-xs">
            {thread.flair}
          </span>
        </div>
      )}
    </div>
  );
}

