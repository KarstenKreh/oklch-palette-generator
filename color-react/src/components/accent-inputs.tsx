import { useCallback, useRef, type ChangeEvent } from 'react';
import { X, Pin, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ColorInput } from '@/components/color-input';
import { useThemeStore } from '@/store/theme-store';
import { usePalette } from '@/hooks/use-palette';

export function AccentInputs() {
  const extraAccents = useThemeStore((s) => s.extraAccents);
  const addAccent = useThemeStore((s) => s.addAccent);
  const removeAccent = useThemeStore((s) => s.removeAccent);
  const updateAccent = useThemeStore((s) => s.updateAccent);
  const toggleAccentPin = useThemeStore((s) => s.toggleAccentPin);
  const { accentPalettes } = usePalette();

  return (
    <div className="space-y-3">
      {extraAccents.map((accent, i) => {
        const palette = accentPalettes.find((p) => p.name === accent.name);
        const surface50Hex = palette?.slatedPalette.find(
          (e) => e.step === 50,
        )?.hex;
        const surface500Hex = palette?.slatedPalette.find(
          (e) => e.step === 500,
        )?.hex;

        return (
          <AccentRow
            key={i}
            index={i}
            name={accent.name}
            hex={accent.hex}
            pin={accent.pin}
            surface50Hex={surface50Hex}
            surface500Hex={surface500Hex}
            onRemove={removeAccent}
            onUpdate={updateAccent}
            onTogglePin={toggleAccentPin}
          />
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={addAccent}
        disabled={extraAccents.length >= 3}
        className="w-full"
      >
        + Add Color
      </Button>
    </div>
  );
}

interface AccentRowProps {
  index: number;
  name: string;
  hex: string;
  pin: boolean;
  surface50Hex?: string;
  surface500Hex?: string;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: { name?: string; hex?: string }) => void;
  onTogglePin: (index: number) => void;
}

function AccentRow({
  index,
  name,
  hex,
  pin,
  surface50Hex,
  surface500Hex,
  onRemove,
  onUpdate,
  onTogglePin,
}: AccentRowProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  const handleNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onUpdate(index, { name: e.target.value });
    },
    [index, onUpdate],
  );

  const handleHexChange = useCallback(
    (newHex: string) => {
      onUpdate(index, { hex: `#${newHex}` });
    },
    [index, onUpdate],
  );

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleTogglePin = useCallback(() => {
    onTogglePin(index);
  }, [index, onTogglePin]);

  const displayHex = hex.replace('#', '');

  return (
    <div className="rounded-lg border border-border bg-card p-3 pb-2 space-y-2">
      {/* Header: name + delete */}
      <div className="flex items-center justify-between gap-2 group/header">
        <div className="inline-flex items-center gap-1 min-w-0">
          <div className="inline-grid text-body-s font-semibold">
            <span className="invisible whitespace-pre col-start-1 row-start-1 min-w-3">{name}</span>
            <input
              ref={nameRef}
              value={name}
              onChange={handleNameChange}
              size={1}
              className="bg-transparent border-none outline-none text-foreground cursor-text col-start-1 row-start-1 w-full"
            />
          </div>
          <Pencil
            className="size-2.5 text-muted-foreground shrink-0 opacity-0 group-hover/header:opacity-100 transition-opacity cursor-pointer"
            onClick={() => nameRef.current?.focus()}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          aria-label={`Remove ${name}`}
          className="size-6"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Two columns: Color + Surface */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {/* Label row */}
        <div className="flex items-center gap-1.5">
          <span className="text-caption font-medium text-muted-foreground">
            Action
          </span>
          <Toggle
            pressed={pin}
            onPressedChange={handleTogglePin}
            size="sm"
            variant="outline"
            aria-label="Pin color"
            className="h-5 min-w-5 px-1"
          >
            <Pin className="size-3" />
          </Toggle>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-caption font-medium text-muted-foreground">
            Surface
          </span>
          <span className="text-caption text-muted-foreground">auto</span>
        </div>

        {/* Input row */}
        <ColorInput
          value={displayHex}
          onChange={handleHexChange}
          swatchColor={hex}
        />
        <ColorInput
          value={displayHex}
          onChange={handleHexChange}
          swatchColor={hex}
          previewSwatches={[surface500Hex, surface50Hex].filter(Boolean) as string[]}
          readOnly
          readOnlyHex={surface50Hex?.replace('#', '')}
        />
      </div>
    </div>
  );
}
