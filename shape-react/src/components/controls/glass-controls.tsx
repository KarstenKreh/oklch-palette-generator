import { Slider } from '@/components/ui/slider';
import { useShapeStore } from '@/store/shape-store';
import { RotateCcw } from 'lucide-react';

const GLASS_DEFAULTS = { glassDepth: 0.2, glassBlur: 2.0, glassDispersion: 0.4 };

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

export function GlassControls() {
  const {
    glassDepth, setGlassDepth,
    glassBlur, setGlassBlur,
    glassDispersion, setGlassDispersion,
  } = useShapeStore();

  const isDefault = glassDepth === GLASS_DEFAULTS.glassDepth
    && glassBlur === GLASS_DEFAULTS.glassBlur
    && glassDispersion === GLASS_DEFAULTS.glassDispersion;

  const resetDefaults = () => {
    setGlassDepth(GLASS_DEFAULTS.glassDepth);
    setGlassBlur(GLASS_DEFAULTS.glassBlur);
    setGlassDispersion(GLASS_DEFAULTS.glassDispersion);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body-s font-semibold">Liquid Glass</h3>
        {!isDefault && (
          <button
            onClick={resetDefaults}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-muted-foreground">Depth</span>
            <span className="text-caption text-muted-foreground font-mono">{glassDepth.toFixed(1)}</span>
          </div>
          <Slider
            value={[glassDepth]}
            onValueChange={(v) => setGlassDepth(sliderVal(v))}
            min={-2}
            max={5}
            step={0.1}
          />
          <p className="text-[10px] text-muted-foreground/60">
            Negative = compression, positive = magnification
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-muted-foreground">Blur</span>
            <span className="text-caption text-muted-foreground font-mono">{glassBlur.toFixed(1)}</span>
          </div>
          <Slider
            value={[glassBlur]}
            onValueChange={(v) => setGlassBlur(sliderVal(v))}
            min={0}
            max={10}
            step={0.1}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-muted-foreground">Dispersion</span>
            <span className="text-caption text-muted-foreground font-mono">{glassDispersion.toFixed(1)}</span>
          </div>
          <Slider
            value={[glassDispersion]}
            onValueChange={(v) => setGlassDispersion(sliderVal(v))}
            min={0}
            max={3}
            step={0.1}
          />
          <p className="text-[10px] text-muted-foreground/60">
            Chromatic aberration intensity
          </p>
        </div>
      </div>
    </div>
  );
}
