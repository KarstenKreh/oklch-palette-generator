import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

export function BaseInputV2({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
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
        {label} base
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
