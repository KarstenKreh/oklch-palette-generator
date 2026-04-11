import { useState } from 'react';
import { useTypeStore } from '@/store/type-store';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { TYPE_LEVELS, LEVEL_LABELS, type TypeLevel } from '@core/scale';
import { DEFAULT_LINE_HEIGHTS, DEFAULT_LETTER_SPACINGS } from '@core/typography';

export function TypographyDetails() {
  const [open, setOpen] = useState(false);
  const store = useTypeStore();

  const handleLineHeight = (level: TypeLevel, raw: string) => {
    if (raw === '') {
      store.setLineHeightOverride(level, null);
      return;
    }
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 0.8 && n <= 3) store.setLineHeightOverride(level, n);
  };

  const handleLetterSpacing = (level: TypeLevel, raw: string) => {
    if (raw === '') {
      store.setLetterSpacingOverride(level, null);
      return;
    }
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= -0.1 && n <= 0.2) store.setLetterSpacingOverride(level, n);
  };

  const hasOverrides =
    Object.keys(store.lineHeightOverrides).length > 0 ||
    Object.keys(store.letterSpacingOverrides).length > 0;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full cursor-pointer group"
      >
        <h3 className="text-body-s font-semibold text-foreground">Typography details</h3>
        <div className="flex items-center gap-1">
          {hasOverrides && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                store.resetTypographyDetails();
              }}
              className="text-caption text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-caption text-muted-foreground/60 w-12 shrink-0" />
            <span className="text-caption text-muted-foreground/60 flex-1 text-center">Leading</span>
            <span className="text-caption text-muted-foreground/60 flex-1 text-center">Tracking (em)</span>
          </div>
          {TYPE_LEVELS.map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className="text-caption w-12 shrink-0 text-muted-foreground">
                {LEVEL_LABELS[level]}
              </span>
              <Input
                type="number"
                min={0.8}
                max={3}
                step={0.05}
                value={store.lineHeightOverrides[level] ?? ''}
                placeholder={DEFAULT_LINE_HEIGHTS[level].toString()}
                onChange={(e) => handleLineHeight(level, e.target.value)}
                className="h-7 text-caption font-mono flex-1 text-right px-1.5 rounded-sm"
              />
              <Input
                type="number"
                min={-0.1}
                max={0.2}
                step="any"
                value={store.letterSpacingOverrides[level] ?? ''}
                placeholder={DEFAULT_LETTER_SPACINGS[level].toString()}
                onChange={(e) => handleLetterSpacing(level, e.target.value)}
                className="h-7 text-caption font-mono flex-1 text-right px-1.5 rounded-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
