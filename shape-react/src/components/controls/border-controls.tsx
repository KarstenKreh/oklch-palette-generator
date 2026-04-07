import { Switch } from '@/components/ui/switch';
import { useShapeStore } from '@/store/shape-store';
import { cn } from '@/lib/utils';

const WIDTHS = [0, 1, 1.5, 2, 3];

export function BorderControls() {
  const {
    borderEnabled, setBorderEnabled,
    borderWidth, setBorderWidth,
  } = useShapeStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body-s font-semibold">Borders</h3>
        <Switch checked={borderEnabled} onCheckedChange={setBorderEnabled} />
      </div>

      {borderEnabled && (
        <div className="space-y-1">
          <span className="text-caption font-medium text-muted-foreground">Width</span>
          <div className="flex items-center rounded-md border border-input w-fit">
            {WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setBorderWidth(w)}
                className={cn(
                  "px-2.5 py-1 text-caption font-medium transition-colors",
                  "first:rounded-l-md last:rounded-r-md",
                  borderWidth === w
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {w}px
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
