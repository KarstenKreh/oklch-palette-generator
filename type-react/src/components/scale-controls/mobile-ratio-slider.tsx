import { useTypeStore } from '@/store/type-store';
import type { MobileRatioMode } from '@/store/type-store';
import { ModeSwitch } from '@/components/mode-switch';
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

export const MOBILE_MODE_OPTIONS = [
  { value: 'auto', label: 'Relative' },
  { value: 'custom', label: 'Custom' },
];

export function MobileRatioSlider() {
  const store = useTypeStore();

  const autoRatio =
    Math.round((1 + (store.customRatio - 1) * (1 - store.autoShrink / 100)) * 1000) / 1000;

  const isAuto = store.mobileRatioMode === 'auto';
  const sliderValue = isAuto ? autoRatio : store.mobileRatio;

  const handleSlider = (val: number | readonly number[]) => {
    const raw = Array.isArray(val) ? val[0] : val;
    const snapped = snap(raw);
    if (isAuto) {
      const excess = store.customRatio - 1;
      const pct = excess > 0 ? Math.round((1 - (snapped - 1) / excess) * 100) : 0;
      store.setAutoShrink(Math.max(0, Math.min(100, pct)));
    } else {
      store.setMobileRatio(snapped);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(e.target.value);
    if (isAuto) {
      if (!isNaN(n) && n >= 0 && n <= 100) store.setAutoShrink(n);
    } else {
      if (!isNaN(n) && n >= RATIO_MIN && n <= RATIO_MAX) store.setMobileRatio(n);
    }
  };

  const handlePreset = (v: string) => {
    const ratio = parseFloat(v);
    if (isAuto) {
      const excess = store.customRatio - 1;
      const pct = excess > 0 ? Math.round((1 - (ratio - 1) / excess) * 100) : 0;
      store.setAutoShrink(Math.max(0, Math.min(100, pct)));
    } else {
      store.setMobileRatio(ratio);
    }
  };

  const matchedPreset = RATIO_PRESETS.find((p) => p.value === sliderValue);

  return (
    <div className="space-y-2">
      {/* Row: Label — Input — Preset */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground mr-auto">Scale ratio</span>
        <div className="relative">
          <Input
            type="number"
            min={isAuto ? 0 : RATIO_MIN}
            max={isAuto ? 100 : RATIO_MAX}
            step={isAuto ? 1 : 0.001}
            value={isAuto ? store.autoShrink : store.mobileRatio}
            onChange={handleInput}
            className="h-7 text-xs font-mono w-[4.5rem] text-right px-1.5 rounded-sm"
            style={isAuto ? { paddingRight: '1.5rem' } : undefined}
          />
          {isAuto && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground pointer-events-none">
              %
            </span>
          )}
        </div>
        <Select
          value={matchedPreset?.value.toString() ?? ''}
          onValueChange={handlePreset}
        >
          <SelectTrigger className="h-7 text-xs w-24 px-2 gap-1 rounded-sm">
            <span className="truncate">
              {matchedPreset ? matchedPreset.name : '—'}
            </span>
          </SelectTrigger>
          <SelectContent>
            {RATIO_PRESETS.map((p) => (
              <SelectItem
                key={p.value}
                value={p.value.toString()}
                className={`text-xs ${p.value === 1.272 ? 'text-primary font-medium' : ''}`}
              >
                {p.name} ({p.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Slider */}
      <Slider
        min={RATIO_MIN}
        max={RATIO_MAX}
        step={0.001}
        value={[sliderValue]}
        onValueChange={handleSlider}
      />
    </div>
  );
}
