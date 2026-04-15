/**
 * Spacing token computation.
 *
 * Two modes:
 *   - harmonic: hand-picked multiples (0.25× … 6×) applied to a base unit.
 *   - geometric: 9 steps centred on `sm`, each step = base × ratio^(i - 3).
 *
 * The base unit comes either from the type scale (legacy overload kept for
 * system-react back-compat) or directly from a SpacingConfig (new /space tool).
 */

import type { ComputedLevel } from './scale';

export interface SpacingToken {
  name: string;
  multiple: number;
  rem: number;
  px: number;
}

export type SpacingMode = 'harmonic' | 'geometric';

export interface SpacingConfig {
  baseRem: number;
  ratio: number;
  mode: SpacingMode;
  multiplier: number;
  snap: boolean;
}

export const SPACING_STEPS: { name: string; multiple: number }[] = [
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

// Index of `sm` in SPACING_STEPS — geometric centre.
const SM_INDEX = 3;

export const DEFAULT_SPACING_CONFIG: SpacingConfig = {
  baseRem: 1.0,
  ratio: 1.272,
  mode: 'harmonic',
  multiplier: 1.0,
  snap: true,
};

function snapRem(raw: number): number {
  if (raw < 1) return Math.round(raw * 4) / 4;
  if (raw < 4) return Math.round(raw * 2) / 2;
  return Math.round(raw);
}

function computeFromConfig(cfg: SpacingConfig): SpacingToken[] {
  const { baseRem, ratio, mode, multiplier, snap } = cfg;
  const unit = baseRem * multiplier;

  return SPACING_STEPS.map((step, i) => {
    const raw =
      mode === 'harmonic'
        ? unit * step.multiple
        : unit * Math.pow(ratio, i - SM_INDEX);
    const rem = snap ? snapRem(raw) : Math.round(raw * 1000) / 1000;
    return {
      name: step.name,
      multiple: step.multiple,
      rem,
      px: Math.round(rem * 16),
    };
  });
}

function computeFromLevels(
  levels: ComputedLevel[],
  multiplier: number,
): SpacingToken[] {
  const bodyM = levels.find((l) => l.level === 'body-m');
  if (!bodyM) return [];
  const baseRem = bodyM.maxRem * bodyM.lineHeight;
  return computeFromConfig({
    baseRem,
    ratio: 1.272,
    mode: 'harmonic',
    multiplier,
    snap: true,
  });
}

/**
 * Compute spacing tokens.
 *
 * Two call signatures:
 *   computeSpacingTokens(cfg: SpacingConfig)  — new /space tool
 *   computeSpacingTokens(levels, multiplier)  — legacy, derives base from Body M
 */
export function computeSpacingTokens(cfg: SpacingConfig): SpacingToken[];
export function computeSpacingTokens(levels: ComputedLevel[], multiplier?: number): SpacingToken[];
export function computeSpacingTokens(
  arg: SpacingConfig | ComputedLevel[],
  multiplier: number = 1,
): SpacingToken[] {
  if (Array.isArray(arg)) return computeFromLevels(arg, multiplier);
  return computeFromConfig(arg);
}
