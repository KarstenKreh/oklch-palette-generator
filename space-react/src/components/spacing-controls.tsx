import { useSpaceStore } from '@/store/space-store';
import { useComputedSpacing } from '@/hooks/use-computed-spacing';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { SliderWithInput } from '@/components/ui/slider-with-input';
import { cn } from '@/lib/utils';

// Same presets as Type tool — consistency across the suite.
const RATIO_PRESETS: { name: string; value: number }[] = [
  { name: 'Minor Second', value: 1.067 },
  { name: 'Major Second', value: 1.125 },
  { name: 'Minor Third', value: 1.2 },
  { name: 'Major Third', value: 1.25 },
  { name: 'Golden Ratio (area)', value: 1.272 },
  { name: 'Perfect Fourth', value: 1.333 },
  { name: 'Augmented Fourth', value: 1.414 },
  { name: 'Perfect Fifth', value: 1.5 },
  { name: 'Golden Ratio', value: 1.618 },
];

const RATIO_MIN = 1.067;
const RATIO_MAX = 1.618;

export function SpacingControls() {
  const {
    spacingMode, spacingBaseRem, spacingRatio, spacingMultiplier, spacingSnap,
    setSpacingMode, setSpacingBaseRem, setSpacingRatio, setSpacingMultiplier, setSpacingSnap,
  } = useSpaceStore();
  const tokens = useComputedSpacing();

  const pxValue = Math.round(spacingBaseRem * 16);
  const handleRem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(e.target.value);
    if (!isNaN(n) && n >= 0.5 && n <= 2) setSpacingBaseRem(n);
  };
  const handlePx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(e.target.value);
    if (!isNaN(n) && n >= 8 && n <= 32) {
      setSpacingBaseRem(Math.round((n / 16) * 10000) / 10000);
    }
  };

  const matchedPreset = RATIO_PRESETS.find((p) => Math.abs(p.value - spacingRatio) < 0.0005);

  return (
    <div className="space-y-5">
      <div>
        <span className="text-caption text-muted-foreground block mb-1.5">Mode</span>
        <div className="flex w-full rounded-lg border border-border overflow-hidden">
          {(['harmonic', 'geometric'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSpacingMode(m)}
              className={cn(
                'flex-1 px-3 py-2 text-body-s font-medium capitalize transition-colors cursor-pointer',
                'border-r border-border last:border-r-0',
                spacingMode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="text-caption text-muted-foreground mt-1.5">
          {spacingMode === 'harmonic'
            ? 'Hand-picked multiples: 0.25× 0.5× 0.75× 1× 1.5× 2× 3× 4× 6×.'
            : 'Geometric progression centred on sm: base × ratio^(i−3).'}
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-caption text-muted-foreground block">Base size</span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="number"
              min={0.5}
              max={2}
              step={0.0625}
              value={spacingBaseRem}
              onChange={handleRem}
              className="h-7 text-caption font-mono text-right w-[5.5rem] px-1.5 rounded-sm"
              style={{ paddingRight: '2rem' }}
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-caption text-muted-foreground/50 pointer-events-none">
              rem
            </span>
          </div>
          <span className="text-caption text-muted-foreground/40">=</span>
          <div className="relative">
            <Input
              type="number"
              min={8}
              max={32}
              step={1}
              value={pxValue}
              onChange={handlePx}
              className="h-7 text-caption font-mono text-right w-[5.5rem] px-1.5 rounded-sm"
              style={{ paddingRight: '1.5rem' }}
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-caption text-muted-foreground/50 pointer-events-none">
              px
            </span>
          </div>
        </div>
      </div>

      {spacingMode === 'geometric' && (
        <div className="space-y-2">
          <span className="text-caption text-muted-foreground block">Ratio</span>

          <div className="relative mb-3">
            <Slider
              min={RATIO_MIN}
              max={RATIO_MAX}
              step={0.001}
              value={[spacingRatio]}
              onValueChange={(v) => {
                const raw = Array.isArray(v) ? v[0] : (v as number);
                setSpacingRatio(raw);
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground/30 pointer-events-none"
              style={{ left: `${((1.2 - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground/30 pointer-events-none"
              style={{ left: `${((1.5 - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={RATIO_MIN}
              max={RATIO_MAX}
              step={0.001}
              value={spacingRatio}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                if (!isNaN(n) && n >= RATIO_MIN && n <= RATIO_MAX) setSpacingRatio(n);
              }}
              className="h-7 text-caption font-mono w-[4.5rem] text-right px-1.5 rounded-sm"
            />
            <Select
              value={matchedPreset?.value.toString() ?? ''}
              onValueChange={(v) => setSpacingRatio(parseFloat(v))}
            >
              <SelectTrigger className="h-7 text-caption flex-1 px-2 gap-1 rounded-sm">
                <span className="truncate">
                  {matchedPreset ? matchedPreset.name : '—'}
                </span>
              </SelectTrigger>
              <SelectContent>
                {RATIO_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value.toString()} className="text-caption">
                    {p.name} ({p.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-caption text-muted-foreground">
            Default 1.272 (√φ) sits in the empirical 1.20–1.50 corridor.
          </p>
        </div>
      )}

      <SliderWithInput
        label="Multiplier"
        value={spacingMultiplier}
        min={0.5}
        max={2.0}
        step={0.05}
        onChange={setSpacingMultiplier}
        suffix="×"
        decimals={2}
      />

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <label htmlFor="snap-grid" className="text-caption font-medium cursor-pointer">
          Snap to rem grid
        </label>
        <Switch id="snap-grid" checked={spacingSnap} onCheckedChange={setSpacingSnap} />
      </div>

      <p className="text-caption text-muted-foreground">
        {tokens.length} tokens · smallest {tokens[0]?.rem}rem · largest {tokens[tokens.length - 1]?.rem}rem
      </p>
    </div>
  );
}
