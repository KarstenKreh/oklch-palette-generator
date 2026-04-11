/**
 * Typography details: line-height and letter-spacing defaults + override logic.
 *
 * Line-height values follow a gradient from tight (large headings)
 * to comfortable (body text, WCAG 1.4.3 compliant).
 *
 * Letter-spacing (tracking) uses negative values for large headings
 * (tighter) and neutral/positive for body text.
 */

import type { TypeLevel, ComputedLevel } from './scale';

// ── Default Line Heights ──

export const DEFAULT_LINE_HEIGHTS: Record<TypeLevel, number> = {
  'display': 1.05,
  'h1': 1.1,
  'h2': 1.15,
  'h3': 1.2,
  'h4': 1.25,
  'h5': 1.3,
  'h6': 1.4,
  'body-l': 1.5,
  'body-m': 1.5,
  'body-s': 1.5,
  'caption': 1.4,
};

// ── Default Letter Spacings (em) ──

export const DEFAULT_LETTER_SPACINGS: Record<TypeLevel, number> = {
  'display': -0.04,
  'h1': -0.03,
  'h2': -0.02,
  'h3': -0.01,
  'h4': 0,
  'h5': 0,
  'h6': 0,
  'body-l': 0,
  'body-m': 0,
  'body-s': 0.01,
  'caption': 0.01,
};

// ── Apply Typography Details ──

/**
 * Merges default line-height/letter-spacing values with user overrides
 * into the ComputedLevel array.
 */
export function applyTypography(
  levels: ComputedLevel[],
  lineHeightOverrides: Partial<Record<TypeLevel, number>>,
  letterSpacingOverrides: Partial<Record<TypeLevel, number>>,
): ComputedLevel[] {
  return levels.map((l) => ({
    ...l,
    lineHeight: lineHeightOverrides[l.level] ?? DEFAULT_LINE_HEIGHTS[l.level],
    letterSpacing: letterSpacingOverrides[l.level] ?? DEFAULT_LETTER_SPACINGS[l.level],
  }));
}
