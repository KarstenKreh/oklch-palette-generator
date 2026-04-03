import { useComputedScale } from '@/hooks/use-computed-scale';
import { useTypeStore } from '@/store/type-store';
import { fontFamily } from '@/lib/fontshare';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

const VW_MIN = 320;
const VW_MAX = 1920;

const VW_MARKERS = [
  { value: 375, icon: Smartphone, label: 'Mobile' },
  { value: 768, icon: Tablet, label: 'Tablet' },
  { value: 1920, icon: Monitor, label: 'Desktop' },
];

function resolveAtViewport(
  minRem: number,
  maxRem: number,
  viewportPx: number,
  minVw = 375,
  maxVw = 1920,
): number {
  if (minRem === maxRem) return minRem;
  const minVwRem = minVw / 16;
  const maxVwRem = maxVw / 16;
  const slope = (maxRem - minRem) / (maxVwRem - minVwRem);
  const intercept = minRem - slope * minVwRem;
  const viewportRem = viewportPx / 16;
  const preferred = slope * viewportRem + intercept;
  return Math.max(minRem, Math.min(maxRem, preferred));
}

function snapViewport(v: number): number {
  for (const m of VW_MARKERS) {
    if (Math.abs(v - m.value) <= 30) return m.value;
  }
  return Math.round(v);
}

export function TypePreview() {
  const scale = useComputedScale();
  const headingFont = useTypeStore((s) => s.headingFont);
  const headingWeight = useTypeStore((s) => s.headingWeight);
  const bodyFont = useTypeStore((s) => s.bodyFont);
  const monoFont = useTypeStore((s) => s.monoFont);
  const previewText = useTypeStore((s) => s.previewText);
  const setPreviewText = useTypeStore((s) => s.setPreviewText);
  const viewportWidth = useTypeStore((s) => s.previewViewport ?? VW_MAX);
  const setViewport = useTypeStore((s) => s.setPreviewViewport);

  const headingFF = fontFamily(headingFont);
  const bodyFF = fontFamily(bodyFont);
  const monoFF = fontFamily(monoFont);

  const handleSlider = (val: number | readonly number[]) => {
    const raw = Array.isArray(val) ? val[0] : (typeof val === 'number' ? val : VW_MAX);
    setViewport(snapViewport(raw));
  };

  const matchedMarker = VW_MARKERS.find((m) => m.value === viewportWidth);

  const defaultTexts: Record<string, string> = {
    h1: 'Main Headline',
    h2: 'Section Title',
    h3: 'Subsection',
    h4: 'Card Heading',
    h5: 'Small Heading',
    h6: 'Label Text',
    'body-l': "Nobody exists on purpose. Nobody belongs anywhere. We're all going to die. Come watch TV.",
    'body-m': "Wubba lubba dub dub! Sometimes science is more art than science. A lot of people don't get that.",
    'body-s': "To live is to risk it all, otherwise you're just an inert chunk of randomly assembled molecules.",
    'caption': 'Published Mar 15, 2024 · 4 min read',
  };

  return (
    <div className="space-y-4">
      {/* Header with viewport slider */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-body-s font-semibold shrink-0">Type preview</h3>
            <Badge variant="secondary" className="text-caption font-mono px-2 py-0.5">
              {viewportWidth}px
            </Badge>
          </div>
          <div className="relative flex-1 max-w-xs sm:ml-auto pt-2 pb-6">
          <Slider
            min={VW_MIN}
            max={VW_MAX}
            step={1}
            value={[viewportWidth]}
            onValueChange={handleSlider}
          />
          {/* Device markers — below the slider */}
          {VW_MARKERS.map((m) => {
            const rawPct = ((m.value - VW_MIN) / (VW_MAX - VW_MIN)) * 100;
            const pct = Math.min(rawPct, 96);
            const active = viewportWidth === m.value;
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => setViewport(m.value)}
                className={`absolute -translate-x-1/2 cursor-pointer transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground'
                }`}
                style={{ left: `${pct}%`, top: 'calc(50% + 8px)' }}
                title={`${m.label} (${m.value}px)`}
              >
                <Icon className="h-3 w-3" />
              </button>
            );
          })}
          </div>
        </div>
        <Input
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="The quick brown fox..."
          className="h-9 text-caption rounded-sm"
        />
      </div>

      {/* Preview */}
      <div>
        {scale.map((l) => {
          const resolvedRem = resolveAtViewport(
            l.minRem,
            l.maxRem,
            viewportWidth,
          );

          return (
            <div key={l.level} className="mb-4 last:mb-0">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-caption font-mono text-muted-foreground w-12 shrink-0">
                  {l.label}
                </span>
                <span className="text-caption font-mono text-muted-foreground/60">
                  {Math.round(resolvedRem * 1000) / 1000}rem · {Math.round(resolvedRem * 16)}px
                </span>
              </div>
              <p
                style={{
                  fontSize: `${resolvedRem}rem`,
                  fontFamily: l.isHeading ? headingFF : bodyFF,
                  fontWeight: l.isHeading ? headingWeight : 400,
                  lineHeight: l.lineHeight,
                  letterSpacing: l.letterSpacing ? `${l.letterSpacing}em` : undefined,
                }}
                className="text-foreground transition-[font-size] duration-200 whitespace-nowrap"
              >
                {previewText || defaultTexts[l.level]}
              </p>
            </div>
          );
        })}

        {/* Mono preview at Body S size */}
        {(() => {
          const bodyS = scale.find((l) => l.level === 'body-s');
          if (!bodyS) return null;
          const resolvedRem = resolveAtViewport(bodyS.minRem, bodyS.maxRem, viewportWidth);
          return (
            <div className="mb-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-caption font-mono text-muted-foreground w-12 shrink-0">
                  Mono
                </span>
                <span className="text-caption font-mono text-muted-foreground/60">
                  {Math.round(resolvedRem * 1000) / 1000}rem · {Math.round(resolvedRem * 16)}px
                </span>
              </div>
              <p
                style={{
                  fontSize: `${resolvedRem}rem`,
                  fontFamily: monoFF,
                  lineHeight: bodyS.lineHeight,
                }}
                className="text-foreground transition-[font-size] duration-200"
              >
                {previewText || 'const portalGun = require("dimension-c137");'}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
