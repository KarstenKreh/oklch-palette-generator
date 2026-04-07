import { Slider } from '@/components/ui/slider';
import { useShapeStore } from '@/store/shape-store';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

export function RadiusControls() {
  const { borderRadius, setBorderRadius } = useShapeStore();

  return (
    <div className="space-y-3">
      <h3 className="text-body-s font-semibold">Border Radius</h3>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-caption font-medium text-muted-foreground">Base Radius</span>
          <span className="text-caption text-muted-foreground font-mono">{borderRadius}px</span>
        </div>
        <Slider
          value={[borderRadius]}
          onValueChange={(v) => setBorderRadius(sliderVal(v))}
          min={0}
          max={24}
          step={1}
        />
      </div>
    </div>
  );
}
