import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSymbolStore } from '@/store/symbol-store';
import { ICON_FAMILIES, getFamilyForVariant, type IconFamily } from '@core/icon-sets';
import { SAMPLE_ICONS, type SampleIconName, type IconDef } from '@core/sample-icons';

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
      strokeDasharray={def.strokeDasharray}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

const PREVIEW_ICONS: SampleIconName[] = ['home', 'search', 'heart'];

function FamilyButton({ family, isActive, onClick, activeVariantId }: {
  family: IconFamily;
  isActive: boolean;
  onClick: () => void;
  activeVariantId: string;
}) {
  const iconSetId = isActive ? activeVariantId : family.defaultVariant;
  const iconData = SAMPLE_ICONS[iconSetId];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 px-3 py-3 transition-colors cursor-pointer',
        'rounded-md border border-border sm:rounded-none sm:border-0 sm:border-r sm:last:border-r-0 sm:flex-1',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {iconData && (
        <div className="flex items-center gap-2">
          {PREVIEW_ICONS.map((name) => (
            <SampleIcon key={name} def={iconData.icons[name]} size={16} viewBox={iconData.viewBox} />
          ))}
        </div>
      )}
      <span className="text-caption font-medium">{family.name}</span>
      <span className={cn(
        'text-[9px] leading-tight text-center',
        isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/60',
      )}>
        {family.cornerStyle} · {family.variants.length > 1 ? `${family.variants.length} styles` : family.variants[0].label.toLowerCase()}
      </span>
    </button>
  );
}

export function SetSelector() {
  const selectedSet = useSymbolStore((s) => s.selectedSet);
  const setSelectedSet = useSymbolStore((s) => s.setSelectedSet);

  const activeVariantId = selectedSet || ICON_FAMILIES[0].defaultVariant;
  const activeFamily = useMemo(
    () => getFamilyForVariant(activeVariantId) || ICON_FAMILIES[0],
    [activeVariantId],
  );

  const handleFamilyClick = (family: IconFamily) => {
    if (family.id === activeFamily.id) return;
    setSelectedSet(family.defaultVariant);
  };

  return (
    <div className="space-y-3">
      {/* Family selector */}
      <div className="space-y-1.5">
        <span className="text-caption font-medium">Icon Set</span>
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-0 sm:w-full sm:rounded-lg sm:border sm:border-border sm:overflow-hidden">
          {ICON_FAMILIES.map((family) => (
            <FamilyButton
              key={family.id}
              family={family}
              isActive={family.id === activeFamily.id}
              onClick={() => handleFamilyClick(family)}
              activeVariantId={activeVariantId}
            />
          ))}
        </div>
      </div>

      {/* Variant selector — only if family has multiple variants */}
      {activeFamily.variants.length > 1 && (
        <div className="space-y-1.5">
          <span className="text-caption font-medium">Style</span>
          <div className="flex rounded-md border border-input overflow-hidden">
            {activeFamily.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedSet(variant.id)}
                className={cn(
                  'flex-1 px-2 py-1.5 text-caption font-medium transition-colors cursor-pointer',
                  'border-r border-input last:border-r-0',
                  variant.id === activeVariantId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
