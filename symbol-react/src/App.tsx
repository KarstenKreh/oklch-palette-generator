import { useCallback, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { SymbolControls } from '@/components/symbol-controls';
import { SymbolPreview } from '@/components/symbol-preview';
import { CodeExport } from '@/components/code-export';
import { AppShell } from '@core/app-shell';
import { useSymbolStore } from '@/store/symbol-store';
import { encodeState } from '@/lib/url-state';
import { buildUnifiedHash, getMySegment } from '@core/unified-hash';
import { useUrlState } from '@/hooks/use-url-state';

function App() {
  const store = useSymbolStore();
  const otherSegments = useUrlState();

  const getCurrentHash = useCallback(() => {
    const symbolEncoded = encodeState(store);
    return buildUnifiedHash({
      c: otherSegments.c || undefined,
      t: otherSegments.t || undefined,
      s: otherSegments.s || undefined,
      y: symbolEncoded,
      p: otherSegments.p || undefined,
    });
  }, [store, otherSegments]);

  const handleShare = useCallback(() => {
    const hash = getCurrentHash();
    const params = new URLSearchParams();
    const cs = otherSegments.c;
    if (cs) {
      const parts = cs.split(',');
      const hex = parts[0];
      const name = parts[10] ? decodeURIComponent(parts[10]) : '';
      if (name) params.set('t', name);
      if (/^[0-9a-fA-F]{6}$/.test(hex)) params.set('c', hex);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const url = window.location.origin + window.location.pathname + query + '#' + hash;
    navigator.clipboard.writeText(url).then(() => toast('Share link copied!'));
  }, [getCurrentHash, otherSegments]);

  // Read brand color from color hash on mount
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    const colorSegment = getMySegment(raw, 'c');
    if (colorSegment) {
      const parts = colorSegment.split(',');
      const brandHex = parts[0];
      if (/^[0-9a-fA-F]{6}$/.test(brandHex)) {
        store.setSurfaceHex('#' + brandHex);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TooltipProvider>
      <AppShell activeTool="symbol" buildHash={getCurrentHash}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-semibold" style={{ fontSize: 'var(--text-h4)', lineHeight: 'var(--leading-h4)' }}>
            Symbol
          </h1>
          <Button variant="default" onClick={handleShare}>
            Share Config
          </Button>
        </div>
        <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-body-s)' }}>
          Find the icon set that matches your brand &mdash; get sizing tokens and export recommendations.
        </p>

        {/* Main layout: controls + preview */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-6 mb-8">
          <div>
            <SymbolControls />
          </div>
          <div>
            <h3 className="text-body-s font-semibold mb-3">Preview</h3>
            <SymbolPreview />
          </div>
        </div>

        {/* Code Export */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <CodeExport />
        </div>
      </AppShell>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
