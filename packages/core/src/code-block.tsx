import { useCallback, useState } from 'react';
import { type HighlightMode, highlight } from './syntax-highlight';

export type { HighlightMode };

/** Inline copy icon (Lucide "Copy" path) to avoid external dependency in core */
function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function CodeBlock({
  code,
  mode = 'css',
}: {
  code: string;
  mode?: HighlightMode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 h-7 w-7 p-0 z-10 inline-flex items-center justify-center rounded-[min(var(--radius-md,6px),12px)] bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all outline-none cursor-pointer"
      >
        {copied ? <span className="text-[10px]">✓</span> : <CopyIcon />}
      </button>
      <pre className="bg-background border border-border rounded-md p-4 pr-10 overflow-auto h-80 text-caption font-mono leading-relaxed whitespace-pre">
        <code>{highlight(code, mode)}</code>
      </pre>
    </div>
  );
}
