import { useCallback, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
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
import { useFavicon } from '@/hooks/use-favicon';

function App() {
  const palette = usePalette();
  const { themeName, setThemeName, brandHex } = useThemeStore();
  const store = useThemeStore();

  useThemeCss(palette.brand, palette.slated, palette.neutral);
  useUrlState();
  useFavicon(brandHex);

  const handleShare = useCallback(() => {
    const url = window.location.origin + window.location.pathname + '#' + encodeState(store);
    navigator.clipboard.writeText(url).then(() => toast('Share link copied!'));
  }, [store]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    document.title = themeName ? `${themeName} — OKLCH Theme Generator` : 'OKLCH Theme Generator';
  }, [themeName]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
            OKLCH Theme Generator
          </h1>
          <Button variant="default" onClick={handleShare}>
            Share Theme
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Define <strong>Brand</strong>, <strong>Surface</strong> and <strong>Error</strong> seed colors &rarr; generates perceptually uniform <strong>Primitive Token</strong> scales in the OKLCH color space, maps them to ready-to-use <strong>Semantic Tokens</strong> (shadcn/ui compatible), and previews your theme across Light, Dark and High Contrast modes.
        </p>

        {/* Main layout: controls + preview */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-6 mb-8">
          <div>
            <SeedColors />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-3">Theme Preview</h3>
            <SurfacePreview />
          </div>
        </div>

        {/* Primitive Tokens */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h2 className="text-base font-semibold mb-3">Primitive Tokens</h2>
          <PrimitiveTabs />
        </div>

        {/* Code Export */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <CodeExport />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
