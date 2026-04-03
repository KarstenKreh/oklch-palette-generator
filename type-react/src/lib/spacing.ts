/**
 * Spacing token computation derived from the type scale.
 *
 * The baseline unit is calculated from Body M's max size × its line-height.
 * Named tokens are multiples of this baseline.
 */

import type { ComputedLevel } from './scale';
import { round } from './math';

export interface SpacingToken {
  name: string;
  multiple: number;
  rem: number;
  px: number;
}

const SPACING_STEPS: { name: string; multiple: number }[] = [
  { name: '3xs', multiple: 0.25 },
  { name: '2xs', multiple: 0.5 },
  { name: 'xs', multiple: 0.75 },
  { name: 'sm', multiple: 1 },
  { name: 'md', multiple: 1.5 },
  { name: 'lg', multiple: 2 },
  { name: 'xl', multiple: 3 },
  { name: '2xl', multiple: 4 },
  { name: '3xl', multiple: 6 },
];

export function computeSpacingTokens(
  levels: ComputedLevel[],
  multiplier: number = 1,
): SpacingToken[] {
  const bodyM = levels.find((l) => l.level === 'body-m');
  if (!bodyM) return [];

  const baselineUnit = bodyM.maxRem * bodyM.lineHeight * multiplier;

  return SPACING_STEPS.map((step) => {
    const rem = round(baselineUnit * step.multiple);
    return {
      name: step.name,
      multiple: step.multiple,
      rem,
      px: Math.round(rem * 16),
    };
  });
}
