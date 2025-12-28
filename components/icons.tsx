// ============================================
// THREADMINER - SVG Icons
// https://github.com/Sigmabrogz/REDDITMINER
// Replace all emojis with clean SVG icons
// ============================================

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Pickaxe icon (logo)
export function PickaxeIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M14.5 3.5L20.5 9.5L18 12L12 6L14.5 3.5Z" 
        fill="currentColor" 
        opacity="0.8"
      />
      <path 
        d="M12 6L6 12L3 21L12 18L18 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M3 21L10 14" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// Fire icon (pain points)
export function FireIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" 
        fill="currentColor"
      />
      <path 
        d="M12 22C16.42 22 20 18.42 20 14C20 9.58 12 2 12 2C12 2 4 9.58 4 14C4 18.42 7.58 22 12 22Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Dollar/Money icon (buying intent)
export function MoneyIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M12 6V18M15 9.5C15 8.12 13.66 7 12 7C10.34 7 9 8.12 9 9.5C9 10.88 10.34 12 12 12C13.66 12 15 13.12 15 14.5C15 15.88 13.66 17 12 17C10.34 17 9 15.88 9 14.5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// Checkmark icon (solutions)
export function CheckIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M8 12L11 15L16 9" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Warning/Alert icon (shill detection)
export function AlertIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M12 2L2 22H22L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M12 9V13M12 17H12.01" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// Trophy icon (top comments)
export function TrophyIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M6 9H4C3 9 2 8 2 7V6C2 5 3 4 4 4H6" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M18 9H20C21 9 22 8 22 7V6C22 5 21 4 20 4H18" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M6 4H18V11C18 14.31 15.31 17 12 17C8.69 17 6 14.31 6 11V4Z" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      <path 
        d="M12 17V20M8 20H16" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// Search/Magnifier icon
export function SearchIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M21 21L16 16" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// Star icon
export function StarIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  );
}

// Lightning/Bolt icon (cached/fast)
export function BoltIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
    </svg>
  );
}

// Sparkles icon (AI)
export function SparklesIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" 
        fill="currentColor"
      />
      <path 
        d="M19 15L19.5 17L21.5 17.5L19.5 18L19 20L18.5 18L16.5 17.5L18.5 17L19 15Z" 
        fill="currentColor"
      />
      <path 
        d="M5 2L5.5 4L7.5 4.5L5.5 5L5 7L4.5 5L2.5 4.5L4.5 4L5 2Z" 
        fill="currentColor"
      />
    </svg>
  );
}

// Comment/Chat icon
export function CommentIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Arrow/Signal icon
export function SignalIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M12 20V10M18 20V4M6 20V16" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Layers/Depth icon
export function LayersIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M12 2L2 7L12 12L22 7L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M2 17L12 22L22 17" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M2 12L12 17L22 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Download/Export icon
export function DownloadIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M21 15V19C21 19.53 20.79 20.04 20.41 20.41C20.04 20.79 19.53 21 19 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V15" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M7 10L12 15L17 10M12 15V3" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Lightbulb/Tip icon
export function LightbulbIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M9 21H15M12 3C8.69 3 6 5.69 6 9C6 11.22 7.21 13.15 9 14.19V17C9 17.55 9.45 18 10 18H14C14.55 18 15 17.55 15 17V14.19C16.79 13.15 18 11.22 18 9C18 5.69 15.31 3 12 3Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// GitHub icon
export function GitHubIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

// X/Twitter icon
export function XIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// Chevron icons
export function ChevronRightIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
    >
      <path 
        d="M6 4L10 8L6 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
    >
      <path 
        d="M4 6L8 10L12 6" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Back arrow
export function ArrowLeftIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
    >
      <path 
        d="M10 12L6 8L10 4" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Close/X icon
export function CloseIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
    >
      <path 
        d="M12 4L4 12M4 4L12 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// Copy icon
export function CopyIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" 
        stroke="currentColor" 
        strokeWidth="2"
      />
    </svg>
  );
}

// Clock/History icon
export function ClockIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M12 6V12L16 14" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// Trash icon
export function TrashIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M3 6H5H21" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M8 6V4C8 3.47 8.21 2.96 8.59 2.59C8.96 2.21 9.47 2 10 2H14C14.53 2 15.04 2.21 15.41 2.59C15.79 2.96 16 3.47 16 4V6M19 6V20C19 20.53 18.79 21.04 18.41 21.41C18.04 21.79 17.53 22 17 22H7C6.47 22 5.96 21.79 5.59 21.41C5.21 21.04 5 20.53 5 20V6H19Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// User icon
export function UserIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path 
        d="M5.5 21C5.5 17.13 8.41 14 12 14C15.59 14 18.5 17.13 18.5 21" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

