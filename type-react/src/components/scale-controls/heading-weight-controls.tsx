import { useTypeStore } from '@/store/type-store';
import { Slider } from '@/components/ui/slider';
import { weightCorrectionFactor } from '@/lib/weight-compensation';

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
  const correction = weightCorrectionFactor(store.headingWeight);
  const correctionPct = Math.round(correction * 100);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Heading weight</h3>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {WEIGHT_LABELS[store.headingWeight] ?? store.headingWeight}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
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

      <button
        type="button"
        onClick={() => store.setWeightCompensation(!store.weightCompensation)}
        className="flex items-center gap-2 w-full text-left cursor-pointer group"
      >
        <div className={`w-8 h-[18px] rounded-full p-0.5 transition-colors ${
          store.weightCompensation ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}>
          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
            store.weightCompensation ? 'translate-x-3.5' : 'translate-x-0'
          }`} />
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          Compensate for weight
        </span>
        {store.weightCompensation && correctionPct !== 0 && (
          <span className="text-[10px] font-mono text-muted-foreground/60 ml-auto">
            {correctionPct > 0 ? '+' : ''}{correctionPct}%
          </span>
        )}
      </button>
      {store.weightCompensation && (
        <p className="text-xs leading-snug text-muted-foreground">
          Adjusts heading sizes to preserve the perceived area ratio.
          Heavier weights add optical density, so sizes are reduced to compensate.
        </p>
      )}
    </div>
  );
}
