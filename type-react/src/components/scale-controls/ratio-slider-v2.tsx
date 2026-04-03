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

const SQRT_PHI = 1.272;

const SNAP_POINTS = [{ value: SQRT_PHI, label: '√φ' }];

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

  return (
    <div className="space-y-2">
      {/* Label */}
      <span className="text-caption text-muted-foreground">Scale ratio</span>

      {/* Slider with √φ marker */}
      <div className="relative">
        <Slider
          min={RATIO_MIN}
          max={RATIO_MAX}
          step={0.001}
          value={[value]}
          onValueChange={handleSlider}
        />
        {SNAP_POINTS.map((p) => {
          const pct = ((p.value - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100;
          const distance = Math.abs(value - p.value);
          const maxDist = p.value * 0.1; // 10% range
          const proximity = Math.max(0, 1 - distance / maxDist);
          const opacity = 0.3 + proximity * 0.7;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.value)}
              className="absolute -translate-x-1/2 text-caption font-semibold cursor-pointer text-primary"
              style={{ left: `${pct}%`, top: '-1.8rem', opacity }}
            >
              {p.label}
            </button>
          );
        })}
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
                className={`text-caption ${p.value === SQRT_PHI ? 'text-primary font-medium' : ''}`}
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
            The classical typographic scale — from Nonpareille (6pt) to Imperial (72pt) — was
            established during the Renaissance for metal typesetting. The full scale has 19 sizes,
            but they fall into two groups:{' '}
            <strong className="text-foreground">11 structural sizes</strong> for heading hierarchy,
            and 8 fine-tuning sizes for body text legibility.
          </p>
          <p>The scale factors between the 11 hierarchical sizes:</p>
          <div className="grid grid-cols-5 gap-x-3 gap-y-0.5 font-mono text-caption text-muted-foreground/80">
            <span>6→8</span>
            <span className="text-right">1.333</span>
            <span className="col-start-4">8→10</span>
            <span className="text-right">1.250</span>
            <span>10→12</span>
            <span className="text-right">1.200</span>
            <span className="col-start-4">12→14</span>
            <span className="text-right">1.167</span>
            <span>14→16</span>
            <span className="text-right">1.143</span>
            <span className="col-start-4">16→20</span>
            <span className="text-right">1.250</span>
            <span>20→24</span>
            <span className="text-right">1.200</span>
            <span className="col-start-4">24→36</span>
            <span className="text-right">1.500</span>
            <span>36→48</span>
            <span className="text-right">1.333</span>
            <span className="col-start-4">48→72</span>
            <span className="text-right">1.500</span>
          </div>
          <p>
            The geometric mean — the correct average for compounding ratios — is{' '}
            <strong className="text-foreground">1.282</strong>, remarkably close
            to √φ ≈ 1.272.
          </p>
          <p>
            The full 19-step scale averages at 1.148 — lower, because the fine-tuning steps
            (10→10.5→11→12) optimise <em>legibility within a level</em>, not contrast between
            levels. The typesetters intuitively distinguished between hierarchical jumps and fine
            adjustments — and √φ lands right in the middle of the former.
          </p>
          <p>
            √φ formalises what typographers have felt for 500 years — the hierarchical
            structure of the classical scale converges precisely on this ratio.
          </p>
        </div>
      )}
    </div>
  );
}
