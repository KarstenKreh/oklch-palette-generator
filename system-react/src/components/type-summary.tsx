import type { ComputedLevel } from '@core/scale';
import type { SpacingToken } from '@core/spacing';
import type { UrlState } from '@core/url-state/type';

const HEADING_LEVELS = new Set(['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function formatFontName(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function FontCard({ role, slug, weight }: { role: string; slug: string; weight?: number }) {
  const displayName = formatFontName(slug);
  const fontFamily = `'${slug}', sans-serif`;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      {/* Font specimen */}
      <div
        className="px-4 pt-4 pb-3 bg-background space-y-2"
        style={{ fontFamily, fontWeight: weight }}
      >
        <div className="text-2xl text-foreground leading-tight">
          ABCDEFGHIJKLM<br />NOPQRSTUVWXYZ
        </div>
        <div className="text-xl text-foreground leading-tight">
          abcdefghijklm<br />nopqrstuvwxyz
        </div>
        <div className="text-lg text-muted-foreground leading-tight">
          0123456789<br />
          !?@#&amp;().,;:&mdash;&ndash;/
        </div>
      </div>
      {/* Label */}
      <div className="px-4 py-2.5 border-t border-border">
        <div className="text-sm font-medium text-foreground">{displayName}</div>
        <div className="text-xs text-muted-foreground">
          {role}{weight && weight !== 400 ? ` · ${weight}` : ''}
        </div>
      </div>
    </div>
  );
}

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

  const headingFont = typeState?.headingFont || 'satoshi';
  const bodyFont = typeState?.bodyFont || 'satoshi';
  const monoFont = typeState?.monoFont || 'system-mono';
  const headingWeight = typeState?.headingWeight ?? 500;

  return (
    <div className="space-y-6">
      {/* Font Overview */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          The typefaces that define your brand's voice and readability.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FontCard role="Headings" slug={headingFont} weight={headingWeight} />
          <FontCard role="Body text" slug={bodyFont} />
          <FontCard role="Code & data" slug={monoFont} />
        </div>
      </div>

      {/* Type Scale Preview */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          How your text sizes scale from captions to large display headings.
        </p>
        <div className="space-y-1 overflow-hidden">
          {scale.map((level) => {
            const isHeading = HEADING_LEVELS.has(level.level);
            return (
              <div key={level.level} className="flex items-baseline gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0 text-right tabular-nums">
                  {level.level}
                </span>
                <span
                  style={{
                    fontSize: `${level.maxRem}rem`,
                    lineHeight: level.lineHeight,
                    letterSpacing: level.letterSpacing ? `${level.letterSpacing}em` : undefined,
                    fontWeight: isHeading ? headingWeight : undefined,
                  }}
                >
                  {level.level === 'display' ? 'Display' : level.level.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
