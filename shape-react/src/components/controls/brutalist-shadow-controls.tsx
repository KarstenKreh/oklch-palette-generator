import { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useShapeStore } from '@/store/shape-store';
import { cn } from '@/lib/utils';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

const SCALE_MIN = 1.0;
const SCALE_MAX = 1.8;
const CORRIDOR_MIN = 1.2;
const CORRIDOR_MAX = 1.5;

function snapScale(v: number): number {
  return Math.round(v * 1000) / 1000;
}

export function BrutalistShadowControls() {
  const {
    shadowEnabled, setShadowEnabled,
    shadowOffsetX, setShadowOffsetX,
    shadowOffsetY, setShadowOffsetY,
    shadowScale, setShadowScale,
    shadowStrength, setShadowStrength,
    brutalistVariant, setBrutalistVariant,
  } = useShapeStore();

  const handleScaleChange = useCallback((v: number | readonly number[]) => {
    setShadowScale(snapScale(sliderVal(v)));
  }, [setShadowScale]);

  const corridorLeft = ((CORRIDOR_MIN - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const corridorRight = ((CORRIDOR_MAX - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body-s font-semibold">Shadow</h3>
        <Switch checked={shadowEnabled} onCheckedChange={setShadowEnabled} />
      </div>

      {shadowEnabled && (
        <div className="space-y-3">
          {/* Variant */}
          <div className="space-y-1">
            <span className="text-caption font-medium text-muted-foreground">Variant</span>
            <div className="flex w-full rounded-md border border-input overflow-hidden">
              {(['outlined', 'solid'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBrutalistVariant(v)}
                  className={cn(
                    'flex-1 px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer capitalize',
                    'border-r border-input last:border-r-0',
                    brutalistVariant === v
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Offset X */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Offset X</span>
              <span className="text-caption text-muted-foreground font-mono">{shadowOffsetX}px</span>
            </div>
            <Slider
              value={[shadowOffsetX]}
              onValueChange={(v) => setShadowOffsetX(Math.round(sliderVal(v)))}
              min={-12}
              max={12}
              step={1}
            />
          </div>

          {/* Offset Y */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Offset Y</span>
              <span className="text-caption text-muted-foreground font-mono">{shadowOffsetY}px</span>
            </div>
            <Slider
              value={[shadowOffsetY]}
              onValueChange={(v) => setShadowOffsetY(Math.round(sliderVal(v)))}
              min={-12}
              max={12}
              step={1}
            />
          </div>

          {/* Scale — elevation ladder for offset */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Scale</span>
              <span className="text-caption text-muted-foreground font-mono">
                {shadowScale.toFixed(3)}
              </span>
            </div>
            <div className="relative">
              <Slider
                value={[shadowScale]}
                onValueChange={handleScaleChange}
                min={SCALE_MIN}
                max={SCALE_MAX}
                step={0.001}
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
              max={1}
              step={0.05}
            />
          </div>
        </div>
      )}
    </div>
  );
}
