import { useMemo, useCallback } from 'react';
import { Pin, Plus, TriangleAlert, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ColorInput } from '@/components/color-input';
import { ModeSwitch } from '@/components/mode-switch';
import { ChromaSlider } from '@/components/chroma-slider';
import { AccentInputs } from '@/components/accent-inputs';
import { useThemeStore } from '@/store/theme-store';
import { usePalette } from '@/hooks/use-palette';
import { contrastRatio, invertHex } from '@core/color-math';
import type { PaletteMode } from '@core/palette';
import type { FgContrastMode } from '@/store/theme-store';

const MODE_OPTIONS = [
  { value: 'balanced', label: 'Balanced Midpoint' },
  { value: 'exact', label: 'Brand Centered' },
];

const FG_CONTRAST_OPTIONS = [
  { value: 'best', label: 'Best Contrast' },
  { value: 'preferLight', label: 'Prefer Light' },
  { value: 'preferDark', label: 'Prefer Dark' },
];

export function SeedColors() {
  const brandHex = useThemeStore((s) => s.brandHex);
  const setBrandHex = useThemeStore((s) => s.setBrandHex);
  const bgAutoMatch = useThemeStore((s) => s.bgAutoMatch);
  const toggleBgAutoMatch = useThemeStore((s) => s.toggleBgAutoMatch);
  const bgColorHex = useThemeStore((s) => s.bgColorHex);
  const setBgColorHex = useThemeStore((s) => s.setBgColorHex);
  const errorColorHex = useThemeStore((s) => s.errorColorHex);
  const setErrorColorHex = useThemeStore((s) => s.setErrorColorHex);
  const errorAutoMatch = useThemeStore((s) => s.errorAutoMatch);
  const toggleErrorAutoMatch = useThemeStore((s) => s.toggleErrorAutoMatch);
  const brandPin = useThemeStore((s) => s.brandPin);
  const toggleBrandPin = useThemeStore((s) => s.toggleBrandPin);
  const brandInvert = useThemeStore((s) => s.brandInvert);
  const toggleBrandInvert = useThemeStore((s) => s.toggleBrandInvert);
  const errorPin = useThemeStore((s) => s.errorPin);
  const toggleErrorPin = useThemeStore((s) => s.toggleErrorPin);
  const errorInvert = useThemeStore((s) => s.errorInvert);
  const toggleErrorInvert = useThemeStore((s) => s.toggleErrorInvert);
  const currentMode = useThemeStore((s) => s.currentMode);
  const setMode = useThemeStore((s) => s.setMode);
  const fgContrastMode = useThemeStore((s) => s.fgContrastMode);
  const setFgContrastMode = useThemeStore((s) => s.setFgContrastMode);
  const extraAccents = useThemeStore((s) => s.extraAccents);
  const addAccent = useThemeStore((s) => s.addAccent);

  const {
    effectiveBgHex,
    effectiveErrorHex,
    surface,
    errorSurface,
  } = usePalette();

  const surface50Hex = surface.find((e) => e.step === 50)?.hex;
  const surface500Hex = surface.find((e) => e.step === 500)?.hex;
  const surface875Hex = surface.find((e) => e.step === 875)?.hex;
  const errorSurface50Hex = errorSurface.find((e) => e.step === 50)?.hex;
  const errorSurface500Hex = errorSurface.find((e) => e.step === 500)?.hex;

  const brandContrastWarn = useMemo((): string | null => {
    if (!brandPin || !surface50Hex || !surface875Hex) return null;
    const lightFail = contrastRatio(brandHex, surface50Hex) < 4.5;
    const darkHex = brandInvert ? invertHex(brandHex) : brandHex;
    const darkFail = contrastRatio(darkHex, surface875Hex) < 4.5;
    if (lightFail && darkFail) return 'light and dark';
    if (lightFail) return 'light';
    if (darkFail) return 'dark';
    return null;
  }, [brandPin, brandInvert, brandHex, surface50Hex, surface875Hex]);

  const errorContrastWarn = useMemo((): string | null => {
    if (!errorPin || !surface50Hex || !surface875Hex) return null;
    const errHex = errorAutoMatch ? effectiveErrorHex : errorColorHex;
    const lightFail = contrastRatio(errHex, surface50Hex) < 4.5;
    const darkHex = errorInvert ? invertHex(errHex) : errHex;
    const darkFail = contrastRatio(darkHex, surface875Hex) < 4.5;
    if (lightFail && darkFail) return 'light and dark';
    if (lightFail) return 'light';
    if (darkFail) return 'dark';
    return null;
  }, [errorPin, errorInvert, errorAutoMatch, errorColorHex, effectiveErrorHex, surface50Hex, surface875Hex]);

  const handleBrandHexChange = useCallback(
    (hex: string) => setBrandHex(`#${hex}`),
    [setBrandHex],
  );

  const handleBgHexChange = useCallback(
    (hex: string) => setBgColorHex(`#${hex}`),
    [setBgColorHex],
  );

  const handleErrorHexChange = useCallback(
    (hex: string) => setErrorColorHex(`#${hex}`),
    [setErrorColorHex],
  );

  const handleModeChange = useCallback(
    (val: string) => setMode(val as PaletteMode),
    [setMode],
  );

  const handleFgContrastChange = useCallback(
    (val: string) => setFgContrastMode(val as FgContrastMode),
    [setFgContrastMode],
  );

  const brandDisplay = brandHex.replace('#', '');
  const bgDisplay = (bgAutoMatch ? brandHex : bgColorHex).replace('#', '');
  const errorDisplay = errorColorHex.replace('#', '');

  return (
    <div className="space-y-3">
      {/* Section header */}
      <h2 className="text-body-s font-semibold text-foreground">Seed Colors</h2>

      {/* Brand group */}
      <div className="rounded-lg border border-border bg-card p-3 pb-2 space-y-2">
        <h3 className="text-body-s font-semibold text-foreground">Brand</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {/* Label row */}
          <div className="flex items-center gap-1.5">
            <span className="text-caption font-medium text-muted-foreground">
              Brand
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={brandPin}
                  onPressedChange={toggleBrandPin}
                  size="sm"
                  variant="outline"
                  aria-label="Pin brand color"
                  className="h-5 min-w-5 px-1"
                >
                  <Pin className="size-3" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                Pin your exact hex as the primary button color instead of the generated palette step.
              </TooltipContent>
            </Tooltip>
            {brandPin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={brandInvert}
                    onPressedChange={toggleBrandInvert}
                    size="sm"
                    variant="outline"
                    aria-label="Invert in dark mode"
                    className="h-5 min-w-5 px-1"
                  >
                    <ArrowUpDown className="size-3" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  Invert lightness in dark mode — e.g. white buttons become black, and vice versa.
                </TooltipContent>
              </Tooltip>
            )}
            {brandContrastWarn && (
              <Tooltip>
                <TooltipTrigger>
                  <TriangleAlert className="size-3 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>
                  Low contrast against {brandContrastWarn} surfaces — do not use as text color. Use --foreground instead.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-caption font-medium text-muted-foreground">
              Surface
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={bgAutoMatch}
                  onPressedChange={toggleBgAutoMatch}
                  size="sm"
                  variant="outline"
                  aria-label="Auto-derive surface from brand"
                  className="h-5 px-1.5 text-caption"
                >
                  Auto
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                {bgAutoMatch ? 'Surface color is auto-derived from your brand color.' : 'Click to auto-derive surface from brand.'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Input row */}
          <ColorInput
            value={brandDisplay}
            onChange={handleBrandHexChange}
            swatchColor={brandHex}
          />
          <ColorInput
            value={bgDisplay}
            onChange={handleBgHexChange}
            swatchColor={bgAutoMatch ? brandHex : effectiveBgHex}
            previewSwatches={[surface500Hex, surface50Hex].filter(Boolean) as string[]}
            readOnlyHex={surface50Hex?.replace('#', '')}
            locked={bgAutoMatch}
          />
        </div>
      </div>

      {/* Error group */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
        <h3 className="text-body-s font-semibold text-foreground">Error</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {/* Label row */}
          <div className="flex items-center gap-1.5">
            <span className="text-caption font-medium text-muted-foreground">
              Error
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={errorAutoMatch}
                  onPressedChange={toggleErrorAutoMatch}
                  size="sm"
                  variant="outline"
                  aria-label="Auto-derive error color"
                  className="h-5 px-1.5 text-caption"
                >
                  Auto
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                Auto-derive the error color from your brand hue.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={errorPin}
                  onPressedChange={toggleErrorPin}
                  size="sm"
                  variant="outline"
                  aria-label="Pin error color"
                  className="h-5 min-w-5 px-1"
                >
                  <Pin className="size-3" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                Pin your exact hex as the destructive button color.
              </TooltipContent>
            </Tooltip>
            {errorPin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={errorInvert}
                    onPressedChange={toggleErrorInvert}
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
            {errorContrastWarn && (
              <Tooltip>
                <TooltipTrigger>
                  <TriangleAlert className="size-3 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>
                  Low contrast against {errorContrastWarn} surfaces — do not use as text color. Use --foreground instead.
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
          {errorAutoMatch ? (
            <ColorInput
              value={effectiveErrorHex.replace('#', '')}
              onChange={handleErrorHexChange}
              swatchColor={effectiveErrorHex}
              readOnly
              readOnlyHex={effectiveErrorHex.replace('#', '')}
              locked
            />
          ) : (
            <ColorInput
              value={errorDisplay}
              onChange={handleErrorHexChange}
              swatchColor={errorColorHex}
            />
          )}
          <ColorInput
            value={effectiveErrorHex.replace('#', '')}
            onChange={handleErrorHexChange}
            swatchColor={effectiveErrorHex}
            previewSwatches={[errorSurface500Hex, errorSurface50Hex].filter(Boolean) as string[]}
            readOnly
            readOnlyHex={errorSurface50Hex?.replace('#', '')}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Additional Colors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-body-s font-semibold text-foreground">
            Additional Colors
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={addAccent}
            disabled={extraAccents.length >= 10}
            aria-label="Add color"
            className="size-7"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        <AccentInputs />
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Mode switch */}
      <div className="space-y-2">
        <div className="text-body-s font-medium text-foreground mb-2">
          Palette Mode
        </div>
        <ModeSwitch
          value={currentMode}
          options={MODE_OPTIONS}
          onChange={handleModeChange}
        />
        <p className="text-caption text-muted-foreground leading-tight">
          {currentMode === 'balanced'
            ? 'Places step 500 at a balanced midpoint for maximum chroma.'
            : 'Centers the palette on your exact brand color. Use Pin to also force button colors to your exact hex.'}
        </p>
      </div>

      {/* FG Contrast mode switch */}
      <div className="space-y-2">
        <div className="text-body-s font-medium text-foreground mb-2">
          Foreground Contrast
        </div>
        <ModeSwitch
          value={fgContrastMode}
          options={FG_CONTRAST_OPTIONS}
          onChange={handleFgContrastChange}
        />
        <p className="text-caption text-muted-foreground leading-tight">
          Picks light or dark text on colored buttons. "Best" always maximises contrast, "Prefer Light/Dark" follows your preference as long as WCAG AA (4.5 : 1) is met.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Chroma slider */}
      <ChromaSlider />
    </div>
  );
}
