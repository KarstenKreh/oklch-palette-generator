/**
 * Weight compensation for heading font sizes.
 *
 * Empirical correction factors that adjust heading sizes to preserve
 * the perceived area ratio (√φ) across different font weights.
 * Heavier weights add optical density, so sizes are reduced to compensate.
 */

import { generateClamp } from './clamp';
import { round } from './math';
import type { ComputedLevel } from './scale';

const WEIGHT_CORRECTION: [number, number][] = [
  [100, 0.06],   // Thin:      +6%
  [200, 0.04],   // ExtraLight: +4%
  [300, 0.03],   // Light:     +3%
  [400, 0],      // Regular:    0% (reference)
  [500, -0.015], // Medium:    −1.5%
  [600, -0.03],  // Semibold:  −3%
  [700, -0.05],  // Bold:      −5%
  [800, -0.065], // ExtraBold: −6.5%
  [900, -0.08],  // Black:     −8%
];

export function weightCorrectionFactor(weight: number): number {
  if (weight <= WEIGHT_CORRECTION[0][0]) return WEIGHT_CORRECTION[0][1];
  if (weight >= WEIGHT_CORRECTION[WEIGHT_CORRECTION.length - 1][0])
    return WEIGHT_CORRECTION[WEIGHT_CORRECTION.length - 1][1];

  for (let i = 0; i < WEIGHT_CORRECTION.length - 1; i++) {
    const [w0, c0] = WEIGHT_CORRECTION[i];
    const [w1, c1] = WEIGHT_CORRECTION[i + 1];
    if (weight >= w0 && weight <= w1) {
      const t = (weight - w0) / (w1 - w0);
      return c0 + t * (c1 - c0);
    }
  }
  return 0;
}

export function applyWeightCompensation(
  levels: ComputedLevel[],
  weight: number,
): ComputedLevel[] {
  const factor = 1 + weightCorrectionFactor(weight);
  return levels.map((l) => {
    if (!l.isHeading) return l;
    const min = round(l.minRem * factor);
    const max = round(l.maxRem * factor);
    const isFluid = min !== max;
    return {
      ...l,
      minRem: min,
      maxRem: max,
      clampValue: isFluid ? generateClamp(min, max) : `${min}rem`,
      isFluid,
    };
  });
}
