import { useSpaceStore } from '@/store/space-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sortBreakpoints, breakpointRatios } from '@core/layout';
import { Trash2 } from 'lucide-react';

export function BreakpointControls() {
  const { breakpoints, fluidMinVw, fluidMaxVw, setBreakpoint, removeBreakpoint, setFluidMinVw, setFluidMaxVw } = useSpaceStore();
  const sorted = sortBreakpoints(breakpoints);
  const ratios = breakpointRatios(breakpoints);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-caption font-medium mb-1.5 block">Breakpoints</label>
        <div className="space-y-1.5">
          {sorted.map((b, i) => (
            <div key={b.name} className="flex items-center gap-2">
              <span className="font-mono text-caption w-12">{b.name}</span>
              <Input
                type="number"
                value={b.minPx}
                onChange={(e) => setBreakpoint(b.name, parseInt(e.target.value) || 0)}
                className="h-7 w-24 font-mono text-caption px-1.5 rounded-sm"
              />
              <span className="text-caption text-muted-foreground">px</span>
              {i > 0 && ratios[i - 1] && (
                <span className="text-caption text-muted-foreground ml-2 font-mono">
                  ×{ratios[i - 1].toFixed(3)}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeBreakpoint(b.name)}
                className="ml-auto"
                aria-label={`Remove ${b.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-caption text-muted-foreground mt-2">
          Successive ratios shown — Tailwind defaults sit in the empirical 1.20–1.50 corridor.
        </p>
      </div>

      <div className="pt-3 border-t border-border space-y-3">
        <label className="text-caption font-medium block">Fluid viewport anchors</label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-caption w-12">min</span>
          <Input
            type="number"
            value={fluidMinVw}
            onChange={(e) => setFluidMinVw(parseInt(e.target.value) || 375)}
            className="h-7 w-24 font-mono text-caption px-1.5 rounded-sm"
          />
          <span className="text-caption text-muted-foreground">px</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-caption w-12">max</span>
          <Input
            type="number"
            value={fluidMaxVw}
            onChange={(e) => setFluidMaxVw(parseInt(e.target.value) || 1920)}
            className="h-7 w-24 font-mono text-caption px-1.5 rounded-sm"
          />
          <span className="text-caption text-muted-foreground">px</span>
        </div>
        <p className="text-caption text-muted-foreground">
          Anchors for fluid <code className="text-caption">clamp()</code> interpolation. Type tool currently uses 375/1920.
        </p>
      </div>
    </div>
  );
}
