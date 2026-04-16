import { useSpaceStore, type SpaceSection } from '@/store/space-store';
import { cn } from '@/lib/utils';

const SECTIONS: { id: SpaceSection; label: string }[] = [
  { id: 'spacing', label: 'Spacing' },
  { id: 'breakpoints', label: 'Breakpoints' },
  { id: 'containers', label: 'Containers' },
  { id: 'aspect', label: 'Aspect Ratios' },
];

export function SectionNav() {
  const active = useSpaceStore((s) => s.activeSection);
  const setActive = useSpaceStore((s) => s.setActiveSection);

  return (
    <div className="flex gap-1 border-b border-border mb-4">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setActive(s.id)}
          className={cn(
            'px-3 py-2 text-caption font-medium cursor-pointer transition-colors border-b-2 -mb-px',
            active === s.id
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
