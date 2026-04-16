import { useSpaceStore } from '@/store/space-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NameInput } from '@/components/ui/name-input';
import { sortBreakpoints, breakpointRatios } from '@core/layout';
import { Trash2, Plus } from 'lucide-react';

const MAX_BREAKPOINTS = 6;

function nextBreakpointName(existing: string[]): string {
  for (let i = 1; i < 20; i++) {
    const candidate = `custom-${i}`;
    if (!existing.includes(candidate)) return candidate;
  }
  return `custom-${existing.length + 1}`;
}

export function BreakpointControls() {
  const { breakpoints, fluidMinVw, fluidMaxVw, setBreakpoint, renameBreakpoint, removeBreakpoint, addBreakpoint, setFluidMinVw, setFluidMaxVw } = useSpaceStore();
  const allNames = breakpoints.map((b) => b.name);
  const sorted = sortBreakpoints(breakpoints);
  const ratios = breakpointRatios(breakpoints);
  const atMax = breakpoints.length >= MAX_BREAKPOINTS;

  const handleAdd = () => {
    const largest = sorted.length > 0 ? sorted[sorted.length - 1].minPx : 640;
    addBreakpoint({
      name: nextBreakpointName(breakpoints.map((b) => b.name)),
      minPx: Math.round(largest * 1.272),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-caption font-medium">Breakpoints</label>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAdd}
            disabled={atMax}
            aria-label="Add breakpoint"
            className="size-7"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        <div className="space-y-1.5">
          {sorted.map((b, i) => (
            <div key={b.name} className="flex items-center gap-2">
              <NameInput
                value={b.name}
                existing={allNames}
                onCommit={(next) => renameBreakpoint(b.name, next)}
                widthClass="w-24"
              />
              <Input
                type="number"
                value={b.minPx}
                onChange={(e) => setBreakpoint(b.name, parseInt(e.target.value) || 0)}
                className="h-7 w-24 font-mono text-caption px-1.5 rounded-sm"
              />
              <span className="text-caption text-muted-foreground">px</span>
              {i > 0 && ratios[i - 1] && (
                <span className="text-caption text-muted-foreground font-mono whitespace-nowrap">
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

      <div className="pt-3 border-t border-border space-y-2">
        <label className="text-caption font-medium block">Fluid viewport anchors</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-caption text-muted-foreground">min</span>
            <div className="relative">
              <Input
                type="number"
                value={fluidMinVw}
                onChange={(e) => setFluidMinVw(parseInt(e.target.value) || 375)}
                className="h-7 w-24 font-mono text-caption px-1.5 rounded-sm"
                style={{ paddingRight: '1.75rem' }}
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-caption text-muted-foreground/50 pointer-events-none">
                px
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-caption text-muted-foreground">max</span>
            <div className="relative">
              <Input
                type="number"
                value={fluidMaxVw}
                onChange={(e) => setFluidMaxVw(parseInt(e.target.value) || 1920)}
                className="h-7 w-24 font-mono text-caption px-1.5 rounded-sm"
                style={{ paddingRight: '1.75rem' }}
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-caption text-muted-foreground/50 pointer-events-none">
                px
              </span>
            </div>
          </div>
        </div>
        <p className="text-caption text-muted-foreground">
          Anchors for fluid <code className="text-caption">clamp()</code> interpolation. Type tool currently uses 375/1920.
        </p>
      </div>
    </div>
  );
}
