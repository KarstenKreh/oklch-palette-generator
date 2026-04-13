// Shadow generation — Normal, Neumorphic, Flat
// 5 levels (xs–xl) scaled by golden ratio (PHI)

import { hexToOklch, oklchToHex } from './color-math';

export const SQRT_PHI = 1.272;

export type ShadowType = 'normal' | 'neumorphic' | 'flat';

export interface ShadowConfig {
  type: ShadowType;
  strength: number;      // alpha multiplier (default 1.0)
  blurScale: number;     // blur radius multiplier (default 1.0)
  scale: number;         // level spread (default √φ = 1.272)
  colorMode: 'auto' | 'custom';
  customColor: string;   // hex, used when colorMode === 'custom'
}

/** Build the 5-level factor array from a scale value.
 *  xs = 1/scale², sm = 1/scale, md = 1, lg = scale, xl = scale² */
function buildLevels(scale: number) {
  return [
    { name: 'xs', factor: 1 / (scale * scale) },
    { name: 'sm', factor: 1 / scale },
    { name: 'md', factor: 1 },
    { name: 'lg', factor: scale },
    { name: 'xl', factor: scale * scale },
  ];
}

export interface ShadowValue {
  name: string;
  shadow: string;
}

function getShadowHue(bgHex: string, config: ShadowConfig): { L: number; C: number; H: string } {
  if (config.colorMode === 'custom' && config.customColor) {
    const [, , h] = hexToOklch(config.customColor);
    return { L: 0.05, C: 0.01, H: h.toFixed(2) };
  }
  const [, , h] = hexToOklch(bgHex);
  return { L: 0.05, C: 0.01, H: h.toFixed(2) };
}

/** Generate normal (classic) drop shadows. */
function generateNormal(bgHex: string, isDark: boolean, config: ShadowConfig): ShadowValue[] {
  const { H } = getShadowHue(bgHex, config);
  const shadowL = isDark ? 0.02 : 0.05;
  const shadowC = isDark ? 0.005 : 0.01;
  const alphaMultiplier = (isDark ? 1.4 : 0.7) * config.strength;

  return buildLevels(config.scale).map(({ name, factor }) => {
    const oY = factor;
    const a1 = Math.min(0.7, 0.12 * factor * alphaMultiplier).toFixed(3);
    const a2 = Math.min(0.5, 0.18 * factor * alphaMultiplier).toFixed(3);
    const b1 = (factor * 0.6 * config.blurScale).toFixed(3);
    const b2 = (factor * 2.0 * config.blurScale).toFixed(3);
    const shadow =
      `0 ${(oY * 0.4).toFixed(3)}rem ${b1}rem oklch(${shadowL} ${shadowC} ${H} / ${a1}), ` +
      `0 ${oY.toFixed(3)}rem ${b2}rem oklch(${shadowL} ${shadowC} ${H} / ${a2})`;
    return { name, shadow };
  });
}

/** Derive the light/dark companion hex values for a neumorphic surface. */
function neumorphicColors(bgHex: string, isDark: boolean): { lightHex: string; darkHex: string } {
  const [bgL, bgC, bgH] = hexToOklch(bgHex);
  const lightL = Math.min(1, bgL + (isDark ? 0.12 : 0.25));
  const darkL = Math.max(0, bgL - (isDark ? 0.15 : 0.12));
  return {
    lightHex: oklchToHex(lightL, bgC * 0.3, bgH),
    darkHex: oklchToHex(darkL, bgC * 0.3, bgH),
  };
}

/** Generate neumorphic (raised / extruded) shadows — dual light/dark outer pair. */
function generateNeumorphic(bgHex: string, isDark: boolean, config: ShadowConfig): ShadowValue[] {
  const { lightHex, darkHex } = neumorphicColors(bgHex, isDark);

  return buildLevels(config.scale).map(({ name, factor }) => {
    const dist = (factor * 0.25).toFixed(2);
    const blur = (factor * 0.5 * config.blurScale).toFixed(2);
    const aLight = Math.min(1, 0.5 * factor * config.strength).toFixed(2);
    const aDark = Math.min(1, 0.6 * factor * config.strength).toFixed(2);

    const shadow =
      `-${dist}rem -${dist}rem ${blur}rem ${lightHex}${alphaHex(parseFloat(aLight))}, ` +
      `${dist}rem ${dist}rem ${blur}rem ${darkHex}${alphaHex(parseFloat(aDark))}`;
    return { name, shadow };
  });
}

/** Generate neumorphic INSET (pressed / depressed / concave) shadows — dark top-left inside, light bottom-right inside. */
export function generateNeumorphicInset(bgHex: string, isDark: boolean, config: ShadowConfig): ShadowValue[] {
  const { lightHex, darkHex } = neumorphicColors(bgHex, isDark);

  return buildLevels(config.scale).map(({ name, factor }) => {
    const dist = (factor * 0.25).toFixed(2);
    const blur = (factor * 0.5 * config.blurScale).toFixed(2);
    const aLight = Math.min(1, 0.5 * factor * config.strength).toFixed(2);
    const aDark = Math.min(1, 0.6 * factor * config.strength).toFixed(2);

    const shadow =
      `inset ${dist}rem ${dist}rem ${blur}rem ${darkHex}${alphaHex(parseFloat(aDark))}, ` +
      `inset -${dist}rem -${dist}rem ${blur}rem ${lightHex}${alphaHex(parseFloat(aLight))}`;
    return { name, shadow };
  });
}

/** Generate flat/simplified shadows (solid offset, no blur — PostHog style). */
function generateFlat(bgHex: string, isDark: boolean, config: ShadowConfig): ShadowValue[] {
  const [, , surfaceHue] = hexToOklch(bgHex);
  const shadowL = isDark ? 0.08 : 0.15;
  const shadowC = isDark ? 0.01 : 0.02;
  const H = surfaceHue.toFixed(2);
  const baseAlpha = (isDark ? 0.6 : 0.35) * config.strength;

  return buildLevels(config.scale).map(({ name, factor }) => {
    const offset = (factor * 0.25).toFixed(2);
    const a = Math.min(1, baseAlpha * factor).toFixed(2);
    const shadow = `0 ${offset}rem 0 oklch(${shadowL} ${shadowC} ${H} / ${a})`;
    return { name, shadow };
  });
}

/** Convert 0–1 alpha to 2-char hex. */
function alphaHex(a: number): string {
  return Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, '0');
}

/** Main entry: generate shadows for a given config. */
export function generateShadows(bgHex: string, isDark: boolean, config: ShadowConfig): ShadowValue[] {
  switch (config.type) {
    case 'neumorphic': return generateNeumorphic(bgHex, isDark, config);
    case 'flat': return generateFlat(bgHex, isDark, config);
    default: return generateNormal(bgHex, isDark, config);
  }
}

/** Legacy-compatible: generate normal shadows with default config. */
export function generateShadowValues(bgHex: string, isDark: boolean): ShadowValue[] {
  return generateNormal(bgHex, isDark, {
    type: 'normal',
    strength: 1.0,
    blurScale: 1.0,
    scale: SQRT_PHI,
    colorMode: 'auto',
    customColor: '#000000',
  });
}
