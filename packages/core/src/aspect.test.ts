import { describe, it, expect } from 'vitest';
import { DEFAULT_ASPECT_RATIOS, formatAspect, aspectValue, reciprocal, expandAndSortAspects } from './aspect';

describe('DEFAULT_ASPECT_RATIOS', () => {
  it('includes square, video, and golden', () => {
    const names = DEFAULT_ASPECT_RATIOS.map((a) => a.name);
    expect(names).toContain('square');
    expect(names).toContain('video');
    expect(names).toContain('golden');
  });

  it('golden is 1.618:1', () => {
    const golden = DEFAULT_ASPECT_RATIOS.find((a) => a.name === 'golden');
    expect(golden).toBeDefined();
    expect(golden!.w).toBeCloseTo(1.618, 3);
    expect(golden!.h).toBe(1);
  });
});

describe('formatAspect', () => {
  it('formats integer ratios without decimals', () => {
    expect(formatAspect({ name: 'video', w: 16, h: 9 })).toBe('16 / 9');
    expect(formatAspect({ name: 'square', w: 1, h: 1 })).toBe('1 / 1');
  });

  it('formats decimal ratios with trimmed zeros', () => {
    expect(formatAspect({ name: 'golden', w: 1.618, h: 1 })).toBe('1.618 / 1');
  });
});

describe('aspectValue', () => {
  it('returns w/h', () => {
    expect(aspectValue({ name: 'video', w: 16, h: 9 })).toBeCloseTo(16 / 9, 5);
    expect(aspectValue({ name: 'square', w: 1, h: 1 })).toBe(1);
  });

  it('returns 0 for zero height to avoid division error', () => {
    expect(aspectValue({ name: 'bad', w: 1, h: 0 })).toBe(0);
  });
});

describe('reciprocal', () => {
  it('swaps w and h', () => {
    expect(reciprocal({ name: 'video', w: 16, h: 9 })).toEqual({
      name: 'video-portrait', w: 9, h: 16,
    });
  });
});

describe('expandAndSortAspects', () => {
  it('returns only landscape when reciprocals off, sorted widest-first', () => {
    const input = [
      { name: 'square', w: 1, h: 1 },
      { name: 'video', w: 16, h: 9 },
      { name: 'ultrawide', w: 21, h: 9 },
    ];
    const out = expandAndSortAspects(input, false);
    expect(out.map((a) => a.name)).toEqual(['ultrawide', 'video', 'square']);
  });

  it('expands with portrait variants and sorts widest-first', () => {
    const input = [
      { name: 'square', w: 1, h: 1 },
      { name: 'video', w: 16, h: 9 },
    ];
    const out = expandAndSortAspects(input, true);
    expect(out.map((a) => a.name)).toEqual(['video', 'square', 'video-portrait']);
  });

  it('never duplicates squares (1:1 has no portrait)', () => {
    const out = expandAndSortAspects([{ name: 'square', w: 1, h: 1 }], true);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('square');
  });
});
