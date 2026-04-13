import { useCallback, useMemo, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { SeedColors } from '@/components/seed-colors';
import { PrimitiveTabs } from '@/components/primitive-tabs';
import { SurfacePreview } from '@/components/surface-preview';
import { CodeExport } from '@/components/code-export';
import { usePalette } from '@/hooks/use-palette';
import { useThemeCss } from '@/hooks/use-theme-css';
import { useUrlState } from '@/hooks/use-url-state';
import { useThemeStore } from '@/store/theme-store';
import { encodeState } from '@/lib/url-state';
import { buildUnifiedHash } from '@core/unified-hash';
import { useFavicon } from '@/hooks/use-favicon';
import { AppShell } from '@core/app-shell';

function App() {
  const palette = usePalette();
  const { themeName, setThemeName, brandHex } = useThemeStore();
  const store = useThemeStore();

  useThemeCss(palette.brand, palette.slated, palette.neutral);
  const otherSegments = useUrlState();
  useFavicon(brandHex);

  // Derive shapeTokens (border + radius) from the decoded shape state for preview.
  const shapeTokens = useMemo(() => ({
    borderEnabled: otherSegments.shape?.borderEnabled ?? true,
    borderWidth: otherSegments.shape?.borderWidth ?? 1,
    borderRadius: otherSegments.shape?.borderRadius ?? 8,
  }), [otherSegments.shape]);

  const getCurrentHash = useCallback(() => {
    const colorEncoded = encodeState(store);
    return buildUnifiedHash({ c: colorEncoded, t: otherSegments.t, s: otherSegments.s, y: otherSegments.y });
  }, [store, otherSegments]);

  const handleShare = useCallback(() => {
    const name = store.themeName?.trim();
    const color = store.brandHex.replace('#', '');
    const params = new URLSearchParams();
    if (name) params.set('t', name);
    params.set('c', color);
    const query = params.toString() ? `?${params.toString()}` : '';
    const hash = getCurrentHash();
    const url = window.location.origin + window.location.pathname + query + '#' + hash;
    navigator.clipboard.writeText(url).then(() => toast('Share link copied!'));
  }, [store, getCurrentHash]);

  useEffect(() => {
    document.title = themeName ? `${themeName} — OKLCH Theme Generator` : 'OKLCH Theme Generator';
  }, [themeName]);

  return (
    <TooltipProvider>
      <AppShell activeTool="color" buildHash={getCurrentHash}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-semibold" style={{ fontSize: 'var(--text-h4)', lineHeight: 'var(--leading-h4)' }}>
            OKLCH Theme Generator
          </h1>
          <Button variant="default" onClick={handleShare}>
            Share Theme
          </Button>
        </div>
        <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-body-s)' }}>
          Define <strong>Brand</strong>, <strong>Surface</strong> and <strong>Error</strong> seed colors &rarr; generates perceptually uniform <strong>Primitive Token</strong> scales in the OKLCH color space, maps them to ready-to-use <strong>Semantic Tokens</strong> (shadcn/ui compatible), and previews your theme across Light, Dark and High Contrast modes.
        </p>

        {/* Main layout: controls + preview */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-6 mb-8">
          <div>
            <SeedColors />
          </div>
          <div>
            <h3 className="text-body-s font-semibold mb-3">Theme Preview</h3>
            <SurfacePreview shapeTokens={shapeTokens} shape={otherSegments.shape} />
          </div>
        </div>

        {/* Primitive Tokens */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h2 className="text-body-s font-semibold mb-3">Primitive Tokens</h2>
          <PrimitiveTabs />
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
