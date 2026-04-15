import { useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { AppShell } from '@core/app-shell';
import { useSpaceStore } from '@/store/space-store';
import { encodeState } from '@/lib/url-state';
import { buildUnifiedHash } from '@core/unified-hash';
import { useUrlState } from '@/hooks/use-url-state';
import { SectionNav } from '@/components/section-nav';
import { SpacingControls } from '@/components/spacing-controls';
import { SpacingTable } from '@/components/spacing-table';
import { BreakpointControls } from '@/components/breakpoint-controls';
import { BreakpointTable } from '@/components/breakpoint-table';
import { ContainerControls } from '@/components/container-controls';
import { ContainerTable } from '@/components/container-table';
import { AspectControls } from '@/components/aspect-controls';
import { AspectPreview } from '@/components/aspect-preview';
import { CodeExport } from '@/components/code-export';

function App() {
  const store = useSpaceStore();
  const otherSegments = useUrlState();
  const activeSection = useSpaceStore((s) => s.activeSection);

  const getCurrentHash = useCallback(() => {
    const spaceEncoded = encodeState(store);
    return buildUnifiedHash({
      c: otherSegments.c || undefined,
      t: otherSegments.t || undefined,
      s: otherSegments.s || undefined,
      y: otherSegments.y || undefined,
      p: spaceEncoded,
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

  return (
    <TooltipProvider>
      <AppShell activeTool="space" buildHash={getCurrentHash}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-semibold" style={{ fontSize: 'var(--text-h4)', lineHeight: 'var(--leading-h4)' }}>
            Space
          </h1>
          <Button variant="default" onClick={handleShare}>
            Share Config
          </Button>
        </div>
        <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-body-s)' }}>
          Spacing scale, breakpoints, container widths, and aspect ratios &mdash; production-ready layout tokens.
        </p>

        <SectionNav />

        {activeSection === 'spacing' && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-body-s font-semibold mb-3">Spacing controls</h2>
              <SpacingControls />
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-body-s font-semibold mb-3">Spacing scale</h2>
              <SpacingTable />
            </div>
          </div>
        )}

        {activeSection === 'breakpoints' && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-body-s font-semibold mb-3">Breakpoint controls</h2>
              <BreakpointControls />
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-body-s font-semibold mb-3">Breakpoints</h2>
              <BreakpointTable />
            </div>
          </div>
        )}

        {activeSection === 'containers' && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-body-s font-semibold mb-3">Container controls</h2>
              <ContainerControls />
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-body-s font-semibold mb-3">Containers</h2>
              <ContainerTable />
            </div>
          </div>
        )}

        {activeSection === 'aspect' && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-body-s font-semibold mb-3">Aspect controls</h2>
              <AspectControls />
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-body-s font-semibold mb-3">Preview</h2>
              <AspectPreview />
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <CodeExport />
        </div>
      </AppShell>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
