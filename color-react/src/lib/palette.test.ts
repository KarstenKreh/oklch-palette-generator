import { describe, it, expect } from 'vitest';
import {
  generatePalette,
  computeAutoErrorHex,
  computeAutoAccentHex,
  STEPS,
} from './palette';
import { hexToOklch } from './color-math';

describe('generatePalette', () => {
  it('returns 18 entries', () => {
    const palette = generatePalette('#335A7F');
    expect(palette).toHaveLength(18);
  });

  it('steps match STEPS constant', () => {
    const palette = generatePalette('#335A7F');
    const steps = palette.map((e) => e.step);
    expect(steps).toEqual([...STEPS]);
  });

  it('all hex values are valid 7-character strings', () => {
    const palette = generatePalette('#335A7F');
    for (const entry of palette) {
      expect(entry.hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('lightness falls monotonically from step 25 to step 975', () => {
    const palette = generatePalette('#335A7F');
    for (let i = 1; i < palette.length; i++) {
      expect(palette[i].L).toBeLessThanOrEqual(palette[i - 1].L);
    }
  });

  it('chromaScale 0 produces zero chroma (neutral palette)', () => {
    const palette = generatePalette('#335A7F', 0);
    for (const entry of palette) {
      expect(entry.C).toBeCloseTo(0, 4);
    }
  });

  it('balanced mode uses L=0.50 at step 500', () => {
    const palette = generatePalette('#335A7F', 1.0, 'balanced');
    const step500 = palette.find((e) => e.step === 500)!;
    expect(step500.L).toBeCloseTo(0.5, 2);
  });

  it('exact mode uses input color lightness at step 500', () => {
    const [inputL] = hexToOklch('#335A7F');
    const palette = generatePalette('#335A7F', 1.0, 'exact');
    const step500 = palette.find((e) => e.step === 500)!;
    expect(step500.L).toBeCloseTo(inputL, 2);
  });

  it('all entries have css property', () => {
    const palette = generatePalette('#335A7F');
    for (const entry of palette) {
      expect(entry.css).toContain('oklch(');
    }
  });

  it('works with pure red', () => {
    const palette = generatePalette('#FF0000');
    expect(palette).toHaveLength(18);
  });

  it('works with black', () => {
    const palette = generatePalette('#000000');
    expect(palette).toHaveLength(18);
  });

  it('works with white', () => {
    const palette = generatePalette('#FFFFFF');
    expect(palette).toHaveLength(18);
  });
});

describe('computeAutoErrorHex', () => {
  it('returns valid hex', () => {
    const result = computeAutoErrorHex('#335A7F');
    expect(result).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('computeAutoAccentHex', () => {
  it('returns valid hex for success hue', () => {
    const result = computeAutoAccentHex('#335A7F', 145);
    expect(result).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('returns valid hex for warning hue', () => {
    const result = computeAutoAccentHex('#335A7F', 85);
    expect(result).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('returns valid hex for info hue', () => {
    const result = computeAutoAccentHex('#335A7F', 255);
    expect(result).toMatch(/^#[0-9A-F]{6}$/);
  });
});
