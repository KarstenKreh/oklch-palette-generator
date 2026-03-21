// ================================================================
//  Shadow generation (shared by render-code + render-surfaces)
// ================================================================

import { hexToOklch } from './color-math.js';

const PHI = 1.618033988749895;
const SQRT_PHI = Math.sqrt(PHI);

const LEVELS = [
  { name: 'xs', factor: 1 / PHI },
  { name: 'sm', factor: 1 / SQRT_PHI },
  { name: 'md', factor: 1 },
  { name: 'lg', factor: SQRT_PHI },
  { name: 'xl', factor: PHI },
];

export function generateShadowValues(bgHex, isDark) {
  const [bgL, , surfaceHue] = hexToOklch(bgHex);
  const shadowL = isDark ? 0.02 : 0.05;
  const shadowC = isDark ? 0.005 : 0.01;
  const H = surfaceHue.toFixed(2);
  const alphaMultiplier = isDark ? 1.4 : 0.7;

  return LEVELS.map(({ name, factor }) => {
    const oY = factor;
    const a1 = Math.min(0.7, 0.12 * factor * alphaMultiplier).toFixed(3);
    const a2 = Math.min(0.5, 0.18 * factor * alphaMultiplier).toFixed(3);
    const b1 = (factor * 0.6).toFixed(3);
    const b2 = (factor * 2.0).toFixed(3);
    const shadow =
      `0 ${(oY * 0.4).toFixed(3)}rem ${b1}rem oklch(${shadowL} ${shadowC} ${H} / ${a1}), ` +
      `0 ${oY.toFixed(3)}rem ${b2}rem oklch(${shadowL} ${shadowC} ${H} / ${a2})`;
    return { name, shadow };
  });
}
