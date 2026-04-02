import { useCallback } from 'react';
import { Pin } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { ColorInput } from '@/components/color-input';
import { ModeSwitch } from '@/components/mode-switch';
import { ChromaSlider } from '@/components/chroma-slider';
import { AccentInputs } from '@/components/accent-inputs';
import { useThemeStore } from '@/store/theme-store';
import { usePalette } from '@/hooks/use-palette';
import type { PaletteMode } from '@/lib/palette';
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
  const errorPin = useThemeStore((s) => s.errorPin);
  const toggleErrorPin = useThemeStore((s) => s.toggleErrorPin);
  const currentMode = useThemeStore((s) => s.currentMode);
  const setMode = useThemeStore((s) => s.setMode);
  const fgContrastMode = useThemeStore((s) => s.fgContrastMode);
  const setFgContrastMode = useThemeStore((s) => s.setFgContrastMode);
  const themeName = useThemeStore((s) => s.themeName);
  const setThemeName = useThemeStore((s) => s.setThemeName);

  const {
    effectiveBgHex,
    effectiveErrorHex,
    surface,
    errorSurface,
  } = usePalette();

  const surface50Hex = surface.find((e) => e.step === 50)?.hex;
  const errorSurface50Hex = errorSurface.find((e) => e.step === 50)?.hex;

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
      {/* Theme Settings header — aligns with "Theme Preview" on the right */}
      <h3 className="text-base font-semibold">Theme Settings</h3>

      {/* Theme name */}
      <input
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
        maxLength={60}
        placeholder="Theme Name"
        className="text-lg font-semibold text-foreground w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Section header */}
      <h2 className="text-sm font-semibold text-foreground">Seed Colors</h2>

      {/* Brand group */}
      <div className="rounded-lg border border-border bg-card p-3 pb-2 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Brand</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {/* Label row */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Brand
            </span>
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
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Surface
            </span>
            <Toggle
              pressed={bgAutoMatch}
              onPressedChange={toggleBgAutoMatch}
              size="sm"
              variant="outline"
              aria-label="Auto-derive surface from brand"
              className="h-5 px-1.5 text-[0.65rem]"
            >
              Auto
            </Toggle>
          </div>

          {/* Input row */}
          <ColorInput
            value={brandDisplay}
            onChange={handleBrandHexChange}
            swatchColor={brandHex}
          />
          {bgAutoMatch ? (
            <ColorInput
              value={brandDisplay}
              onChange={handleBrandHexChange}
              swatchColor={brandHex}
              resultSwatchColor={surface50Hex}
              readOnly
              readOnlyHex={surface50Hex?.replace('#', '')}
            />
          ) : (
            <ColorInput
              value={bgDisplay}
              onChange={handleBgHexChange}
              swatchColor={effectiveBgHex}
              resultSwatchColor={surface50Hex}
            />
          )}
        </div>
      </div>

      {/* Error group */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Error</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {/* Label row */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Error
            </span>
            <Toggle
              pressed={errorAutoMatch}
              onPressedChange={toggleErrorAutoMatch}
              size="sm"
              variant="outline"
              aria-label="Auto-derive error color"
              className="h-5 px-1.5 text-[0.65rem]"
            >
              Auto
            </Toggle>
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
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Surface
            </span>
            <span className="text-[0.65rem] text-muted-foreground">auto</span>
          </div>

          {/* Input row */}
          {errorAutoMatch ? (
            <ColorInput
              value={effectiveErrorHex.replace('#', '')}
              onChange={handleErrorHexChange}
              swatchColor={effectiveErrorHex}
              readOnly
              readOnlyHex={effectiveErrorHex.replace('#', '')}
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
            resultSwatchColor={errorSurface50Hex}
            readOnly
            readOnlyHex={errorSurface50Hex?.replace('#', '')}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Additional Colors */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Additional Colors
        </h3>
        <AccentInputs />
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Mode switch */}
      <div className="space-y-1.5">
        <span className="text-sm font-medium text-foreground">
          Palette Mode
        </span>
        <ModeSwitch
          value={currentMode}
          options={MODE_OPTIONS}
          onChange={handleModeChange}
        />
        <p className="text-[0.65rem] text-muted-foreground leading-tight">
          {currentMode === 'balanced'
            ? 'Places step 500 at a balanced midpoint for maximum chroma.'
            : 'Centers the palette on your exact brand color. Use Pin to also force button colors to your exact hex.'}
        </p>
      </div>

      {/* FG Contrast mode switch */}
      <div className="space-y-1.5">
        <span className="text-sm font-medium text-foreground">
          Foreground Contrast
        </span>
        <ModeSwitch
          value={fgContrastMode}
          options={FG_CONTRAST_OPTIONS}
          onChange={handleFgContrastChange}
        />
        <p className="text-[0.65rem] text-muted-foreground leading-tight">
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
