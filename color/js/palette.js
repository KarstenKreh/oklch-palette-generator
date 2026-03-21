// ================================================================
//  Palette generation
// ================================================================

import { hexToOklch, maxChromaInGamut, oklchToHex } from './color-math.js';
import { state } from './state.js';

export const STEPS = [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 825, 850, 875, 900, 925, 950, 975];
export const L_WHITE = 0.98;
export const L_BLACK = 0.10;

const ERROR_HUE = 25;

function surfaceChromaCorrection(L) {
  if (L >= 0.45) return 1.0;
  return Math.pow(L / 0.45, 1.2);
}

export function computeAutoErrorHex(primaryHex) {
  const [pL, pC, pH] = hexToOklch(primaryHex);
  const primaryMaxC = maxChromaInGamut(pL, pH);
  const saturation = primaryMaxC > 0.001 ? pC / primaryMaxC : 0.5;
  const errorMaxC = maxChromaInGamut(pL, ERROR_HUE);
  return oklchToHex(pL, errorMaxC * saturation * 0.95, ERROR_HUE);
}

export function generatePalette(hex, chromaScale = 1.0) {
  const [bL, bC, bH] = hexToOklch(hex);

  const inputMaxC = maxChromaInGamut(bL, bH);
  const saturation = inputMaxC > 0.001 ? bC / inputMaxC : 0;
  const blend = Math.min(1, saturation / 0.3);
  const safeH = bC > 0.005 ? bH : 0;

  // ── Mode-dependent: determine L_MID for step 500 ──
  const L_MID = state.currentMode === 'exact' ? bL : 0.50;

  function stepToL(step) {
    if (step <= 500) return L_WHITE + (step / 500) * (L_MID - L_WHITE);
    return L_MID + ((step - 500) / 500) * (L_BLACK - L_MID);
  }

  // ── Mode-dependent: chroma strategy ──
  if (state.currentMode === 'exact') {
    return STEPS.map(step => {
      const L = stepToL(step);
      const H = safeH;
      let C;

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
      return { step, L, C, H, hex: hx, css };
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
    return { step, L, C, H, hex: hx, css };
  });
}
