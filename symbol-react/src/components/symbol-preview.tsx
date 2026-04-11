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

  return (
    <div className="space-y-6">
      {tokens.sizes.map((size) => (
        <div key={size.name}>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-caption font-mono text-muted-foreground">{size.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground/50">{size.px}px</span>
          </div>
          <div className="flex items-center gap-4 text-foreground flex-wrap">
            {SAMPLE_ICON_NAMES.map((name: SampleIconName) => (
              <SampleIcon key={name} def={iconData.icons[name]} size={size.px} viewBox={iconData.viewBox} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
