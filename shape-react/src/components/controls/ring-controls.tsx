import { Slider } from '@/components/ui/slider';
import { useShapeStore } from '@/store/shape-store';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

export function RingControls() {
  const {
    ringWidth, setRingWidth,
    ringOffset, setRingOffset,
  } = useShapeStore();

  return (
    <div className="space-y-3">
      <h3 className="text-body-s font-semibold">Focus Ring</h3>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-caption font-medium text-muted-foreground">Width</span>
          <span className="text-caption text-muted-foreground font-mono">{ringWidth}px</span>
        </div>
        <Slider
          value={[ringWidth]}
          onValueChange={(v) => setRingWidth(sliderVal(v))}
          min={0}
          max={4}
          step={0.5}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-caption font-medium text-muted-foreground">Offset</span>
          <span className="text-caption text-muted-foreground font-mono">{ringOffset}px</span>
        </div>
        <Slider
          value={[ringOffset]}
          onValueChange={(v) => setRingOffset(sliderVal(v))}
          min={0}
          max={4}
          step={0.5}
        />
      </div>
    </div>
  );
}
