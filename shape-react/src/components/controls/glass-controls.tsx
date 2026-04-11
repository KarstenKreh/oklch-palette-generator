import { Slider } from '@/components/ui/slider';
import { useShapeStore } from '@/store/shape-store';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

export function GlassControls() {
  const {
    glassDepth, setGlassDepth,
    glassBlur, setGlassBlur,
    glassDispersion, setGlassDispersion,
  } = useShapeStore();

  return (
    <div className="space-y-3">
      <h3 className="text-body-s font-semibold">Liquid Glass</h3>

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
