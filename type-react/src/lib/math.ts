/**
 * Shared math utilities for the type scale system.
 */

export function round(n: number, decimals = 4): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
