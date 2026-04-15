import { useSpaceStore } from '@/store/space-store';
import { formatAspect, aspectValue, reciprocal } from '@core/aspect';

export function AspectPreview() {
  const { aspectRatios, aspectIncludeReciprocals } = useSpaceStore();
  const ratios = aspectIncludeReciprocals
    ? aspectRatios.flatMap((a) => (a.w === a.h ? [a] : [a, reciprocal(a)]))
    : aspectRatios;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {ratios.map((a) => (
        <div key={a.name} className="bg-card border border-border rounded-md p-2">
          <div
            className="bg-muted border border-border/40 rounded-sm flex items-center justify-center text-caption text-muted-foreground font-mono"
            style={{ aspectRatio: formatAspect(a) }}
          >
            {formatAspect(a)}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-caption font-mono">--aspect-{a.name}</span>
            <span className="text-caption text-muted-foreground font-mono">{aspectValue(a).toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
