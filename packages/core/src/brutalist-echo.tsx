/**
 * Hollow offset-outline shadow used by the Neobrutalism shape style.
 * box-shadow can't paint a transparent-interior rectangle, so the echo
 * is a real DOM sibling: absolutely positioned, translated by (offsetX, offsetY),
 * with a CSS border and the surface color as fill.
 *
 * Parent must be `position: relative`. Place the echo as a sibling BEFORE
 * the visible surface so the surface paints on top.
 */

import { hexToOklch, oklchToHex, maxChromaInGamut } from './color-math';

export type BrutalistLevel = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Derive a brutalist border color by darkening the bg by ~1 palette step (ΔL ≈ 0.10 in OKLCH).
 *  Darkens in both light and dark modes — keeps the hue, gamut-safe chroma. */
export function deriveBorderFromBg(bgHex: string): string {
  const [L, C, H] = hexToOklch(bgHex);
  const shifted = Math.max(0.05, L - 0.10);
  const maxC = maxChromaInGamut(shifted, H);
  return oklchToHex(shifted, Math.min(C, maxC * 0.95), H);
}

/** Per-level scaling factor applied to the base offset. Matches the shadow scale. */
export function brutalistFactor(level: BrutalistLevel, scale: number): number {
  switch (level) {
    case 'xs': return 1 / (scale * scale);
    case 'sm': return 1 / scale;
    case 'md': return 1;
    case 'lg': return scale;
    case 'xl': return scale * scale;
  }
}

export interface BrutalistEchoProps {
  level: BrutalistLevel;
  offsetX: number;
  offsetY: number;
  scale: number;
  strokeWidth: number;
  borderRadius: number;
  bgColor: string;
  borderColor: string;
  opacity?: number;
}

export function BrutalistEcho({
  level,
  offsetX,
  offsetY,
  scale,
  strokeWidth,
  borderRadius,
  bgColor,
  borderColor,
  opacity = 1,
}: BrutalistEchoProps) {
  const factor = brutalistFactor(level, scale);
  const oX = offsetX * factor;
  const oY = offsetY * factor;
  return (
    <div
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        inset: 0,
        transform: `translate(${oX}px, ${oY}px)`,
        backgroundColor: bgColor,
        border: `${strokeWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        opacity,
      }}
    />
  );
}
