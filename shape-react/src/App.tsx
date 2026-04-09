import { useCallback, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { ShapeControls } from '@/components/shape-controls';
import { ShapePreview } from '@/components/shape-preview';
import { CodeExport } from '@/components/code-export';
import { ToolNav } from '@/components/tool-nav';
import { useShapeStore } from '@/store/shape-store';
import { encodeState } from '@/lib/url-state';
import { buildUnifiedHash, getMySegment } from '@/lib/unified-hash';
import { useUrlState } from '@/hooks/use-url-state';

function App() {
  const store = useShapeStore();

  // Read color and type segments from URL, sync shape state
  const otherSegments = useUrlState();

  const getCurrentHash = useCallback(() => {
    const shapeEncoded = encodeState(store);
    return buildUnifiedHash({
      c: otherSegments.c || undefined,
      t: otherSegments.t || undefined,
      s: shapeEncoded,
    });
  }, [store, otherSegments]);

  const handleShare = useCallback(() => {
    const hash = getCurrentHash();
    const url = window.location.origin + window.location.pathname + '#' + hash;
    navigator.clipboard.writeText(url).then(() => toast('Share link copied!'));
  }, [getCurrentHash]);

  // Read brand color from color hash on mount
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    const colorSegment = getMySegment(raw, 'c');
    if (colorSegment) {
      const brandHex = colorSegment.split(',')[0];
      if (/^[0-9a-fA-F]{6}$/.test(brandHex)) {
        store.setSurfaceHex('#' + brandHex);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="hidden md:flex sticky top-0 h-screen p-3 border-r border-border">
        <ToolNav activeTool="shape" buildHash={getCurrentHash} />
      </div>
      <div className="md:hidden">
        <ToolNav activeTool="shape" buildHash={getCurrentHash} />
      </div>
      <div className="flex-1 min-w-0 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-semibold" style={{ fontSize: 'var(--text-h4)', lineHeight: 'var(--leading-h4)' }}>
              Shape
            </h1>
            <Button variant="default" onClick={handleShare}>
              Share Config
            </Button>
          </div>
          <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-body-s)' }}>
            Configure <strong>Shadows</strong>, <strong>Borders</strong>, <strong>Radius</strong> and <strong>Focus Rings</strong> &mdash; export production-ready design tokens for your UI.
          </p>

          {/* Main layout: controls + preview */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-6 mb-8">
            <div>
              <ShapeControls />
            </div>
            <div>
              <h3 className="text-body-s font-semibold mb-3">Preview</h3>
              <ShapePreview />
            </div>
          </div>

          {/* Code Export */}
          <CodeExport />
        </div>
      </div>
      <Toaster />
    </div>
    </TooltipProvider>
  );
}

export default App;
