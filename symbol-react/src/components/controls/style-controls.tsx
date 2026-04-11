import { useSymbolStore, type IconStyle, type IconWeight, type IconCorners } from '@/store/symbol-store';
import { cn } from '@/lib/utils';

const STYLES: { value: IconStyle; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'filled', label: 'Filled' },
  { value: 'duotone', label: 'Duotone' },
];

const WEIGHTS: { value: IconWeight; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'thin', label: 'Thin' },
  { value: 'regular', label: 'Regular' },
  { value: 'bold', label: 'Bold' },
];

const CORNERS: { value: IconCorners; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'sharp', label: 'Sharp' },
  { value: 'rounded', label: 'Rounded' },
];

function ToggleRow<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-caption font-medium">{label}</span>
      <div className="flex rounded-md border border-input overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 px-2 py-1.5 text-caption font-medium transition-colors cursor-pointer',
              'border-r border-input last:border-r-0',
              opt.value === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StyleControls() {
  const {
    preferredStyle, setPreferredStyle,
    preferredWeight, setPreferredWeight,
    preferredCorners, setPreferredCorners,
  } = useSymbolStore();

  return (
    <div className="space-y-3">
      <ToggleRow label="Style" options={STYLES} value={preferredStyle} onChange={setPreferredStyle} />
      <ToggleRow label="Weight" options={WEIGHTS} value={preferredWeight} onChange={setPreferredWeight} />
      <ToggleRow label="Corners" options={CORNERS} value={preferredCorners} onChange={setPreferredCorners} />
    </div>
  );
}
