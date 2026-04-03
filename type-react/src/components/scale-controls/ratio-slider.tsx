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

const SQRT_PHI = 1.272;
export const RATIO_MIN = 1.0;
export const RATIO_MAX = 1.8;
const SNAP_THRESHOLD = 0.015;

const SNAP_POINTS = [
  { value: SQRT_PHI, label: '√φ' },
];

export function snap(v: number): number {
  for (const p of SNAP_POINTS) {
    if (Math.abs(v - p.value) <= SNAP_THRESHOLD) return p.value;
  }
  return Math.round(v * 1000) / 1000;
}

export function RatioSlider({
  hint,
  value,
  onChange,
}: {
  hint?: string;
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
      {/* Row: Input — Select */}
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <span className="text-xs text-muted-foreground mr-auto">Scale ratio</span>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={RATIO_MIN}
            max={RATIO_MAX}
            step={0.001}
            value={value}
            onChange={handleInput}
            className="h-7 text-xs font-mono w-[4.5rem] text-right px-1.5 rounded-sm"
          />
          <Select
            value={matchedPreset?.value.toString() ?? ''}
            onValueChange={handlePreset}
          >
            <SelectTrigger className="h-7 text-xs w-32 px-2 gap-1 rounded-sm">
              <span className="truncate">
                {matchedPreset ? matchedPreset.name : '—'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {RATIO_PRESETS.map((p) => (
                <SelectItem
                  key={p.value}
                  value={p.value.toString()}
                  className={`text-xs ${p.value === SQRT_PHI ? 'text-primary font-medium' : ''}`}
                >
                  {p.name} ({p.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
          const active = value === p.value;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.value)}
              className={`absolute -translate-x-1/2 text-xs font-semibold cursor-pointer transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'
              }`}
              style={{ left: `${pct}%`, top: '-1.8rem' }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {hint && <HintWithStory hint={hint} />}
    </div>
  );
}

function HintWithStory({ hint }: { hint: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-xs leading-snug text-muted-foreground">
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
        <div className="text-xs leading-relaxed text-muted-foreground bg-muted/50 rounded-sm p-3 space-y-3">
          <p>
            The classical typographic scale — from Nonpareille (6pt) to Imperial (72pt) — was
            established during the Renaissance for metal typesetting. The full scale has 19 sizes,
            but they fall into two groups: <strong className="text-foreground">11 structural sizes</strong> for
            heading hierarchy, and 8 fine-tuning sizes for body text legibility.
          </p>
          <p>The scale factors between the 11 hierarchical sizes:</p>
          <div className="grid grid-cols-5 gap-x-3 gap-y-0.5 font-mono text-[10px] text-muted-foreground/80">
            <span>6→8</span><span className="text-right">1.333</span>
            <span className="col-start-4">8→10</span><span className="text-right">1.250</span>
            <span>10→12</span><span className="text-right">1.200</span>
            <span className="col-start-4">12→14</span><span className="text-right">1.167</span>
            <span>14→16</span><span className="text-right">1.143</span>
            <span className="col-start-4">16→20</span><span className="text-right">1.250</span>
            <span>20→24</span><span className="text-right">1.200</span>
            <span className="col-start-4">24→36</span><span className="text-right">1.500</span>
            <span>36→48</span><span className="text-right">1.333</span>
            <span className="col-start-4">48→72</span><span className="text-right">1.500</span>
          </div>
          <p>
            The geometric mean — the correct average for compounding
            ratios — is <strong className="text-foreground">1.282</strong>, less
            than <strong className="text-foreground">0.8%</strong> from √φ ≈ 1.272.
          </p>
          <p>
            The full 19-step scale averages at 1.148 — lower, because the fine-tuning
            steps (10→10.5→11→12) optimise <em>legibility within a level</em>, not contrast
            between levels. The typesetters intuitively distinguished between hierarchical
            jumps and fine adjustments — and √φ describes precisely the former.
          </p>
          <p className="text-muted-foreground/70">
            √φ formalises what typographers have felt for 500 years.
          </p>
        </div>
      )}
    </div>
  );
}
