/**
 * Generates a CSS clamp() value for fluid typography.
 *
 * Linearly interpolates between minSize and maxSize
 * across the viewport range minVw–maxVw.
 */

import { round } from './math';

export function generateClamp(
  minSize: number,
  maxSize: number,
  minVw = 375,
  maxVw = 1920,
): string {
  // Guard: swap if min > max (e.g. mobile base larger than desktop base)
  const lo = Math.min(minSize, maxSize);
  const hi = Math.max(minSize, maxSize);

  if (lo === hi) {
    return `${round(lo)}rem`;
  }

  const minVwRem = minVw / 16;
  const maxVwRem = maxVw / 16;

  const slope = (hi - lo) / (maxVwRem - minVwRem);
  const intercept = lo - slope * minVwRem;

  const slopeVw = round(slope * 100);
  const interceptRem = round(intercept);

  const sign = interceptRem >= 0 ? '+' : '-';
  const absIntercept = Math.abs(interceptRem);

  const preferred = `${slopeVw}vw ${sign} ${absIntercept}rem`;

  return `clamp(${round(lo)}rem, ${preferred}, ${round(hi)}rem)`;
}

