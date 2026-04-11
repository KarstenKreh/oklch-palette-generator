import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSymbolStore } from '@/store/symbol-store';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { computeIconTokens, weightToStroke } from '@core/icon-tokens';
import { ICON_FAMILIES, getSetById } from '@core/icon-sets';
import { RATIO_PRESETS } from '@core/scale';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

function snap(v: number): number {
  return Math.round(v * 1000) / 1000;
}

const RATIO_MIN = 1.0;
const RATIO_MAX = 1.8;
const CORRIDOR_MIN = 1.2;
const CORRIDOR_MAX = 1.5;

/* ─── Base Size Input (rem ↔ px) ─── */

function BaseInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [remText, setRemText] = useState(String(value));
  const [pxText, setPxText] = useState(String(Math.round(value * 16)));

  useEffect(() => {
    setRemText(String(value));
    setPxText(String(Math.round(value * 16)));
  }, [value]);

  const handleRem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRemText(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 0.5 && n <= 2) {
      onChange(n);
      setPxText(String(Math.round(n * 16)));
    }
  };

  const handlePx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPxText(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 8 && n <= 32) {
      const rem = Math.round((n / 16) * 10000) / 10000;
      onChange(rem);
      setRemText(String(rem));
    }
  };

  const handleBlur = () => {
    setRemText(String(value));
    setPxText(String(Math.round(value * 16)));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-body-s font-medium text-foreground/70 mr-auto">
        Base size
      </span>
      <div className="relative">
        <Input
          type="number"
          min={0.5}
          max={2}
          step={0.0625}
          value={remText}
          onChange={handleRem}
          onBlur={handleBlur}
          className="h-7 text-caption font-mono text-right w-[4.5rem] px-1.5 rounded-sm"
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
          value={pxText}
          onChange={handlePx}
          onBlur={handleBlur}
          className="h-7 text-caption font-mono text-right w-[4.5rem] px-1.5 rounded-sm"
          style={{ paddingRight: '1.5rem' }}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-caption text-muted-foreground/50 pointer-events-none">
          px
        </span>
      </div>
    </div>
  );
}

/* ─── Scale Ratio Slider with Presets ─── */

function ScaleRatio({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const handleSlider = useCallback((val: number | readonly number[]) => {
    onChange(snap(sliderVal(val)));
  }, [onChange]);

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
      <span className="text-caption text-muted-foreground">Scale ratio</span>

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

/* ─── Combined Sizing Controls ─── */

export function SizingControls() {
  const {
    iconBaseSize, setIconBaseSize,
    iconScale, setIconScale,
    snapTo4px, setSnapTo4px,
    selectedSet,
  } = useSymbolStore();

  const set = useMemo(() => {
    const activeId = selectedSet || ICON_FAMILIES[0].defaultVariant;
    return getSetById(activeId) || { strokeWeight: 'regular' as const };
  }, [selectedSet]);

  const tokens = useMemo(
    () => computeIconTokens(iconBaseSize, iconScale, weightToStroke(set.strokeWeight), snapTo4px),
    [iconBaseSize, iconScale, set.strokeWeight, snapTo4px],
  );

  return (
    <div className="space-y-3">
      <BaseInput value={iconBaseSize} onChange={setIconBaseSize} />
      <ScaleRatio value={iconScale} onChange={setIconScale} />

      {/* Snap to 4px grid */}
      <div className="flex items-center justify-between">
        <span className="text-caption text-muted-foreground">Snap to 4px grid</span>
        <Switch checked={snapTo4px} onCheckedChange={setSnapTo4px} />
      </div>

      {/* Size scale preview */}
      <div className="space-y-1">
        <span className="text-[10px] text-muted-foreground/60 font-medium">Size scale</span>
        <div className="flex items-end gap-3">
          {tokens.sizes.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-1">
              <div
                className="rounded bg-muted-foreground/20"
                style={{ width: `${s.rem}rem`, height: `${s.rem}rem` }}
              />
              <span className="text-[9px] font-mono text-muted-foreground">{s.name}</span>
              <span className="text-[9px] font-mono text-muted-foreground/50">{s.px}px</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
