import { describe, it, expect } from 'vitest';
import { computeSpacingTokens, DEFAULT_SPACING_CONFIG } from './spacing';
import { customScale } from './scale';

function getLevels(baseSize = 1.0, ratio = 1.272) {
  return customScale(baseSize, ratio);
}

describe('computeSpacingTokens', () => {
  it('returns 9 tokens', () => {
    const tokens = computeSpacingTokens(getLevels());
    expect(tokens).toHaveLength(9);
  });

  it('tokens are named 3xs through 3xl', () => {
    const tokens = computeSpacingTokens(getLevels());
    const names = tokens.map((t) => t.name);
    expect(names).toEqual(['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']);
  });

  it('multiplier 2.0 doubles values vs multiplier 1.0', () => {
    const levels = getLevels();
    const tokens1 = computeSpacingTokens(levels, 1.0);
    const tokens2 = computeSpacingTokens(levels, 2.0);
    for (let i = 0; i < tokens1.length; i++) {
      // Values are rounded to grid, so we check approximate doubling
      expect(tokens2[i].rem).toBeGreaterThanOrEqual(tokens1[i].rem * 1.5);
    }
  });

  it('values are sorted ascending', () => {
    const tokens = computeSpacingTokens(getLevels());
    for (let i = 1; i < tokens.length; i++) {
      expect(tokens[i].rem).toBeGreaterThanOrEqual(tokens[i - 1].rem);
    }
  });

  it('px = rem * 16', () => {
    const tokens = computeSpacingTokens(getLevels());
    for (const t of tokens) {
      expect(t.px).toBe(Math.round(t.rem * 16));
    }
  });

  it('returns empty for levels without body-m', () => {
    const tokens = computeSpacingTokens([]);
    expect(tokens).toEqual([]);
  });

  it('grid rounding: small values snap to 0.25rem', () => {
    const tokens = computeSpacingTokens(getLevels());
    const small = tokens.filter((t) => t.rem < 1);
    for (const t of small) {
      expect(t.rem * 4 % 1).toBeCloseTo(0, 5);
    }
  });
});

describe('computeSpacingTokens — SpacingConfig signature', () => {
  it('harmonic mode with defaults matches legacy expectation', () => {
    const tokens = computeSpacingTokens(DEFAULT_SPACING_CONFIG);
    expect(tokens).toHaveLength(9);
    expect(tokens[3].name).toBe('sm');
    expect(tokens[3].rem).toBe(1);
  });

  it('geometric mode produces √φ^n series centred on sm', () => {
    const tokens = computeSpacingTokens({
      ...DEFAULT_SPACING_CONFIG,
      mode: 'geometric',
      snap: false,
    });
    // sm (index 3) = base × ratio^0 = 1
    expect(tokens[3].rem).toBeCloseTo(1, 3);
    // md (index 4) = base × ratio^1 = 1.272
    expect(tokens[4].rem).toBeCloseTo(1.272, 3);
    // lg (index 5) = base × ratio^2 ≈ 1.618
    expect(tokens[5].rem).toBeCloseTo(1.272 * 1.272, 3);
    // xs (index 2) = base × ratio^-1 ≈ 0.786
    expect(tokens[2].rem).toBeCloseTo(1 / 1.272, 3);
  });

  it('multiplier scales all geometric values', () => {
    const base = computeSpacingTokens({
      ...DEFAULT_SPACING_CONFIG,
      mode: 'geometric',
      snap: false,
    });
    const doubled = computeSpacingTokens({
      ...DEFAULT_SPACING_CONFIG,
      mode: 'geometric',
      multiplier: 2,
      snap: false,
    });
    for (let i = 0; i < base.length; i++) {
      expect(doubled[i].rem).toBeCloseTo(base[i].rem * 2, 3);
    }
  });

  it('snap=false preserves fine values', () => {
    const tokens = computeSpacingTokens({
      ...DEFAULT_SPACING_CONFIG,
      mode: 'geometric',
      snap: false,
    });
    // Should contain at least one non-integer-grid value
    const hasNonSnapped = tokens.some((t) => Math.abs(t.rem * 4 - Math.round(t.rem * 4)) > 0.001);
    expect(hasNonSnapped).toBe(true);
  });
});
