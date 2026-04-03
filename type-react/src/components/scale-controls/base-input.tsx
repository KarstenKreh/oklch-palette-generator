import { Input } from '@/components/ui/input';

export function BaseInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(e.target.value);
    if (!isNaN(n) && n >= 0.5 && n <= 2) onChange(n);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs font-medium text-foreground/70">{label} base</span>
      <Input
        type="number"
        min={0.5}
        max={2}
        step={0.0625}
        value={value}
        onChange={handleChange}
        className="h-7 text-xs font-mono text-right w-16 px-1.5 rounded-sm"
      />
      <span className="text-[10px] text-muted-foreground/50 shrink-0 w-8">
        {Math.round(value * 16)}px
      </span>
    </div>
  );
}
