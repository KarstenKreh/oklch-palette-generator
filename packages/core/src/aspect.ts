/**
 * Aspect ratio tokens. Stored as { w, h } so non-integer ratios (golden, silver)
 * retain their geometric meaning and round-trip losslessly through CSS.
 */

export interface AspectRatio {
  name: string;
  w: number;
  h: number;
}

export const DEFAULT_ASPECT_RATIOS: AspectRatio[] = [
  { name: 'square', w: 1, h: 1 },
  { name: 'landscape', w: 4, h: 3 },
  { name: 'photo', w: 3, h: 2 },
  { name: 'video', w: 16, h: 9 },
  { name: 'ultrawide', w: 21, h: 9 },
  { name: 'golden', w: 1.618, h: 1 },
  { name: 'silver', w: 1.414, h: 1 },
  { name: 'cinema', w: 2.39, h: 1 },
];

/** Format an aspect ratio as CSS-ready "w / h" — preserves integer form when possible. */
export function formatAspect(a: AspectRatio): string {
  const w = Number.isInteger(a.w) ? a.w.toString() : a.w.toFixed(3).replace(/\.?0+$/, '');
  const h = Number.isInteger(a.h) ? a.h.toString() : a.h.toFixed(3).replace(/\.?0+$/, '');
  return `${w} / ${h}`;
}

/** Decimal value (w / h) — useful for sorting or padding-bottom fallback. */
export function aspectValue(a: AspectRatio): number {
  return a.h === 0 ? 0 : a.w / a.h;
}

/** Reciprocal: 16:9 → 9:16. Name gets "-portrait" suffix. */
export function reciprocal(a: AspectRatio): AspectRatio {
  return { name: `${a.name}-portrait`, w: a.h, h: a.w };
}

/**
 * Expand the list (adding portrait variants if requested) and sort widest → tallest
 * by w/h descending. Squares (1:1) and other equal-sided ratios sort at 1.0.
 */
export function expandAndSortAspects(
  ratios: AspectRatio[],
  includeReciprocals: boolean,
): AspectRatio[] {
  const all: AspectRatio[] = [];
  for (const a of ratios) {
    all.push(a);
    if (includeReciprocals && a.w !== a.h) all.push(reciprocal(a));
  }
  return all.sort((a, b) => aspectValue(b) - aspectValue(a));
}
