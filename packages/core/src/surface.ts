// Semantic surface-color derivation from a brand hex using the palette engine.
// Shared between shape-react, system-react, color-react for coherent previews.

import { generatePalette, computeAutoErrorHex, type PaletteEntry, type Step, type PaletteMode } from './palette';
import { contrastRatio, invertHex } from './color-math';
import type { ShapeStyle } from './url-state/shape';

export interface SurfaceColors {
  bg: string;
  card: string;
  /** Always a visibly distinct surface step — unlike `card`, never collapses in neomorph. */
  raised: string;
  elevated: string;
  muted: string;
  secondary: string;
  secondaryFg: string;
  destructive: string;
  destructiveFg: string;
  border: string;
  borderMuted: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryFg: string;
  ring: string;
}

/** Look up a step in a palette by step number. */
function step(palette: PaletteEntry[], s: Step): string {
  return palette.find(e => e.step === s)!.hex;
}

/** Pick foreground from palette — compare actual step contrasts, return whichever wins.
 *  (Previously used hypothetical pure-white/dark, which could pick a step that underperforms.) */
export function pickFgFromPalette(bgHex: string, palette: PaletteEntry[], lightStep: Step, darkStep: Step): string {
  const lightHex = step(palette, lightStep);
  const darkHex = step(palette, darkStep);
  return contrastRatio(lightHex, bgHex) >= contrastRatio(darkHex, bgHex) ? lightHex : darkHex;
}

/**
 * Derive semantic preview colors from a brand hex.
 * When style === 'neomorph', bg/card/elevated/muted collapse to a single monochromatic
 * surface so dual neumorphic shadows carry the depth instead of color contrast.
 */
export function deriveSurface(
  hex: string,
  isDark: boolean,
  mode: PaletteMode = 'balanced',
  chromaScale: number = 1.0,
  brandPin: boolean = false,
  style: ShapeStyle = 'paper',
  errorHexInput?: string,
  errorPin: boolean = false,
  errorInvert: boolean = false,
): SurfaceColors {
  const brand = generatePalette(hex, 1.0, mode);
  const surface = generatePalette(hex, chromaScale * 0.15, mode);
  const errorHex = errorHexInput ?? computeAutoErrorHex(hex);
  const error = generatePalette(errorHex, 1.0, mode);
  const errorSurface = generatePalette(errorHex, 0.1, mode);
  const isNeomorph = style === 'neomorph';

  if (isDark) {
    const primaryBg = brandPin ? hex : step(brand, 400);
    const secondaryBg = step(brand, 800);
    const destructiveBg = errorPin
      ? (errorInvert ? invertHex(errorHex) : errorHex)
      : step(error, 400);
    const monoBg = step(surface, 875);
    return {
      bg: monoBg,
      card: isNeomorph ? monoBg : step(surface, 825),
      raised: step(surface, 825),
      elevated: isNeomorph ? monoBg : step(surface, 800),
      muted: isNeomorph ? monoBg : step(surface, 850),
      secondary: secondaryBg,
      secondaryFg: pickFgFromPalette(secondaryBg, brand, 100, 900),
      destructive: destructiveBg,
      destructiveFg: pickFgFromPalette(destructiveBg, errorSurface, 100, 900),
      border: step(surface, 600),
      borderMuted: step(surface, 700),
      text: step(surface, 25),
      textMuted: step(surface, 300),
      primary: primaryBg,
      primaryFg: pickFgFromPalette(primaryBg, brand, 50, 975),
      ring: step(surface, 500),
    };
  }

  const primaryBg = brandPin ? hex : step(brand, 600);
  const secondaryBg = step(brand, 200);
  const destructiveBg = errorPin ? errorHex : step(error, 600);
  const monoBg = step(surface, 75);
  return {
    bg: isNeomorph ? monoBg : step(surface, 50),
    card: isNeomorph ? monoBg : step(surface, 25),
    raised: step(surface, 25),
    elevated: isNeomorph ? monoBg : step(surface, 25),
    muted: isNeomorph ? monoBg : step(surface, 75),
    secondary: secondaryBg,
    secondaryFg: pickFgFromPalette(secondaryBg, brand, 100, 900),
    destructive: destructiveBg,
    destructiveFg: pickFgFromPalette(destructiveBg, errorSurface, 100, 900),
    border: step(surface, 300),
    borderMuted: step(surface, 200),
    text: step(surface, 975),
    textMuted: step(surface, 700),
    primary: primaryBg,
    primaryFg: pickFgFromPalette(primaryBg, brand, 50, 975),
    ring: step(surface, 400),
  };
}
