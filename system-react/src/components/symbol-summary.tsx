import { useMemo } from 'react';
import type { UrlState as SymbolState } from '@core/url-state/symbol';
import { ICON_SETS, getSetById } from '@core/icon-sets';
import { SAMPLE_ICONS, type SampleIconName, type IconDef } from '@core/sample-icons';
import { computeIconTokens, weightToStroke } from '@core/icon-tokens';
import { recommendSets } from '@core/recommend';

/** Subset of icons to show in the compact preview */
const PREVIEW_ICONS: SampleIconName[] = ['home', 'search', 'settings', 'heart', 'mail', 'star'];

function SampleIcon({ def, size, viewBox }: { def: IconDef; size: number; viewBox: string }) {
  const paths = Array.isArray(def.d) ? def.d : [def.d];
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill={def.type === 'fill' ? 'currentColor' : 'none'}
      stroke={def.type === 'stroke' ? 'currentColor' : 'none'}
      strokeWidth={def.type === 'stroke' ? (def.strokeWidth ?? 2) : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export function SymbolSummary({ symbolState }: { symbolState: SymbolState }) {
  const set = useMemo(() => {
    if (symbolState.selectedSet) {
      return getSetById(symbolState.selectedSet) || ICON_SETS[0];
    }
    const r = recommendSets({
      style: symbolState.preferredStyle,
      mood: 50,
      weight: symbolState.preferredWeight,
      corners: symbolState.preferredCorners,
    });
    return r[0]?.set || ICON_SETS[0];
  }, [symbolState]);

  const tokens = useMemo(
    () => computeIconTokens(symbolState.iconBaseSize, symbolState.iconScale, weightToStroke(set.strokeWeight), symbolState.snapTo4px),
    [symbolState.iconBaseSize, symbolState.iconScale, set.strokeWeight, symbolState.snapTo4px],
  );

  const iconData = SAMPLE_ICONS[set.id];
  if (!iconData) return null;

  // Show 3 representative sizes: sm, md, lg
  const previewSizes = tokens.sizes.filter(s => ['sm', 'md', 'lg'].includes(s.name));

  return (
    <div>
      <p className="text-caption text-muted-foreground mb-3">
        {set.name} — {set.description}
      </p>

      {/* Icon grid: sizes × sample icons */}
      <div className="overflow-x-auto">
        <div
          className="grid border-l border-t border-border/50"
          style={{ gridTemplateColumns: `auto repeat(${PREVIEW_ICONS.length}, minmax(2rem, 1fr))` }}
        >
          {/* Header row */}
          <div className="border-r border-b border-border/50" />
          {PREVIEW_ICONS.map((name) => (
            <div key={name} className="border-r border-b border-border/50 flex items-center justify-center py-1">
              <span className="text-[8px] font-mono text-muted-foreground/40">{name}</span>
            </div>
          ))}

          {/* Size rows */}
          {previewSizes.map((size) => (
            <div key={size.name} className="contents">
              <div className="border-r border-b border-border/50 flex items-center gap-1.5 px-2">
                <span className="text-[10px] font-mono text-muted-foreground">{size.name}</span>
                <span className="text-[9px] font-mono text-muted-foreground/40">{size.px}</span>
              </div>
              {PREVIEW_ICONS.map((name) => (
                <div key={`${size.name}-${name}`} className="border-r border-b border-border/50 flex items-center justify-center py-1.5 text-foreground">
                  <SampleIcon def={iconData.icons[name]} size={size.px} viewBox={iconData.viewBox} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Token summary */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-caption text-muted-foreground">
        {tokens.sizes.map(s => (
          <span key={s.name} className="font-mono">
            <span className="text-foreground">{s.name}</span> {s.px}px
          </span>
        ))}
        <span className="font-mono">
          <span className="text-foreground">stroke</span> {tokens.strokeWidth}px
        </span>
      </div>
    </div>
  );
}
