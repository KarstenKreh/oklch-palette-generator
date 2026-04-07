import { useCallback, type ClipboardEvent, type ChangeEvent } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ColorPicker } from '@/components/color-picker';

const HEX_RE = /^[0-9a-fA-F]{6}$/;

interface ColorInputProps {
  value: string;
  onChange: (hex: string) => void;
  swatchColor: string;
  /** Additional preview swatches (e.g. surface-500, surface-50) */
  previewSwatches?: string[];
  readOnly?: boolean;
  readOnlyHex?: string;
  /** Show a lock icon overlay on the swatch */
  locked?: boolean;
}

export function ColorInput({
  value,
  onChange,
  swatchColor,
  previewSwatches,
  readOnly,
  readOnlyHex,
  locked,
}: ColorInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
      if (HEX_RE.test(raw)) {
        onChange(raw.toUpperCase());
      }
    },
    [onChange],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text').trim().replace(/^#/, '');
      if (HEX_RE.test(pasted)) {
        e.preventDefault();
        onChange(pasted.toUpperCase());
      }
    },
    [onChange],
  );

  const handlePickerChange = useCallback(
    (hex: string) => {
      onChange(hex.replace('#', '').toUpperCase());
    },
    [onChange],
  );

  const swatchBtn = (color: string, key?: string, showLock?: boolean) => (
    <div
      key={key}
      className="relative w-7 h-7 shrink-0"
      style={{ backgroundColor: color }}
    >
      {showLock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 rounded-[inherit]">
          <Lock className="size-3 text-white drop-shadow-sm" />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-7 items-center gap-2">
      {/* Swatches — grouped, no gap, rounded container */}
      {readOnly ? (
        <div className="flex items-center overflow-hidden rounded-md border border-border">
          {swatchBtn(swatchColor, undefined, locked)}
          {previewSwatches?.map((color, i) => swatchBtn(color, `ps-${i}`))}
        </div>
      ) : (
        <ColorPicker value={swatchColor} onChange={handlePickerChange}>
          <div className="flex items-center overflow-hidden rounded-md border border-border cursor-pointer hover:ring-2 hover:ring-ring transition-shadow">
            {swatchBtn(swatchColor, undefined, locked)}
            {previewSwatches?.map((color, i) => swatchBtn(color, `ps-${i}`))}
          </div>
        </ColorPicker>
      )}

      {/* Hex display */}
      <div className={cn("flex items-center gap-0.5 min-w-0", locked && "text-muted-foreground")}>
        <span className="text-caption text-muted-foreground select-none">#</span>
        {readOnly || locked ? (
          <span className="h-7 leading-7 w-[7.5ch] font-mono text-caption text-muted-foreground select-none pointer-events-none">
            {readOnlyHex ?? value}
          </span>
        ) : (
          <Input
            value={value}
            onChange={handleChange}
            onPaste={handlePaste}
            maxLength={6}
            spellCheck={false}
            autoComplete="off"
            className={cn(
              'h-7 w-[7.5ch] font-mono !text-caption uppercase',
              'border-none bg-transparent! px-0 shadow-none',
              'focus-visible:ring-0 focus-visible:border-transparent',
            )}
          />
        )}
      </div>
    </div>
  );
}
