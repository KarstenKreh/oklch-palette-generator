import type { SpacingToken } from '@core/spacing';
import type { SpaceUrlState } from '@core/url-state/space';
import { formatAspect, reciprocal, aspectValue } from '@core/aspect';
import { sortBreakpoints, sortContainers } from '@core/layout';

function scaleLabel(s: SpaceUrlState): string {
  if (s.spacingMode === 'geometric' && Math.abs(s.spacingRatio - 1.272) < 0.001) return '√φ geometric';
  if (s.spacingMode === 'geometric') return `×${s.spacingRatio.toFixed(3)} geometric`;
  return 'Harmonic multiples';
}

export function SpaceSummary({
  spacing,
  spaceState,
}: {
  spacing: SpacingToken[];
  spaceState: SpaceUrlState;
}) {
  const bps = sortBreakpoints(spaceState.breakpoints);
  const cts = sortContainers(spaceState.containers);
  const ratios = spaceState.aspectIncludeReciprocals
    ? spaceState.aspectRatios.flatMap((a) => (a.w === a.h ? [a] : [a, reciprocal(a)]))
    : spaceState.aspectRatios;

  const maxSpace = Math.max(...spacing.map((t) => t.rem), 1);
  const maxBp = Math.max(...bps.map((b) => b.minPx), 1920);
  const maxCt = Math.max(...cts.map((c) => c.maxPx), 1920);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {scaleLabel(spaceState)} · base {spaceState.spacingBaseRem}rem × multiplier {spaceState.spacingMultiplier.toFixed(2)}.
      </p>

      {/* Spacing */}
      <div>
        <h3 className="text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-2">Spacing</h3>
        <div className="grid grid-cols-[auto_auto_auto_1fr] gap-x-3 gap-y-1 items-center">
          {spacing.map((t) => (
            <div key={t.name} className="contents">
              <span className="text-caption font-mono">--space-{t.name}</span>
              <span className="text-caption font-mono text-muted-foreground">{t.rem}rem</span>
              <span className="text-caption font-mono text-muted-foreground">{t.px}px</span>
              <div
                className="h-1.5 bg-primary/50 rounded-sm"
                style={{ width: `${(t.rem / maxSpace) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Breakpoints */}
      <div>
        <h3 className="text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-2">Breakpoints</h3>
        <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-1 items-center">
          {bps.map((b) => (
            <div key={b.name} className="contents">
              <span className="text-caption font-mono">--breakpoint-{b.name}</span>
              <span className="text-caption font-mono text-muted-foreground">{b.minPx}px</span>
              <div className="relative h-1.5 bg-muted rounded-sm overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-primary/50"
                  style={{ width: `${((maxBp - b.minPx) / maxBp) * 100}%`, left: `${(b.minPx / maxBp) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-caption text-muted-foreground mt-2">
          Fluid viewport anchors: {spaceState.fluidMinVw}px → {spaceState.fluidMaxVw}px.
        </p>
      </div>

      {/* Containers */}
      <div>
        <h3 className="text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-2">Containers</h3>
        <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-1 items-center">
          {cts.map((c) => (
            <div key={c.name} className="contents">
              <span className="text-caption font-mono">--container-{c.name}</span>
              <span className="text-caption font-mono text-muted-foreground">{c.maxPx}px</span>
              <div
                className="h-1.5 bg-primary/50 rounded-sm"
                style={{ width: `${(c.maxPx / maxCt) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <p className="text-caption text-muted-foreground mt-2">
          Prose reading column: {spaceState.proseMaxCh}ch.
        </p>
      </div>

      {/* Aspect Ratios */}
      <div>
        <h3 className="text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-2">Aspect Ratios</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {ratios.map((a) => (
            <div key={a.name} className="bg-muted/30 border border-border/50 rounded-md p-2">
              <div
                className="bg-muted border border-border/40 rounded-sm flex items-center justify-center text-caption text-muted-foreground font-mono"
                style={{ aspectRatio: formatAspect(a) }}
              >
                {formatAspect(a)}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-caption font-mono">{a.name}</span>
                <span className="text-caption text-muted-foreground font-mono">{aspectValue(a).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
