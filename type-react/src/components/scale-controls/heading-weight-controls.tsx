import { useTypeStore } from '@/store/type-store';
import { Slider } from '@/components/ui/slider';

const WEIGHT_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const WEIGHT_LABELS: Record<number, string> = {
  100: 'Thin',
  200: 'ExtraLight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semibold',
  700: 'Bold',
  800: 'ExtraBold',
  900: 'Black',
};

function snapWeight(v: number): number {
  let closest = WEIGHT_STEPS[0];
  for (const w of WEIGHT_STEPS) {
    if (Math.abs(v - w) < Math.abs(v - closest)) closest = w;
  }
  return closest;
}

export function HeadingWeightControls() {
  const store = useTypeStore();

  return (
    <div className="space-y-2">
      <h3 className="text-body-s font-semibold text-foreground">Heading weight</h3>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-caption text-muted-foreground">
            {WEIGHT_LABELS[store.headingWeight] ?? store.headingWeight}
          </span>
          <span className="text-caption font-mono text-muted-foreground">
            {store.headingWeight}
          </span>
        </div>
        <Slider
          min={100}
          max={900}
          step={1}
          value={[store.headingWeight]}
          onValueChange={(v) => {
            const raw = Array.isArray(v) ? v[0] : v;
            store.setHeadingWeight(snapWeight(raw));
          }}
        />
      </div>
    </div>
  );
}
