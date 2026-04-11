import { cn } from '@/lib/utils';
import type { RecommendedSet } from '@core/recommend';
import { SAMPLE_ICONS, SAMPLE_ICON_NAMES, type SampleIconName, type IconDef } from '@core/sample-icons';
import { Badge } from '@/components/ui/badge';
import { Pin, ExternalLink } from 'lucide-react';

function SampleIcon({ def, size }: { def: IconDef; size: number }) {
  const paths = Array.isArray(def.d) ? def.d : [def.d];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={def.type === 'fill' ? 'currentColor' : 'none'}
      stroke={def.type === 'stroke' ? 'currentColor' : 'none'}
      strokeWidth={def.type === 'stroke' ? 2 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

interface SetCardProps {
  recommendation: RecommendedSet;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
  iconSize: number;
}

export function SetCard({ recommendation, rank, isSelected, onSelect, iconSize }: SetCardProps) {
  const { set, score, reasons } = recommendation;
  const icons = SAMPLE_ICONS[set.id];
  const pxSize = Math.round(iconSize * 16);

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-muted-foreground/30',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-caption font-mono text-muted-foreground/50">#{rank}</span>
          <h4 className="text-body-s font-semibold">{set.name}</h4>
          <span className="text-caption font-mono text-muted-foreground">{Math.round(score * 100)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={set.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Open set website"
          >
            <ExternalLink className="size-3.5" />
          </a>
          <button
            onClick={onSelect}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground',
            )}
            title={isSelected ? 'Unpin set' : 'Pin this set'}
          >
            <Pin className="size-3" />
            {isSelected ? 'Pinned' : 'Pin'}
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-caption text-muted-foreground mb-3">{set.description}</p>

      {/* Tags */}
      <div className="flex gap-1.5 mb-3">
        <Badge variant="secondary" className="text-[10px]">{set.style}</Badge>
        <Badge variant="secondary" className="text-[10px]">{set.strokeWeight}</Badge>
        <Badge variant="secondary" className="text-[10px]">{set.cornerStyle}</Badge>
        <Badge variant="secondary" className="text-[10px]">{set.license}</Badge>
      </div>

      {/* Reasons */}
      {reasons.length > 0 && (
        <div className="flex gap-1.5 mb-3">
          {reasons.map((r) => (
            <span key={r} className="text-[10px] text-primary/80 bg-primary/10 rounded px-1.5 py-0.5">{r}</span>
          ))}
        </div>
      )}

      {/* Icon grid */}
      {icons && (
        <div className="grid grid-cols-8 gap-2 items-center justify-items-center py-2 px-1 rounded bg-muted/50">
          {SAMPLE_ICON_NAMES.map((name: SampleIconName) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <SampleIcon def={icons[name]} size={pxSize} />
              <span className="text-[8px] text-muted-foreground/50">{name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Install hint */}
      <div className="mt-3 flex items-center gap-2">
        <code className="text-[10px] font-mono bg-muted rounded px-2 py-1 text-muted-foreground">
          npm i {set.npmPackage}
        </code>
      </div>
    </div>
  );
}
