import { cn } from '@/lib/utils';
import { useShapeStore, type ShapeStyle } from '@/store/shape-store';
import { Layers, Gem } from 'lucide-react';

const STYLES: { value: ShapeStyle; label: string; icon: typeof Layers }[] = [
  { value: 'paper', label: 'Paper', icon: Layers },
  { value: 'glass', label: 'Glass', icon: Gem },
];

export function StyleSelector() {
  const { shapeStyle, setShapeStyle } = useShapeStore();

  return (
    <div className="flex w-full rounded-lg border border-border overflow-hidden">
      {STYLES.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.value}
            onClick={() => setShapeStyle(s.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-body-s font-medium transition-colors cursor-pointer',
              'border-r border-border last:border-r-0',
              s.value === shapeStyle
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
