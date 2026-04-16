import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface SliderWithInputProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  inputWidthClass?: string;
  decimals?: number;
  /** Optional corridor marks (e.g. 1.2–1.5 for ratios) */
  corridor?: { min: number; max: number };
}

/**
 * Shared control: slider with a synced numeric input.
 * Input commits on change if the parsed value is within [min, max].
 * Blur resets to the canonical store value.
 */
export function SliderWithInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  inputWidthClass = 'w-[5.5rem]',
  decimals,
  corridor,
}: SliderWithInputProps) {
  const format = (v: number) =>
    decimals !== undefined ? v.toFixed(decimals) : String(v);

  const [text, setText] = useState(format(value));

  useEffect(() => {
    setText(format(value));
  }, [value, decimals]);

  const handleSlider = (val: number | readonly number[]) => {
    const raw = Array.isArray(val) ? val[0] : (val as number);
    onChange(raw);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= min && n <= max) onChange(n);
  };

  const handleBlur = () => {
    setText(format(value));
  };

  const corridorLeft = corridor
    ? ((corridor.min - min) / (max - min)) * 100
    : 0;
  const corridorRight = corridor
    ? ((corridor.max - min) / (max - min)) * 100
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        {label && <span className="text-caption text-muted-foreground">{label}</span>}
        <div className="relative shrink-0 ml-auto">
          <Input
            type="number"
            min={min}
            max={max}
            step={step}
            value={text}
            onChange={handleInput}
            onBlur={handleBlur}
            className={`h-7 text-caption font-mono text-right px-1.5 rounded-sm ${inputWidthClass}`}
            style={suffix ? { paddingRight: '2rem' } : undefined}
          />
          {suffix && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-caption text-muted-foreground/50 pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <Slider
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={handleSlider}
        />
        {corridor && (
          <>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground/30 pointer-events-none"
              style={{ left: `${corridorLeft}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground/30 pointer-events-none"
              style={{ left: `${corridorRight}%` }}
            />
          </>
        )}
      </div>
    </div>
  );
}
