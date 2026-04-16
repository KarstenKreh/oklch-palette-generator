import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useShapeStore } from '@/store/shape-store';
import { cn } from '@/lib/utils';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v;
}

/** Small inline numeric input — mirrors the slider's bounds and integer stepping. */
function NumInput({
  value, onChange, min, max, step = 1, suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="inline-flex items-center gap-0.5 text-caption font-mono rounded px-1.5 py-0.5 border border-border/50 bg-muted/30 hover:border-border hover:bg-muted/60 focus-within:border-foreground/60 focus-within:bg-muted/60 transition-colors cursor-text">
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '' || raw === '-') return;
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        className="w-9 bg-transparent text-right tabular-nums text-muted-foreground focus:text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix && <span className="text-muted-foreground">{suffix}</span>}
    </label>
  );
}

export function BrutalistShadowControls() {
  const {
    shadowEnabled, setShadowEnabled,
    shadowOffsetX, setShadowOffsetX,
    shadowOffsetY, setShadowOffsetY,
    shadowStrength, setShadowStrength,
    brutalistVariant, setBrutalistVariant,
  } = useShapeStore();

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
              <NumInput value={shadowOffsetX} onChange={setShadowOffsetX} min={-12} max={12} suffix="px" />
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
              <NumInput value={shadowOffsetY} onChange={setShadowOffsetY} min={-12} max={12} suffix="px" />
            </div>
            <Slider
              value={[shadowOffsetY]}
              onValueChange={(v) => setShadowOffsetY(Math.round(sliderVal(v)))}
              min={-12}
              max={12}
              step={1}
            />
          </div>

          {/* Strength */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-muted-foreground">Strength</span>
              <NumInput value={shadowStrength} onChange={setShadowStrength} min={0} max={1} step={0.05} />
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
