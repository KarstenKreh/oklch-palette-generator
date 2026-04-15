/**
 * Layout tokens — breakpoints and container max-widths.
 *
 * Breakpoints ship with Tailwind v4-compatible defaults. Container max-widths
 * are independent (not bound to breakpoints) — user tunes them separately.
 */

export interface Breakpoint {
  name: string;
  minPx: number;
}

export interface Container {
  name: string;
  maxPx: number;
}

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { name: 'sm', minPx: 640 },
  { name: 'md', minPx: 768 },
  { name: 'lg', minPx: 1024 },
  { name: 'xl', minPx: 1280 },
  { name: '2xl', minPx: 1536 },
];

export const DEFAULT_CONTAINERS: Container[] = [
  { name: 'prose', maxPx: 680 },
  { name: 'narrow', maxPx: 960 },
  { name: 'default', maxPx: 1200 },
  { name: 'wide', maxPx: 1440 },
  { name: 'full', maxPx: 1920 },
];

export const DEFAULT_FLUID_MIN_VW = 375;
export const DEFAULT_FLUID_MAX_VW = 1920;
export const DEFAULT_PROSE_MAX_CH = 65;

/** Return breakpoints sorted ascending by minPx. */
export function sortBreakpoints(bps: Breakpoint[]): Breakpoint[] {
  return [...bps].sort((a, b) => a.minPx - b.minPx);
}

/** Return containers sorted ascending by maxPx. */
export function sortContainers(cts: Container[]): Container[] {
  return [...cts].sort((a, b) => a.maxPx - b.maxPx);
}

/** Compute the ratio between successive breakpoints (for √φ-corridor display). */
export function breakpointRatios(bps: Breakpoint[]): number[] {
  const sorted = sortBreakpoints(bps);
  const ratios: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    ratios.push(sorted[i].minPx / sorted[i - 1].minPx);
  }
  return ratios;
}
