import { describe, it, expect } from 'vitest';
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_CONTAINERS,
  sortBreakpoints,
  sortContainers,
  breakpointRatios,
} from './layout';

describe('DEFAULT_BREAKPOINTS', () => {
  it('has 5 breakpoints in Tailwind-compatible order', () => {
    expect(DEFAULT_BREAKPOINTS.map((b) => b.name)).toEqual(['sm', 'md', 'lg', 'xl', '2xl']);
    expect(DEFAULT_BREAKPOINTS.map((b) => b.minPx)).toEqual([640, 768, 1024, 1280, 1536]);
  });

  it('ratios sit inside the empirical 1.20–1.50 corridor', () => {
    const ratios = breakpointRatios(DEFAULT_BREAKPOINTS);
    for (const r of ratios) {
      expect(r).toBeGreaterThanOrEqual(1.19);
      expect(r).toBeLessThanOrEqual(1.5);
    }
  });
});

describe('DEFAULT_CONTAINERS', () => {
  it('has 5 containers with ascending widths', () => {
    expect(DEFAULT_CONTAINERS).toHaveLength(5);
    const sorted = sortContainers(DEFAULT_CONTAINERS);
    expect(sorted.map((c) => c.name)).toEqual(DEFAULT_CONTAINERS.map((c) => c.name));
  });
});

describe('sortBreakpoints', () => {
  it('sorts ascending by minPx', () => {
    const unsorted = [
      { name: 'c', minPx: 900 },
      { name: 'a', minPx: 300 },
      { name: 'b', minPx: 600 },
    ];
    expect(sortBreakpoints(unsorted).map((b) => b.minPx)).toEqual([300, 600, 900]);
  });

  it('does not mutate input', () => {
    const input = [{ name: 'b', minPx: 600 }, { name: 'a', minPx: 300 }];
    sortBreakpoints(input);
    expect(input[0].name).toBe('b');
  });
});

describe('breakpointRatios', () => {
  it('returns empty for single breakpoint', () => {
    expect(breakpointRatios([{ name: 'sm', minPx: 640 }])).toEqual([]);
  });

  it('computes successive ratios', () => {
    const bps = [
      { name: 'a', minPx: 500 },
      { name: 'b', minPx: 1000 },
      { name: 'c', minPx: 1500 },
    ];
    const ratios = breakpointRatios(bps);
    expect(ratios).toEqual([2.0, 1.5]);
  });
});
