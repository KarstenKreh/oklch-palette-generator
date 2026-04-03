import { useCallback, useRef, useState, useEffect, type ChangeEvent } from 'react';
import { Slider } from '@/components/ui/slider';
import { useThemeStore } from '@/store/theme-store';
import { usePalette } from '@/hooks/use-palette';
import { Minus, Plus } from 'lucide-react';

export function ChromaSlider() {
  const chromaScale = useThemeStore((s) => s.chromaScale);
  const setChromaScale = useThemeStore((s) => s.setChromaScale);
  const { neutral, brand } = usePalette();

  // Local state for immediate slider feedback; synced from store when idle
  const [localPct, setLocalPct] = useState(() => Math.round(chromaScale * 100));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setLocalPct(Math.round(chromaScale * 100));
  }, [chromaScale]);

  // Find the 500 step for gradient endpoints
  const neutral500 = neutral.find((e) => e.step === 500)?.hex ?? '#808080';
  const brand500 = brand.find((e) => e.step === 500)?.hex ?? '#808080';

  const handleSlider = useCallback(
    (val: number | readonly number[]) => {
      const v = Array.isArray(val) ? val[0] : val;
      setLocalPct(v);                       // instant visual update
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setChromaScale(v / 100);            // deferred heavy computation
      });
    },
    [setChromaScale],
  );

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = parseInt(e.target.value, 10);
      if (!Number.isNaN(raw)) {
        const clamped = Math.max(0, Math.min(100, raw));
        setLocalPct(clamped);
        setChromaScale(clamped / 100);
      }
    },
    [setChromaScale],
  );

  const step = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(100, localPct + delta));
      setLocalPct(next);
      setChromaScale(next / 100);
    },
    [localPct, setChromaScale],
  );

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-body-s font-medium text-foreground">
          Surface Chroma
        </span>
        <div className="flex items-center gap-1">
          <div className="flex h-6 items-center rounded-md border border-input overflow-hidden">
            <button
              type="button"
              onClick={() => step(-1)}
              className="flex h-full w-5 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Minus className="size-3" />
            </button>
            <input
              type="number"
              min={0}
              max={100}
              value={localPct}
              onChange={handleInput}
              className="h-full w-[4ch] bg-transparent text-center text-caption font-mono tabular-nums text-foreground outline-none border-x border-input"
            />
            <button
              type="button"
              onClick={() => step(1)}
              className="flex h-full w-5 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <span className="text-caption text-muted-foreground">%</span>
        </div>
      </div>

      {/* Slider with smooth gradient track: neutral → brand */}
      <Slider
        value={[localPct]}
        onValueChange={handleSlider}
        min={0}
        max={100}
        step={1}
        style={
          {
            '--sl-from': neutral500,
            '--sl-to': brand500,
          } as React.CSSProperties
        }
        className="[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:rounded-full [&_[data-slot=slider-track]]:!bg-[linear-gradient(to_right,var(--sl-from),var(--sl-to))] [&_[data-slot=slider-range]]:!bg-transparent"
      />

      {/* Sub-labels */}
      <div className="flex items-center justify-between">
        <span className="text-caption text-muted-foreground">Grey</span>
        <span className="text-caption text-muted-foreground">Vibrant</span>
      </div>
      <p className="text-caption text-muted-foreground leading-tight">
        Blends surface and background tokens between neutral grey and your brand hue.
      </p>
    </div>
  );
}
