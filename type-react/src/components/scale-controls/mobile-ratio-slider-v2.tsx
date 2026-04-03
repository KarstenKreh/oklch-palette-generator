import { useState, useEffect } from 'react';
import { useTypeStore } from '@/store/type-store';
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
import { ModeSwitch } from '@/components/mode-switch';
import { MOBILE_MODE_OPTIONS } from './mobile-ratio-slider';
import type { MobileRatioMode } from '@/store/type-store';

export function MobileRatioSliderV2() {
  const store = useTypeStore();

  const autoRatio =
    Math.round((1 + (store.customRatio - 1) * (1 - store.autoShrink / 100)) * 1000) / 1000;

  const isAuto = store.mobileRatioMode === 'auto';
  const sliderValue = isAuto ? autoRatio : store.mobileRatio;

  // Local string state so the input can be fully cleared
  const storeValue = isAuto ? String(-store.autoShrink) : String(store.mobileRatio);
  const [inputText, setInputText] = useState(storeValue);
  useEffect(() => {
    setInputText(storeValue);
  }, [storeValue]);

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
    const raw = e.target.value;
    setInputText(raw);
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    if (isAuto) {
      const abs = Math.abs(n);
      if (abs >= 0 && abs <= 100) store.setAutoShrink(abs);
    } else {
      if (n >= RATIO_MIN && n <= RATIO_MAX) store.setMobileRatio(n);
    }
  };

  const handleBlur = () => {
    const n = parseFloat(inputText);
    if (isNaN(n)) setInputText(storeValue);
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
      {/* Label row with ModeSwitch */}
      <div className="flex items-center">
        <span className="text-caption text-muted-foreground">Scale ratio</span>
        <div className="ml-auto">
          <ModeSwitch
            value={store.mobileRatioMode}
            options={MOBILE_MODE_OPTIONS}
            onChange={(v) => store.setMobileRatioMode(v as MobileRatioMode)}
          />
        </div>
      </div>

      {/* Slider with √φ marker */}
      <div className="relative">
        <Slider
          min={RATIO_MIN}
          max={RATIO_MAX}
          step={0.001}
          value={[sliderValue]}
          onValueChange={handleSlider}
        />
        {SNAP_POINTS.map((p) => {
          const pct = ((p.value - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100;
          const distance = Math.abs(sliderValue - p.value);
          const maxDist = p.value * 0.1;
          const proximity = Math.max(0, 1 - distance / maxDist);
          const opacity = 0.3 + proximity * 0.7;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => handleSlider(p.value)}
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
        <div className="relative">
          <Input
            type="number"
            min={isAuto ? -100 : RATIO_MIN}
            max={isAuto ? 0 : RATIO_MAX}
            step={isAuto ? 1 : 0.001}
            value={inputText}
            onChange={handleInput}
            onBlur={handleBlur}
            className="h-7 text-caption font-mono w-[4.5rem] text-right px-1.5 rounded-sm"
            style={isAuto ? { paddingRight: '1.5rem' } : undefined}
          />
          {isAuto && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-caption font-mono text-muted-foreground pointer-events-none">
              %
            </span>
          )}
        </div>
        <Select
          value={matchedPreset?.value.toString() ?? ''}
          onValueChange={(v) => {
            if (v) handlePreset(v);
          }}
        >
          <SelectTrigger className="h-7 text-caption flex-1 px-2 gap-1 rounded-sm">
            <span className="truncate">{matchedPreset ? matchedPreset.name : '—'}</span>
          </SelectTrigger>
          <SelectContent>
            {RATIO_PRESETS.map((p) => (
              <SelectItem
                key={p.value}
                value={p.value.toString()}
                className={`text-caption ${p.value === 1.272 ? 'text-primary font-medium' : ''}`}
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
