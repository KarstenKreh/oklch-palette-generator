import { cn } from '@/lib/utils';

interface ModeSwitchProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function ModeSwitch({ value, options, onChange }: ModeSwitchProps) {
  return (
    <div className="inline-flex shrink-0 rounded-sm border border-border overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1 text-xs font-medium text-center transition-colors cursor-pointer',
            i < options.length - 1 && 'border-r border-border',
            opt.value === value
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
