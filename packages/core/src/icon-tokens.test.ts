import { describe, it, expect } from 'vitest';
import { computeIconTokens, weightToStroke } from './icon-tokens';

describe('computeIconTokens', () => {
  it('generates 6 size levels', () => {
    const tokens = computeIconTokens(1.25, 1.25, 1.5, false);
    expect(tokens.sizes).toHaveLength(6);
    expect(tokens.sizes.map((s) => s.name)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl']);
  });

  it('md equals baseSize', () => {
    const tokens = computeIconTokens(1.25, 1.25, 1.5, false);
    expect(tokens.sizes[2].rem).toBe(1.25);
  });

  it('sizes increase from xs to 2xl', () => {
    const tokens = computeIconTokens(1.25, 1.25, 1.5, false);
    for (let i = 1; i < tokens.sizes.length; i++) {
      expect(tokens.sizes[i].rem).toBeGreaterThan(tokens.sizes[i - 1].rem);
    }
  });

  it('scale factor is applied correctly', () => {
    const tokens = computeIconTokens(1, 2, 1.5, false);
    expect(tokens.sizes[2].rem).toBe(1);      // md
    expect(tokens.sizes[3].rem).toBe(2);      // lg = md * 2
    expect(tokens.sizes[4].rem).toBe(4);      // xl = lg * 2
    expect(tokens.sizes[5].rem).toBe(8);      // 2xl = xl * 2
    expect(tokens.sizes[1].rem).toBe(0.5);    // sm = md / 2
    expect(tokens.sizes[0].rem).toBe(0.25);   // xs = sm / 2
  });

  it('px values are rounded integers', () => {
    const tokens = computeIconTokens(1.25, 1.25, 1.5, false);
    tokens.sizes.forEach((s) => {
      expect(Number.isInteger(s.px)).toBe(true);
    });
  });

  it('includes stroke width', () => {
    const tokens = computeIconTokens(1.25, 1.25, 2, false);
    expect(tokens.strokeWidth).toBe(2);
  });
});

describe('weightToStroke', () => {
  it('maps thin to 1px', () => {
    expect(weightToStroke('thin')).toBe(1);
  });

  it('maps regular to 1.5px', () => {
    expect(weightToStroke('regular')).toBe(1.5);
  });

  it('maps bold to 2px', () => {
    expect(weightToStroke('bold')).toBe(2);
  });
});
