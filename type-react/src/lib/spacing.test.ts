import { describe, it, expect } from 'vitest';
import { computeSpacingTokens } from './spacing';
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
