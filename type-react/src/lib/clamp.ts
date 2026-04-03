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
  if (minSize === maxSize) {
    return `${round(minSize)}rem`;
  }

  const minVwRem = minVw / 16;
  const maxVwRem = maxVw / 16;

  const slope = (maxSize - minSize) / (maxVwRem - minVwRem);
  const intercept = minSize - slope * minVwRem;

  const slopeVw = round(slope * 100);
  const interceptRem = round(intercept);

  const sign = interceptRem >= 0 ? '+' : '-';
  const absIntercept = Math.abs(interceptRem);

  const preferred = `${slopeVw}vw ${sign} ${absIntercept}rem`;

  return `clamp(${round(minSize)}rem, ${preferred}, ${round(maxSize)}rem)`;
}

