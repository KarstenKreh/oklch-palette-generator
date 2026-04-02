import { useCallback, type ClipboardEvent, type ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ColorPicker } from '@/components/color-picker';

const HEX_RE = /^[0-9a-fA-F]{6}$/;

interface ColorInputProps {
  value: string;
  onChange: (hex: string) => void;
  swatchColor: string;
  resultSwatchColor?: string;
  readOnly?: boolean;
  readOnlyHex?: string;
}

export function ColorInput({
  value,
  onChange,
  swatchColor,
  resultSwatchColor,
  readOnly,
  readOnlyHex,
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

  return (
    <div className="flex items-center gap-2">
      {/* Primary swatch — opens color picker */}
      {readOnly ? (
        <div
          className="size-7 shrink-0 rounded border border-border"
          style={{ backgroundColor: swatchColor }}
        />
      ) : (
        <ColorPicker value={swatchColor} onChange={handlePickerChange}>
          <button
            className="size-7 shrink-0 rounded border border-border cursor-pointer hover:ring-2 hover:ring-ring transition-shadow"
            style={{ backgroundColor: swatchColor }}
          />
        </ColorPicker>
      )}

      {readOnly ? (
        <span className="text-sm font-mono text-muted-foreground select-none pointer-events-none cursor-default">
          #{readOnlyHex ?? value}
        </span>
      ) : (
        <div className="flex items-center gap-0.5">
          <span className="text-sm text-muted-foreground select-none">#</span>
          <Input
            value={value}
            onChange={handleChange}
            onPaste={handlePaste}
            maxLength={6}
            spellCheck={false}
            autoComplete="off"
            className={cn(
              'h-7 w-[7.5ch] font-mono text-xs uppercase',
              'border-none bg-transparent! px-0 shadow-none',
              'focus-visible:ring-0 focus-visible:border-transparent',
            )}
          />
        </div>
      )}

      {/* Result swatch (optional) */}
      {resultSwatchColor && (
        <div
          className="size-5 shrink-0 rounded border border-border"
          style={{ backgroundColor: resultSwatchColor }}
        />
      )}
    </div>
  );
}
