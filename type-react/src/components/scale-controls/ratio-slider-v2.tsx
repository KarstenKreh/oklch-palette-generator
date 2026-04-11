import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { RATIO_PRESETS } from '@/lib/scale';
import { snap, RATIO_MIN, RATIO_MAX } from './ratio-slider';

const CORRIDOR_MIN = 1.2;
const CORRIDOR_MAX = 1.5;

export function RatioSliderV2({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const handleSlider = (val: number | readonly number[]) => {
    const raw = Array.isArray(val) ? val[0] : val;
    onChange(snap(raw));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(e.target.value);
    if (!isNaN(n) && n >= RATIO_MIN && n <= RATIO_MAX) onChange(n);
  };

  const handlePreset = (v: string) => {
    onChange(parseFloat(v));
  };

  const matchedPreset = RATIO_PRESETS.find((p) => p.value === value);

  const corridorLeft = ((CORRIDOR_MIN - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100;
  const corridorRight = ((CORRIDOR_MAX - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100;

  return (
    <div className="space-y-2">
      {/* Label */}
      <span className="text-caption text-muted-foreground">Scale ratio</span>

      {/* Slider with corridor tick marks */}
      <div className="relative mb-3">
        <Slider
          min={RATIO_MIN}
          max={RATIO_MAX}
          step={0.001}
          value={[value]}
          onValueChange={handleSlider}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground/30 pointer-events-none"
          style={{ left: `${corridorLeft}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground/30 pointer-events-none"
          style={{ left: `${corridorRight}%` }}
        />
      </div>

      {/* Input + Preset select — full width below slider */}
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={RATIO_MIN}
          max={RATIO_MAX}
          step={0.001}
          value={value}
          onChange={handleInput}
          className="h-7 text-caption font-mono w-[4.5rem] text-right px-1.5 rounded-sm"
        />
        <Select
          value={matchedPreset?.value.toString() ?? ''}
          onValueChange={handlePreset}
        >
          <SelectTrigger className="h-7 text-caption flex-1 px-2 gap-1 rounded-sm">
            <span className="truncate">
              {matchedPreset ? matchedPreset.name : '—'}
            </span>
          </SelectTrigger>
          <SelectContent>
            {RATIO_PRESETS.map((p) => (
              <SelectItem
                key={p.value}
                value={p.value.toString()}
                className="text-caption"
              >
                {p.name} ({p.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}

export function HintWithStory({ hint }: { hint: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-caption leading-snug text-muted-foreground">
        {hint}{' '}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-primary/80 hover:text-primary cursor-pointer underline underline-offset-2"
        >
          {open ? 'Less' : 'Why?'}
        </button>
      </p>
      {open && (
        <div className="text-caption leading-relaxed text-muted-foreground bg-muted/50 rounded-sm p-3 space-y-3">
          <p>
            Perceptual research shows that size differences between{' '}
            <strong className="text-foreground">1.20× and 1.50×</strong> are perceived as natural
            steps in a visual hierarchy. Below 1.20×, levels become hard to distinguish without
            effort. Above 1.50×, elements lose their visual connection to the surrounding text.
          </p>
          <p>
            The default ratio of 1.272 sits comfortably within this range — far enough above the
            lower bound (1.20) for clear contrast, far enough below the upper bound (1.50) to
            maintain cohesion. It also carries a mathematical rationale: at this factor, the{' '}
            <em>perceived area</em> of each heading level scales by φ (the golden ratio), since
            area grows with the square of the font size.
          </p>
          <p>
            The classical typographic scale of the Renaissance (6pt to 72pt) averages a factor
            of 1.282 across its hierarchical steps — landing in the same range, arrived at through
            centuries of craft rather than calculation.
          </p>
        </div>
      )}
    </div>
  );
}
