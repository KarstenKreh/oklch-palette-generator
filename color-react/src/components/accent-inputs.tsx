import { useCallback, useMemo, useRef, type ChangeEvent } from 'react';
import { X, Pin, Pencil, Plus, TriangleAlert, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ColorInput } from '@/components/color-input';
import { useThemeStore } from '@/store/theme-store';
import { usePalette } from '@/hooks/use-palette';
import { contrastRatio, invertHex } from '@core/color-math';

export function AccentInputs() {
  const extraAccents = useThemeStore((s) => s.extraAccents);
  const addAccent = useThemeStore((s) => s.addAccent);
  const removeAccent = useThemeStore((s) => s.removeAccent);
  const updateAccent = useThemeStore((s) => s.updateAccent);
  const toggleAccentPin = useThemeStore((s) => s.toggleAccentPin);
  const toggleAccentInvert = useThemeStore((s) => s.toggleAccentInvert);
  const toggleAccentAutoMatch = useThemeStore((s) => s.toggleAccentAutoMatch);
  const { accentPalettes, surface } = usePalette();
  const mainSurface50 = surface.find((e) => e.step === 50)?.hex;
  const mainSurface875 = surface.find((e) => e.step === 875)?.hex;

  return (
    <div className="space-y-3">
      {extraAccents.map((accent, i) => {
        const palette = accentPalettes.find((p) => p.name === accent.name);
        const effectiveHex = palette?.hex ?? accent.hex;
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
            effectiveHex={effectiveHex}
            pin={accent.pin}
            invert={accent.invert}
            autoMatch={accent.autoMatch}
            surface50Hex={surface50Hex}
            surface500Hex={surface500Hex}
            mainSurface50={mainSurface50}
            mainSurface875={mainSurface875}
            onRemove={removeAccent}
            onUpdate={updateAccent}
            onTogglePin={toggleAccentPin}
            onToggleInvert={toggleAccentInvert}
            onToggleAutoMatch={toggleAccentAutoMatch}
          />
        );
      })}
    </div>
  );
}

interface AccentRowProps {
  index: number;
  name: string;
  hex: string;
  effectiveHex: string;
  pin: boolean;
  invert: boolean;
  autoMatch: boolean;
  surface50Hex?: string;
  surface500Hex?: string;
  mainSurface50?: string;
  mainSurface875?: string;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: { name?: string; hex?: string }) => void;
  onTogglePin: (index: number) => void;
  onToggleInvert: (index: number) => void;
  onToggleAutoMatch: (index: number) => void;
}

function AccentRow({
  index,
  name,
  hex,
  effectiveHex,
  pin,
  invert,
  autoMatch,
  surface50Hex,
  surface500Hex,
  mainSurface50,
  mainSurface875,
  onRemove,
  onUpdate,
  onTogglePin,
  onToggleInvert,
  onToggleAutoMatch,
}: AccentRowProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  const contrastWarn = useMemo((): string | null => {
    if (!pin || !mainSurface50 || !mainSurface875) return null;
    const lightFail = contrastRatio(effectiveHex, mainSurface50) < 4.5;
    const darkHex = invert ? invertHex(effectiveHex) : effectiveHex;
    const darkFail = contrastRatio(darkHex, mainSurface875) < 4.5;
    if (lightFail && darkFail) return 'light and dark';
    if (lightFail) return 'light';
    if (darkFail) return 'dark';
    return null;
  }, [pin, invert, effectiveHex, mainSurface50, mainSurface875]);

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

  const handleToggleInvert = useCallback(() => {
    onToggleInvert(index);
  }, [index, onToggleInvert]);

  const handleToggleAutoMatch = useCallback(() => {
    onToggleAutoMatch(index);
  }, [index, onToggleAutoMatch]);

  const displayHex = (autoMatch ? effectiveHex : hex).replace('#', '');

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={autoMatch}
                onPressedChange={handleToggleAutoMatch}
                size="sm"
                variant="outline"
                aria-label="Auto-derive color"
                className="h-5 px-1.5 text-caption"
              >
                Auto
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              Auto-derive this accent from your brand hue.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              Pin your exact hex as the accent button color.
            </TooltipContent>
          </Tooltip>
          {pin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={invert}
                  onPressedChange={handleToggleInvert}
                  size="sm"
                  variant="outline"
                  aria-label="Invert in dark mode"
                  className="h-5 min-w-5 px-1"
                >
                  <ArrowUpDown className="size-3" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                Invert lightness in dark mode.
              </TooltipContent>
            </Tooltip>
          )}
          {contrastWarn && (
            <Tooltip>
              <TooltipTrigger>
                <TriangleAlert className="size-3 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent>
                Low contrast against {contrastWarn} surfaces — do not use as text color. Use --foreground instead.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-caption font-medium text-muted-foreground">
            Surface
          </span>
          <Toggle
            pressed
            disabled
            size="sm"
            variant="outline"
            aria-label="Surface is auto-derived"
            className="h-5 px-1.5 text-caption"
          >
            Auto
          </Toggle>
        </div>

        {/* Input row */}
        {autoMatch ? (
          <ColorInput
            value={displayHex}
            onChange={handleHexChange}
            swatchColor={effectiveHex}
            readOnly
            readOnlyHex={effectiveHex.replace('#', '')}
            locked
          />
        ) : (
          <ColorInput
            value={displayHex}
            onChange={handleHexChange}
            swatchColor={hex}
          />
        )}
        <ColorInput
          value={displayHex}
          onChange={handleHexChange}
          swatchColor={autoMatch ? effectiveHex : hex}
          previewSwatches={[surface500Hex, surface50Hex].filter(Boolean) as string[]}
          readOnly
          readOnlyHex={surface50Hex?.replace('#', '')}
        />
      </div>
    </div>
  );
}
