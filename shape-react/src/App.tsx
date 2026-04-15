import { useCallback, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { ShapeControls } from '@/components/shape-controls';
import { ShapePreview } from '@/components/shape-preview';
import { CodeExport } from '@/components/code-export';
import { AppShell } from '@core/app-shell';
import { useShapeStore } from '@/store/shape-store';
import { encodeState } from '@/lib/url-state';
import { buildUnifiedHash, getMySegment } from '@core/unified-hash';
import { useUrlState } from '@/hooks/use-url-state';
import { computeAutoErrorHex } from '@core/palette';

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
      y: otherSegments.y || undefined,
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

  // Read brand color, palette mode, and chroma from color hash on mount
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    const colorSegment = getMySegment(raw, 'c');
    if (colorSegment) {
      const parts = colorSegment.split(',');
      const brandHex = parts[0];
      if (/^[0-9a-fA-F]{6}$/.test(brandHex)) {
        store.setSurfaceHex('#' + brandHex);
      }
      const chromaPct = parseInt(parts[5]);
      if (!isNaN(chromaPct)) {
        store.setChromaScale(chromaPct / 100);
      }
      const mode = parts[6];
      if (mode === 'balanced' || mode === 'exact') {
        store.setPaletteMode(mode);
      }
      if (parts[7] === '1' || parts[7] === '0') {
        store.setBrandPin(parts[7] === '1');
      }
      // parts[3] = errorColorHex, parts[4] = errorAutoMatch, parts[8] = errorPin, parts[12] = errorInvert
      const errorHexRaw = parts[3];
      const errorAutoMatch = parts[4] !== '0';
      const effectiveErrorHex = errorAutoMatch
        ? computeAutoErrorHex('#' + brandHex)
        : (/^[0-9a-fA-F]{6}$/.test(errorHexRaw) ? '#' + errorHexRaw : '#CC3333');
      store.setErrorHex(effectiveErrorHex);
      if (parts[8] === '1' || parts[8] === '0') {
        store.setErrorPin(parts[8] === '1');
      }
      if (parts[12] === '1' || parts[12] === '0') {
        store.setErrorInvert(parts[12] === '1');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TooltipProvider>
      <AppShell activeTool="shape" buildHash={getCurrentHash}>
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
          Choose a visual style &mdash; configure its tokens &mdash; export production-ready code.
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
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <CodeExport />
        </div>
      </AppShell>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
