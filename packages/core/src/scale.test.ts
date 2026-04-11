import { describe, it, expect } from 'vitest';
import {
  customScale,
  traditionalScale,
  goldenScale,
  TYPE_LEVELS,
  DEFAULT_TRADITIONAL,
  DEFAULT_TRADITIONAL_MOBILE,
  stepDown,
} from './scale';

describe('customScale', () => {
  it('returns 11 levels', () => {
    const levels = customScale(1.0, 1.272);
    expect(levels).toHaveLength(11);
  });

  it('all levels have min/max/clamp', () => {
    const levels = customScale(1.0, 1.272);
    for (const l of levels) {
      expect(l.minRem).toBeGreaterThan(0);
      expect(l.maxRem).toBeGreaterThan(0);
      expect(l.clampValue).toBeTruthy();
    }
  });

  it('larger ratio produces larger display sizes', () => {
    const small = customScale(1.0, 1.125);
    const large = customScale(1.0, 1.5);
    const displaySmall = small.find((l) => l.level === 'display')!;
    const displayLarge = large.find((l) => l.level === 'display')!;
    expect(displayLarge.maxRem).toBeGreaterThan(displaySmall.maxRem);
  });

  it('baseSize scales all values proportionally', () => {
    const base1 = customScale(1.0, 1.272);
    const base2 = customScale(2.0, 1.272);
    for (let i = 0; i < base1.length; i++) {
      expect(base2[i].maxRem).toBeCloseTo(base1[i].maxRem * 2, 2);
    }
  });

  it('level order: display > h1 > h2 > ... > caption (maxRem descending)', () => {
    const levels = customScale(1.0, 1.272);
    const headings = levels.filter((l) => l.isHeading);
    for (let i = 1; i < headings.length; i++) {
      expect(headings[i].maxRem).toBeLessThanOrEqual(headings[i - 1].maxRem);
    }
  });

  it('all levels have correct isHeading flag', () => {
    const levels = customScale(1.0, 1.272);
    for (const l of levels) {
      const expected = l.level === 'display' || l.level.startsWith('h');
      expect(l.isHeading).toBe(expected);
    }
  });

  it('with different mobile ratio, min differs from max', () => {
    const levels = customScale(1.0, 1.5, 1.2);
    const display = levels.find((l) => l.level === 'display')!;
    expect(display.isFluid).toBe(true);
    expect(display.minRem).toBeLessThan(display.maxRem);
  });
});

describe('traditionalScale', () => {
  it('returns 11 levels', () => {
    const levels = traditionalScale(DEFAULT_TRADITIONAL, DEFAULT_TRADITIONAL_MOBILE);
    expect(levels).toHaveLength(11);
  });

  it('uses correct labels', () => {
    const levels = traditionalScale(DEFAULT_TRADITIONAL, DEFAULT_TRADITIONAL_MOBILE);
    expect(levels[0].label).toBe('Display');
    expect(levels[1].label).toBe('H1');
  });

  it('display > h1 > h2 > ... > caption (maxRem descending for headings)', () => {
    const levels = traditionalScale(DEFAULT_TRADITIONAL, DEFAULT_TRADITIONAL_MOBILE);
    const headings = levels.filter((l) => l.isHeading);
    for (let i = 1; i < headings.length; i++) {
      expect(headings[i].maxRem).toBeLessThanOrEqual(headings[i - 1].maxRem);
    }
  });
});

describe('goldenScale', () => {
  it('returns 11 levels', () => {
    const levels = goldenScale(1.0);
    expect(levels).toHaveLength(11);
  });

  it('baseSize scales proportionally', () => {
    const base1 = goldenScale(1.0);
    const base2 = goldenScale(2.0);
    for (let i = 0; i < base1.length; i++) {
      expect(base2[i].maxRem).toBeCloseTo(base1[i].maxRem * 2, 2);
    }
  });

  it('display has the largest maxRem among headings', () => {
    const levels = goldenScale(1.0);
    const display = levels.find((l) => l.level === 'display')!;
    const headings = levels.filter((l) => l.isHeading && l.level !== 'display');
    for (const h of headings) {
      expect(display.maxRem).toBeGreaterThanOrEqual(h.maxRem);
    }
  });
});

describe('stepDown', () => {
  it('steps down from 72 to 48', () => {
    expect(stepDown(72)).toBe(48);
  });

  it('steps down from 16 to 14', () => {
    expect(stepDown(16)).toBe(14);
  });

  it('returns smallest size for 6px', () => {
    expect(stepDown(6)).toBe(6);
  });
});
