import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fontsByCategory, getFontEntry, type FontEntry } from '@/lib/fontshare';

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (slug: string) => void;
}

const grouped = fontsByCategory();
const categoryLabels: Record<string, string> = {
  sans: 'Sans Serif',
  serif: 'Serif',
  display: 'Display',
  mono: 'Monospace',
};
const categoryOrder = ['sans', 'serif', 'display', 'mono'];

export function FontSelector({ label, value, onChange }: FontSelectorProps) {
  const selected = getFontEntry(value);

  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="w-full h-7 text-xs rounded-sm"
          style={selected ? { fontFamily: `'${selected.name}', ${selected.fallback}` } : undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categoryOrder.map((cat) => {
            const fonts = grouped[cat];
            if (!fonts?.length) return null;
            return (
              <SelectGroup key={cat}>
                <SelectLabel className="text-xs text-muted-foreground">
                  {categoryLabels[cat]}
                </SelectLabel>
                {fonts.map((f: FontEntry) => (
                  <SelectItem
                    key={f.slug}
                    value={f.slug}
                    className="text-xs"
                    style={{ fontFamily: `'${f.name}', ${f.fallback}` }}
                  >
                    {f.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
