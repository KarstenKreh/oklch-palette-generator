import type { ComputedLevel } from '@/lib/scale';
import type { SpacingToken } from '@/lib/spacing';
import type { UrlState } from '@/lib/type-url-state';
import { round } from '@/lib/math';

export function TypeSummary({
  scale,
  spacing,
  typeState,
}: {
  scale: ComputedLevel[] | null;
  spacing: SpacingToken[] | null;
  typeState: UrlState | null;
}) {
  if (!scale) return null;

  return (
    <div className="space-y-6">
      {/* Type Preview */}
      <div className="space-y-1 overflow-hidden">
        {scale.map((level) => (
          <div key={level.level} className="flex items-baseline gap-3">
            <span className="text-xs text-muted-foreground w-16 shrink-0 text-right tabular-nums">
              {level.level}
            </span>
            <span
              style={{
                fontSize: `${level.maxRem}rem`,
                lineHeight: level.lineHeight,
                letterSpacing: level.letterSpacing ? `${level.letterSpacing}em` : undefined,
              }}
            >
              {level.level === 'display' ? 'Display' : level.level.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Scale Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-background rounded-lg p-2">
          <div className="text-muted-foreground mb-0.5">Mode</div>
          <div className="font-medium">{typeState?.scaleMode || 'custom'}</div>
        </div>
        <div className="bg-background rounded-lg p-2">
          <div className="text-muted-foreground mb-0.5">Ratio</div>
          <div className="font-medium">{typeState?.customRatio || '1.272'}</div>
        </div>
        <div className="bg-background rounded-lg p-2">
          <div className="text-muted-foreground mb-0.5">Base</div>
          <div className="font-medium">{typeState?.baseSize || 1}rem</div>
        </div>
        <div className="bg-background rounded-lg p-2">
          <div className="text-muted-foreground mb-0.5">Fonts</div>
          <div className="font-medium truncate">{typeState?.headingFont || 'satoshi'}</div>
        </div>
      </div>

    </div>
  );
}
