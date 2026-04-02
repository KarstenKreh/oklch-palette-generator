import { cn } from '@/lib/utils';

interface ModeSwitchProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function ModeSwitch({ value, options, onChange }: ModeSwitchProps) {
  return (
    <div className="flex w-full rounded-lg border border-border overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
            'border-r border-border last:border-r-0',
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
