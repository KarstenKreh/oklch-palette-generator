import { useMemo } from 'react';
import { useSymbolStore } from '@/store/symbol-store';
import { ICON_FAMILIES, getSetById } from '@core/icon-sets';
import { SAMPLE_ICONS, SAMPLE_ICON_NAMES, type SampleIconName, type IconDef } from '@core/sample-icons';
import { computeIconTokens, weightToStroke } from '@core/icon-tokens';

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
      className="shrink-0"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export function SymbolPreview() {
  const selectedSet = useSymbolStore((s) => s.selectedSet);
  const iconBaseSize = useSymbolStore((s) => s.iconBaseSize);
  const iconScale = useSymbolStore((s) => s.iconScale);
  const snapTo4px = useSymbolStore((s) => s.snapTo4px);

  const activeId = selectedSet || ICON_FAMILIES[0].defaultVariant;
  const set = getSetById(activeId) || { strokeWeight: 'regular' as const };
  const iconData = SAMPLE_ICONS[activeId];
  const tokens = useMemo(
    () => computeIconTokens(iconBaseSize, iconScale, weightToStroke(set.strokeWeight), snapTo4px),
    [iconBaseSize, iconScale, set.strokeWeight, snapTo4px],
  );

  if (!iconData) return <p className="text-muted-foreground text-caption">No icons for variant "{activeId}"</p>;

  const cols = SAMPLE_ICON_NAMES.length;
  const maxPx = tokens.sizes[tokens.sizes.length - 1].px;
  const cellMin = `${maxPx + 8}px`;

  return (
    <div className="overflow-x-auto">
    <div
      className="grid border-l border-t border-border/50"
      style={{ gridTemplateColumns: `auto repeat(${cols}, minmax(${cellMin}, 1fr))` }}
    >
      {/* Header row — icon names */}
      <div className="border-r border-b border-border/50" />
      {SAMPLE_ICON_NAMES.map((name) => (
        <div
          key={name}
          className="border-r border-b border-border/50 flex items-end justify-center py-1.5 px-1"
        >
          <span className="text-[8px] font-mono text-muted-foreground/40 text-center leading-tight">{name}</span>
        </div>
      ))}

      {/* Size rows */}
      {tokens.sizes.map((size) => (
        <>
          {/* Row label */}
          <div
            key={`${size.name}-label`}
            className="border-r border-b border-border/50 flex items-center gap-1.5 px-2"
          >
            <span className="text-[10px] font-mono text-muted-foreground">{size.name}</span>
            <span className="text-[9px] font-mono text-muted-foreground/40">{size.px}</span>
          </div>

          {/* Icon cells */}
          {SAMPLE_ICON_NAMES.map((name: SampleIconName) => (
            <div
              key={`${size.name}-${name}`}
              className="border-r border-b border-border/50 flex items-center justify-center py-2 px-1 text-foreground"
            >
              <SampleIcon def={iconData.icons[name]} size={size.px} viewBox={iconData.viewBox} />
            </div>
          ))}
        </>
      ))}
    </div>
    </div>
  );
}
