// Palette generation — pure functions

import { hexToOklch, maxChromaInGamut, oklchToHex } from './color-math';

export const STEPS = [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 825, 850, 875, 900, 925, 950, 975] as const;
export type Step = (typeof STEPS)[number];

export const L_WHITE = 0.98;
export const L_BLACK = 0.10;

export const ERROR_HUE = 25;
export const SUCCESS_HUE = 145;
export const WARNING_HUE = 85;
export const INFO_HUE = 255;

export interface PaletteEntry {
  step: Step;
  L: number;
  C: number;
  H: number;
  hex: string;
  css: string;
}

function surfaceChromaCorrection(L: number): number {
  if (L >= 0.45) return 1.0;
  return Math.pow(L / 0.45, 1.2);
}

export function computeAutoAccentHex(primaryHex: string, hue: number): string {
  const [pL, pC, pH] = hexToOklch(primaryHex);
  const primaryMaxC = maxChromaInGamut(pL, pH);
  const saturation = primaryMaxC > 0.001 ? pC / primaryMaxC : 0.5;
  const accentMaxC = maxChromaInGamut(pL, hue);
  return oklchToHex(pL, accentMaxC * saturation * 0.95, hue);
}

export function computeAutoErrorHex(primaryHex: string): string {
  return computeAutoAccentHex(primaryHex, ERROR_HUE);
}

export type PaletteMode = 'balanced' | 'exact';

export function generatePalette(hex: string, chromaScale: number = 1.0, mode: PaletteMode = 'balanced'): PaletteEntry[] {
  const [bL, bC, bH] = hexToOklch(hex);

  const inputMaxC = maxChromaInGamut(bL, bH);
  const saturation = inputMaxC > 0.001 ? bC / inputMaxC : 0;
  const blend = Math.min(1, saturation / 0.3);
  const safeH = bC > 0.005 ? bH : 0;

  const L_MID = mode === 'exact' ? bL : 0.50;

  function stepToL(step: number): number {
    if (step <= 500) return L_WHITE + (step / 500) * (L_MID - L_WHITE);
    return L_MID + ((step - 500) / 500) * (L_BLACK - L_MID);
  }

  if (mode === 'exact') {
    return STEPS.map(step => {
      const L = stepToL(step);
      const H = safeH;
      let C: number;

      if (step === 500) {
        C = bC * chromaScale;
      } else {
        const stepNorm = step <= 500 ? step / 500 : (1000 - step) / 500;
        const envelope = 1 - Math.pow(1 - stepNorm, 2);
        const correction = chromaScale < 1.0 ? surfaceChromaCorrection(L) : 1.0;
        const desired = bC * chromaScale * envelope * correction;
        const gamutMax = bC > 0.005 ? maxChromaInGamut(L, safeH) : 0;
        C = Math.min(desired, gamutMax * 0.95);
      }

      const hx = oklchToHex(L, C, H);
      const css = `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`;
      return { step: step as Step, L, C, H, hex: hx, css };
    });
  }

  // BALANCED MODE
  const maxC500 = maxChromaInGamut(L_MID, safeH);
  const targetC500 = maxC500 * 0.88 * blend;

  return STEPS.map(step => {
    const L = stepToL(step);
    const envelope = 1 - Math.pow(2 * L - 1, 2);
    const correction = chromaScale < 1.0 ? surfaceChromaCorrection(L) : 1.0;
    const desired = targetC500 * chromaScale * Math.max(0, envelope) * correction;
    const gamutMax = bC > 0.005 ? maxChromaInGamut(L, safeH) : 0;
    const C = Math.min(desired, gamutMax * 0.95);
    const H = safeH;
    const hx = oklchToHex(L, C, H);
    const css = `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`;
    return { step: step as Step, L, C, H, hex: hx, css };
  });
}
