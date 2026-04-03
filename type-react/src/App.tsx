import { useEffect, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScaleControls } from '@/components/scale-controls';
import { TypePreview } from '@/components/type-preview';
import { ScaleTable } from '@/components/scale-table';
import { ScaleDiagram } from '@/components/scale-diagram';
import { SpacingTable } from '@/components/spacing-table';
import { CodeExport } from '@/components/code-export';
import { useFontLoader } from '@/hooks/use-font-loader';
import { useUrlState } from '@/hooks/use-url-state';
import { useTypeStore } from '@/store/type-store';
import { encodeState } from '@/lib/url-state';

function App() {
  const store = useTypeStore();

  useFontLoader();
  useUrlState();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleShare = useCallback(() => {
    const hash = encodeState({
      scaleMode: store.scaleMode,
      baseSize: store.baseSize,
      customRatio: store.customRatio,
      mobileRatio: store.mobileRatio,
      headingFont: store.headingFont,
      bodyFont: store.bodyFont,
      monoFont: store.monoFont,
      traditionalAssignments:
        store.scaleMode === 'traditional'
          ? store.traditionalAssignments
          : undefined,
    });
    const url =
      window.location.origin + window.location.pathname + '#' + hash;
    navigator.clipboard.writeText(url).then(() => toast('Share link copied!'));
  }, [store]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
            Type Scale Generator
          </h1>
          <Button variant="default" onClick={handleShare}>
            Share Scale
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Choose a <strong>Scale Mode</strong> (Golden Ratio, Traditional, or
          Custom) and <strong>Fontshare Fonts</strong> &rarr; generates fluid{' '}
          <code className="text-[11px]">clamp()</code> values, previews your
          typographic hierarchy, and exports production-ready CSS or Tailwind
          tokens.
        </p>

        {/* Main layout: controls + preview */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 shrink-0">
            <ScaleControls />
          </div>
          <div className="overflow-visible">
            <TypePreview />
          </div>
        </div>

        {/* Scale Diagram + Table */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-6 mb-6">
          <div className="hidden xl:block bg-card border border-border rounded-lg p-4">
            <h2 className="text-base font-semibold mb-3">Scale</h2>
            <ScaleDiagram />
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-base font-semibold mb-3">Values</h2>
            <ScaleTable />
          </div>
        </div>

        {/* Spacing */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h2 className="text-base font-semibold mb-3">Spacing scale</h2>
          <SpacingTable />
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
