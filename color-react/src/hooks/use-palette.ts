import { useMemo } from 'react';
import { useThemeStore } from '@/store/theme-store';
import { generatePalette, computeAutoErrorHex, computeAutoAccentHex, type PaletteEntry } from '@core/palette';
import { hexToOklch } from '@core/color-math';

export interface AccentPalette {
  name: string;
  hex: string;
  cssName: string;
  palette: PaletteEntry[];
  slatedPalette: PaletteEntry[];
  pin: boolean;
  invert: boolean;
}

export function accentCssName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'accent';
}

export function usePalette() {
  const {
    brandHex, bgColorHex, bgAutoMatch, errorColorHex, errorAutoMatch,
    chromaScale, currentMode, extraAccents, brandPin, errorPin,
  } = useThemeStore();

  return useMemo(() => {
    const effectiveBgHex = bgAutoMatch ? brandHex : bgColorHex;
    const effectiveErrorHex = errorAutoMatch ? computeAutoErrorHex(brandHex) : errorColorHex;

    const brand = generatePalette(brandHex, 1.0, currentMode);
    const surface = generatePalette(effectiveBgHex, chromaScale, currentMode);
    const error = generatePalette(effectiveErrorHex, 1.0, currentMode);
    const errorSurface = generatePalette(effectiveErrorHex, chromaScale, currentMode);
    const neutral = generatePalette(effectiveBgHex, 0.0, currentMode);
    const slated = generatePalette(effectiveBgHex, chromaScale, currentMode);

    const accentPalettes: AccentPalette[] = extraAccents
      .filter(a => a.autoMatch || /^#[0-9a-fA-F]{6}$/.test(a.hex))
      .map(a => {
        const effectiveHex = a.autoMatch ? computeAutoAccentHex(brandHex, a.autoHue) : a.hex;
        return {
          name: a.name,
          hex: effectiveHex,
          cssName: accentCssName(a.name),
          palette: generatePalette(effectiveHex, 1.0, currentMode),
          slatedPalette: generatePalette(effectiveHex, chromaScale, currentMode),
          pin: a.pin,
          invert: a.invert,
        };
      });

    const brandSwatchOverride = brandPin
      ? { hex: brandHex, L: hexToOklch(brandHex)[0] }
      : null;
    const errorSwatchOverride = errorPin
      ? { hex: effectiveErrorHex, L: hexToOklch(effectiveErrorHex)[0] }
      : null;

    const neutralExtended: PaletteEntry[] = [
      { step: 0 as PaletteEntry['step'], L: 1, C: 0, H: 0, hex: '#FFFFFF', css: 'oklch(1 0 0)' },
      ...neutral,
      { step: 1000 as PaletteEntry['step'], L: 0, C: 0, H: 0, hex: '#000000', css: 'oklch(0 0 0)' },
    ];

    return {
      brand,
      surface,
      error,
      errorSurface,
      neutral,
      neutralExtended,
      slated,
      accentPalettes,
      brandSwatchOverride,
      errorSwatchOverride,
      effectiveBgHex,
      effectiveErrorHex,
    };
  }, [brandHex, bgColorHex, bgAutoMatch, errorColorHex, errorAutoMatch, chromaScale, currentMode, extraAccents, brandPin, errorPin]);
}
