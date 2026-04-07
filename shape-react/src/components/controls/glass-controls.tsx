import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useShapeStore } from '@/store/shape-store';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

export function GlassControls() {
  const {
    glassEnabled, setGlassEnabled,
    glassBlur, setGlassBlur,
    glassOpacity, setGlassOpacity,
  } = useShapeStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body-s font-semibold">Glass / Blur</h3>
        <Switch checked={glassEnabled} onCheckedChange={setGlassEnabled} />
      </div>

      {glassEnabled && (
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Blur</span>
              <span className="text-caption text-muted-foreground font-mono">{glassBlur}px</span>
            </div>
            <Slider
              value={[glassBlur]}
              onValueChange={(v) => setGlassBlur(sliderVal(v))}
              min={0}
              max={40}
              step={1}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Opacity</span>
              <span className="text-caption text-muted-foreground font-mono">{glassOpacity.toFixed(2)}</span>
            </div>
            <Slider
              value={[glassOpacity]}
              onValueChange={(v) => setGlassOpacity(sliderVal(v))}
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
