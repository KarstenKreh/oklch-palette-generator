import { useCallback } from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { type HighlightMode, highlight } from '@core/syntax-highlight';

export type { HighlightMode };

export function CodeBlock({ code, mode = 'css' }: { code: string; mode?: HighlightMode }) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => toast('Copied!'));
  }, [code]);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 h-7 w-7 p-0 z-10 inline-flex items-center justify-center rounded-[min(var(--radius-md,6px),12px)] bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all outline-none cursor-pointer"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <pre className="bg-background border border-border rounded-md p-4 pr-10 overflow-auto h-80 text-caption font-mono leading-relaxed whitespace-pre">
        <code>{highlight(code, mode)}</code>
      </pre>
    </div>
  );
}
