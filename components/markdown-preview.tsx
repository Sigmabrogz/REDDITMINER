'use client';

import { motion } from 'framer-motion';
import { NormalizedData } from '@/lib/schemas';

interface MarkdownPreviewProps {
  data: NormalizedData;
}

export function MarkdownPreview({ data }: MarkdownPreviewProps) {
  const { thread, comments, meta } = data;

  // Build comment tree
  const topLevel = comments.filter(c => c.parentId.startsWith('t3_'));
  
  const getReplies = (commentId: string) => {
    return comments.filter(c => c.parentId === `t1_${commentId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-secondary)]"
    >
      {/* Thread header */}
      <div className="p-6 border-b-2 border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-3">
          <span className="text-[var(--accent-tertiary)] font-medium">r/{thread.subreddit}</span>
          <span>•</span>
          <span>{thread.score.toLocaleString()} points</span>
          <span>•</span>
          <span>{thread.commentCount.toLocaleString()} comments</span>
        </div>
        
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
          {thread.title}
        </h2>
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span>Posted by</span>
          <span className="text-[var(--accent-secondary)]">u/{thread.author}</span>
          <span>•</span>
          <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>
        
        {thread.body && (
          <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-secondary)] text-sm whitespace-pre-wrap">
            {thread.body}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Comments ({meta.totalComments} shown)
          </h3>
          {meta.moreCommentsAvailable > 0 && (
            <span className="text-xs text-[var(--text-muted)]">
              +{meta.moreCommentsAvailable} more available
            </span>
          )}
        </div>

        <div className="space-y-4">
          {topLevel.map((comment, index) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              getReplies={getReplies}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface CommentNodeProps {
  comment: NormalizedData['comments'][0];
  getReplies: (id: string) => NormalizedData['comments'];
  delay?: number;
  depth?: number;
}

function CommentNode({ comment, getReplies, delay = 0, depth = 0 }: CommentNodeProps) {
  const replies = getReplies(comment.id);
  const maxDepth = 4;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`
        relative pl-4 
        ${depth > 0 ? 'border-l-2 border-[var(--border-subtle)]' : ''}
      `}
    >
      {/* Comment header */}
      <div className="flex items-center gap-2 text-sm mb-1">
        <span className={`font-medium ${comment.isOP ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-secondary)]'}`}>
          u/{comment.author}
        </span>
        {comment.isOP && (
          <span className="px-1.5 py-0.5 text-xs bg-[var(--accent-primary)] text-[var(--text-inverse)] rounded">
            OP
          </span>
        )}
        <span className="text-[var(--text-muted)]">•</span>
        <span className="text-[var(--text-muted)]">{comment.score} points</span>
        {comment.awards > 0 && (
          <>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[var(--accent-secondary)]">🏆 {comment.awards}</span>
          </>
        )}
      </div>

      {/* Comment body */}
      <div className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap mb-2">
        {comment.body}
      </div>

      {/* Replies */}
      {replies.length > 0 && depth < maxDepth && (
        <div className="mt-3 space-y-3">
          {replies.map((reply, index) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              getReplies={getReplies}
              delay={delay + (index + 1) * 0.03}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {replies.length > 0 && depth >= maxDepth && (
        <div className="text-xs text-[var(--text-muted)] mt-2">
          + {replies.length} more replies...
        </div>
      )}
    </motion.div>
  );
}

