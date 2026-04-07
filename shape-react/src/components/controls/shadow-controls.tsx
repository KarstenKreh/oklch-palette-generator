import { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useShapeStore } from '@/store/shape-store';
import { SQRT_PHI } from '@/lib/shadows';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

const SCALE_MIN = 1.0;
const SCALE_MAX = 1.8;
const SNAP_THRESHOLD = 0.015;

function snapScale(v: number): number {
  if (Math.abs(v - SQRT_PHI) <= SNAP_THRESHOLD) return SQRT_PHI;
  return Math.round(v * 1000) / 1000;
}

export function ShadowControls() {
  const {
    shadowEnabled, setShadowEnabled,
    shadowStrength, setShadowStrength,
    shadowBlurScale, setShadowBlurScale,
    shadowScale, setShadowScale,
  } = useShapeStore();

  const handleScaleChange = useCallback((v: number | readonly number[]) => {
    setShadowScale(snapScale(sliderVal(v)));
  }, [setShadowScale]);

  const scaleSnapped = shadowScale === SQRT_PHI;
  const scaleDistance = Math.abs(shadowScale - SQRT_PHI);
  const scaleMaxDist = SQRT_PHI * 0.1;
  const scaleProximity = Math.max(0, 1 - scaleDistance / scaleMaxDist);
  const labelOpacity = 0.3 + scaleProximity * 0.7;
  const sqrtPhiPct = ((SQRT_PHI - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body-s font-semibold">Shadows</h3>
        <Switch checked={shadowEnabled} onCheckedChange={setShadowEnabled} />
      </div>

      {shadowEnabled && (
        <div className="space-y-3">
          {/* Scale with √φ snap */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Scale</span>
              <span className="text-caption text-muted-foreground font-mono">
                {scaleSnapped ? '√φ' : shadowScale.toFixed(3)}
              </span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShadowScale(SQRT_PHI)}
                className="absolute -translate-x-1/2 -top-3.5 text-[10px] font-semibold cursor-pointer text-primary transition-opacity leading-none"
                style={{ left: `${sqrtPhiPct}%`, opacity: labelOpacity }}
              >
                √φ
              </button>
              <Slider
                value={[shadowScale]}
                onValueChange={handleScaleChange}
                min={SCALE_MIN}
                max={SCALE_MAX}
                step={0.001}
              />
            </div>
          </div>

          {/* Strength */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Strength</span>
              <span className="text-caption text-muted-foreground font-mono">{shadowStrength.toFixed(2)}</span>
            </div>
            <Slider
              value={[shadowStrength]}
              onValueChange={(v) => setShadowStrength(sliderVal(v))}
              min={0}
              max={2}
              step={0.05}
            />
          </div>

          {/* Blur Scale */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Blur Scale</span>
              <span className="text-caption text-muted-foreground font-mono">{shadowBlurScale.toFixed(2)}</span>
            </div>
            <Slider
              value={[shadowBlurScale]}
              onValueChange={(v) => setShadowBlurScale(sliderVal(v))}
              min={0}
              max={3}
              step={0.05}
            />
          </div>
        </div>
      )}
    </div>
  );
}
