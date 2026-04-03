/**
 * Type scale calculation engine.
 *
 * Three modes:
 * 1. Golden Ratio — fixed min/max lookup derived from sqrt(phi)
 * 2. Traditional — classic typographic point sizes (fixed, non-fluid)
 * 3. Custom — user-defined ratio with automatic fluid shrink
 */

import { generateClamp } from './clamp';
import { round } from './math';
import { DEFAULT_LINE_HEIGHTS, DEFAULT_LETTER_SPACINGS } from './typography';

// ── Types ──

export type TypeLevel =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body-l' | 'body-m' | 'body-s' | 'caption';

export const TYPE_LEVELS: TypeLevel[] = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'body-l', 'body-m', 'body-s', 'caption',
];

export const LEVEL_LABELS: Record<TypeLevel, string> = {
  'h1': 'H1', 'h2': 'H2', 'h3': 'H3',
  'h4': 'H4', 'h5': 'H5', 'h6': 'H6',
  'body-l': 'Body L', 'body-m': 'Body M', 'body-s': 'Body S',
  'caption': 'Caption',
};

export interface ComputedLevel {
  level: TypeLevel;
  label: string;
  minRem: number;
  maxRem: number;
  clampValue: string;
  isFluid: boolean;
  isHeading: boolean;
  lineHeight: number;
  letterSpacing: number;
}

// ── Golden Ratio Scale ──

// Reference table at baseSize = 1.0rem
// Derived from sqrt(phi) ≈ 1.272, rounded to practical values.
// Min = Mobile (<810px), Max = Wide (>1920px)
const GOLDEN_TABLE: Record<TypeLevel, { min: number; max: number }> = {
  'h1':     { min: 2.4, max: 3.7 },
  'h2':     { min: 2.2, max: 2.9 },
  'h3':     { min: 1.8, max: 2.2 },
  'h4':     { min: 1.5, max: 1.7 },
  'h5':     { min: 1.2, max: 1.3 },
  'h6':     { min: 1.0, max: 1.0 },
  'body-l': { min: 1.5, max: 1.7 },
  'body-m': { min: 1.1, max: 1.3 },
  'body-s':  { min: 1.0, max: 1.0 },
  'caption': { min: 0.79, max: 0.79 },
};

export function goldenScale(baseSize: number): ComputedLevel[] {
  return TYPE_LEVELS.map((level) => {
    const ref = GOLDEN_TABLE[level];
    const min = round(ref.min * baseSize);
    const max = round(ref.max * baseSize);
    const isFluid = min !== max;

    return {
      level,
      label: LEVEL_LABELS[level],
      minRem: min,
      maxRem: max,
      clampValue: isFluid ? generateClamp(min, max) : `${min}rem`,
      isFluid,
      isHeading: level.startsWith('h'),
      lineHeight: DEFAULT_LINE_HEIGHTS[level],
      letterSpacing: DEFAULT_LETTER_SPACINGS[level],
    };
  });
}

// ── Traditional Typographic Scale ──

// The classic point sizes from metal typesetting / Word (treated as px in web)
// Names from the traditional type foundry naming system
export const TRADITIONAL_SIZES: { px: number; name: string }[] = [
  { px: 6,    name: 'Nonpareille' },
  { px: 7,    name: 'Mignon' },
  { px: 8,    name: 'Petit' },
  { px: 9,    name: 'Borgis' },
  { px: 10,   name: 'Korpus' },
  { px: 10.5, name: 'Konkordanz' },
  { px: 11,   name: 'Rheinländer' },
  { px: 12,   name: 'Cicero' },
  { px: 14,   name: 'Mittel' },
  { px: 16,   name: 'Tertia' },
  { px: 18,   name: 'Paragon' },
  { px: 20,   name: 'Text' },
  { px: 22,   name: 'Doppelcicero' },
  { px: 24,   name: 'Kleine Kanon' },
  { px: 26,   name: 'Große Kanon' },
  { px: 28,   name: 'Missal' },
  { px: 36,   name: 'Kleine Sabon' },
  { px: 48,   name: 'Große Sabon' },
  { px: 72,   name: 'Imperial' },
];

export const DEFAULT_TRADITIONAL: Record<TypeLevel, number> = {
  'h1': 48, 'h2': 36, 'h3': 24,
  'h4': 20, 'h5': 18, 'h6': 16,
  'body-l': 20, 'body-m': 18, 'body-s': 16, 'caption': 12,
};

/** One step down in TRADITIONAL_SIZES for each default desktop value */
export function stepDown(px: number): number {
  const pxList = TRADITIONAL_SIZES.map((s) => s.px);
  const idx = pxList.indexOf(px);
  if (idx <= 0) return pxList[0];
  return pxList[idx - 1];
}

export const DEFAULT_TRADITIONAL_MOBILE: Record<TypeLevel, number> =
  Object.fromEntries(
    TYPE_LEVELS.map((level) => [level, stepDown(DEFAULT_TRADITIONAL[level])])
  ) as Record<TypeLevel, number>;

export function traditionalScale(
  assignments: Record<TypeLevel, number>,
  mobileAssignments: Record<TypeLevel, number>,
): ComputedLevel[] {
  return TYPE_LEVELS.map((level) => {
    const maxPx = assignments[level];
    const minPx = mobileAssignments[level];
    const maxRem = round(maxPx / 16);
    const minRem = round(minPx / 16);
    const isFluid = minRem !== maxRem;
    return {
      level,
      label: LEVEL_LABELS[level],
      minRem,
      maxRem,
      clampValue: isFluid ? generateClamp(minRem, maxRem) : `${maxRem}rem`,
      isFluid,
      isHeading: level.startsWith('h'),
      lineHeight: DEFAULT_LINE_HEIGHTS[level],
      letterSpacing: DEFAULT_LETTER_SPACINGS[level],
    };
  });
}

// ── Custom Ratio Scale ──

// Named ratio presets
export const RATIO_PRESETS: { name: string; value: number }[] = [
  { name: 'Minor Second', value: 1.067 },
  { name: 'Major Second', value: 1.125 },
  { name: 'Minor Third', value: 1.2 },
  { name: 'Major Third', value: 1.25 },
  { name: 'Golden Ratio (sqrt)', value: 1.272 },
  { name: 'Perfect Fourth', value: 1.333 },
  { name: 'Augmented Fourth', value: 1.414 },
  { name: 'Perfect Fifth', value: 1.5 },
  { name: 'Golden Ratio', value: 1.618 },
];

// Step mapping: H6/Body-S = 0, H1 = 5
const LEVEL_STEPS: Record<TypeLevel, number> = {
  'h1': 5, 'h2': 4, 'h3': 3,
  'h4': 2, 'h5': 1, 'h6': 0,
  'body-l': 2, 'body-m': 1, 'body-s': 0,
  'caption': -1,
};

export function customScale(
  baseSize: number,
  ratio: number,
  mobileRatio: number = ratio,
  mobileBaseSize: number = baseSize,
): ComputedLevel[] {
  return TYPE_LEVELS.map((level) => {
    const step = LEVEL_STEPS[level];
    const max = round(baseSize * Math.pow(ratio, step));
    const min = round(mobileBaseSize * Math.pow(mobileRatio, step));
    const isFluid = min !== max;

    return {
      level,
      label: LEVEL_LABELS[level],
      minRem: min,
      maxRem: max,
      clampValue: isFluid ? generateClamp(min, max) : `${min}rem`,
      isFluid,
      isHeading: level.startsWith('h'),
      lineHeight: DEFAULT_LINE_HEIGHTS[level],
      letterSpacing: DEFAULT_LETTER_SPACINGS[level],
    };
  });
}


