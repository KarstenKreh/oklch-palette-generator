import { useCallback } from 'react';
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
import { buildUnifiedHash } from '@core/unified-hash';
import { AppShell } from '@core/app-shell';

function App() {
  const store = useTypeStore();

  useFontLoader();
  const otherSegments = useUrlState();

  const getTypeEncoded = useCallback(() => encodeState({
    scaleMode: store.scaleMode,
    baseSize: store.baseSize,
    customRatio: store.customRatio,
    mobileRatio: store.mobileRatio,
    headingFont: store.headingFont,
    bodyFont: store.bodyFont,
    monoFont: store.monoFont,
    headingWeight: store.headingWeight,
    weightCompensation: store.weightCompensation,
    mobileBaseSize: store.mobileBaseSize,
    mobileRatioMode: store.mobileRatioMode,
    autoShrink: store.autoShrink,
    spacingBaseMultiplier: store.spacingBaseMultiplier,
    lineHeightOverrides: store.lineHeightOverrides,
    letterSpacingOverrides: store.letterSpacingOverrides,
    traditionalAssignments:
      store.scaleMode === 'traditional'
        ? store.traditionalAssignments
        : undefined,
    traditionalMobileAssignments:
      store.scaleMode === 'traditional'
        ? store.traditionalMobileAssignments
        : undefined,
  }), [store]);

  const getCurrentHash = useCallback(() => {
    const typeEncoded = getTypeEncoded();
    return buildUnifiedHash({ c: otherSegments.c, t: typeEncoded, s: otherSegments.s, y: otherSegments.y });
  }, [getTypeEncoded, otherSegments]);

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

  return (
    <>
      <AppShell activeTool="type" buildHash={getCurrentHash} overflowXHidden>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-semibold" style={{ fontSize: 'var(--text-h4)', lineHeight: 'var(--leading-h4)' }}>
            Type Scale Generator
          </h1>
          <Button variant="default" onClick={handleShare}>
            Share Scale
          </Button>
        </div>
        <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-body-s)' }}>
          Choose a <strong>Scale Mode</strong> (Golden Ratio, Traditional, or
          Custom) and <strong>Fontshare Fonts</strong> &rarr; generates fluid{' '}
          <code className="text-caption">clamp()</code> values, previews your
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
            <h2 className="text-body-s font-semibold mb-3">Scale</h2>
            <ScaleDiagram />
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-body-s font-semibold mb-3">Values</h2>
            <ScaleTable />
          </div>
        </div>

        {/* Spacing */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h2 className="text-body-s font-semibold mb-3">Spacing scale</h2>
          <SpacingTable />
        </div>

        {/* Code Export */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <CodeExport />
        </div>
      </AppShell>
      <Toaster />
    </>
  );
}

export default App;
