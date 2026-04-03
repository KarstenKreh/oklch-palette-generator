import { useComputedScale } from '@/hooks/use-computed-scale';

export function ScaleDiagram() {
  const scale = useComputedScale();
  const maxRem = Math.max(...scale.map((l) => l.maxRem));

  return (
    <div className="space-y-1">
      {scale.map((l) => {
        const pct = (l.maxRem / maxRem) * 100;
        return (
          <div key={l.level} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground w-12 shrink-0 text-right">
              {l.label}
            </span>
            <div className="flex-1 h-4 relative">
              <div
                className={`h-full rounded-sm transition-all duration-300 ${
                  l.isHeading ? 'bg-primary/25' : 'bg-muted-foreground/15'
                }`}
                style={{ width: `${pct}%` }}
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/60">
                {l.maxRem}rem
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
