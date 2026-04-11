import { describe, it, expect } from 'vitest';
import {
  hexToOklch,
  oklchToHex,
  isInGamut,
  maxChromaInGamut,
  contrastRatio,
  invertHex,
  relativeLuminance,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  srgbToLinear,
  linearToSrgb,
} from './color-math';

describe('hexToOklch / oklchToHex round-trips', () => {
  const KNOWN_COLORS = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#335A7F'];

  for (const hex of KNOWN_COLORS) {
    it(`round-trips ${hex}`, () => {
      const [L, C, H] = hexToOklch(hex);
      const result = oklchToHex(L, C, H);
      // Allow ±1 per channel due to floating point
      const [r1, g1, b1] = hexToRgb(hex);
      const [r2, g2, b2] = hexToRgb(result);
      expect(Math.abs(r1 - r2)).toBeLessThanOrEqual(1);
      expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(1);
      expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(1);
    });
  }

  it('black has L close to 0', () => {
    const [L] = hexToOklch('#000000');
    expect(L).toBeCloseTo(0, 2);
  });

  it('white has L close to 1', () => {
    const [L] = hexToOklch('#FFFFFF');
    expect(L).toBeCloseTo(1, 2);
  });

  it('black has chroma close to 0', () => {
    const [, C] = hexToOklch('#000000');
    expect(C).toBeCloseTo(0, 2);
  });
});

describe('isInGamut', () => {
  it('white is in gamut', () => {
    const [L, C, H] = hexToOklch('#FFFFFF');
    expect(isInGamut(L, C, H)).toBe(true);
  });

  it('black is in gamut', () => {
    const [L, C, H] = hexToOklch('#000000');
    expect(isInGamut(L, C, H)).toBe(true);
  });

  it('#335A7F is in gamut', () => {
    const [L, C, H] = hexToOklch('#335A7F');
    expect(isInGamut(L, C, H)).toBe(true);
  });

  it('extremely high chroma is out of gamut', () => {
    expect(isInGamut(0.5, 0.4, 180)).toBe(false);
  });
});

describe('maxChromaInGamut', () => {
  it('result is always in gamut', () => {
    const testCases = [
      { L: 0.5, H: 0 },
      { L: 0.5, H: 120 },
      { L: 0.5, H: 240 },
      { L: 0.3, H: 30 },
      { L: 0.8, H: 200 },
    ];
    for (const { L, H } of testCases) {
      const maxC = maxChromaInGamut(L, H);
      expect(isInGamut(L, maxC, H)).toBe(true);
      expect(maxC).toBeGreaterThan(0);
    }
  });

  it('white has very low max chroma', () => {
    expect(maxChromaInGamut(1.0, 0)).toBeLessThan(0.01);
  });
});

describe('contrastRatio', () => {
  it('black vs white is 21', () => {
    const ratio = contrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('same color has ratio 1', () => {
    expect(contrastRatio('#335A7F', '#335A7F')).toBeCloseTo(1, 2);
  });

  it('is symmetric', () => {
    const r1 = contrastRatio('#335A7F', '#FFFFFF');
    const r2 = contrastRatio('#FFFFFF', '#335A7F');
    expect(r1).toBeCloseTo(r2, 6);
  });

  it('ratio is always >= 1', () => {
    expect(contrastRatio('#888888', '#999999')).toBeGreaterThanOrEqual(1);
  });
});

describe('invertHex', () => {
  it('inverts lightness (L becomes ~1-L)', () => {
    const [origL] = hexToOklch('#335A7F');
    const inverted = invertHex('#335A7F');
    const [invL] = hexToOklch(inverted);
    expect(invL).toBeCloseTo(1 - origL, 1);
  });

  it('preserves hue', () => {
    const [, , origH] = hexToOklch('#335A7F');
    const inverted = invertHex('#335A7F');
    const [, , invH] = hexToOklch(inverted);
    expect(invH).toBeCloseTo(origH, 0);
  });

  it('returns valid hex', () => {
    const inverted = invertHex('#335A7F');
    expect(inverted).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('relativeLuminance', () => {
  it('white = 1', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 2);
  });

  it('black = 0', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 2);
  });

  it('is between 0 and 1 for any color', () => {
    const lum = relativeLuminance('#335A7F');
    expect(lum).toBeGreaterThanOrEqual(0);
    expect(lum).toBeLessThanOrEqual(1);
  });
});

describe('hexToRgb / rgbToHex', () => {
  it('parses hex correctly', () => {
    expect(hexToRgb('#FF0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00FF00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000FF')).toEqual([0, 0, 255]);
  });

  it('works without # prefix', () => {
    expect(hexToRgb('335A7F')).toEqual([51, 90, 127]);
  });

  it('rgbToHex produces valid output', () => {
    // rgbToHex expects 0-1 range (linear sRGB)
    const hex = rgbToHex(1, 0, 0);
    expect(hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('srgbToLinear / linearToSrgb round-trip', () => {
  it('round-trips 0', () => {
    expect(linearToSrgb(srgbToLinear(0))).toBeCloseTo(0, 5);
  });

  it('round-trips 255', () => {
    expect(linearToSrgb(srgbToLinear(255))).toBeCloseTo(1, 2);
  });

  it('round-trips mid value', () => {
    const linear = srgbToLinear(128);
    const back = linearToSrgb(linear);
    expect(Math.round(back * 255)).toBeCloseTo(128, 0);
  });
});

describe('HSV conversions', () => {
  it('round-trips red', () => {
    const [h, s, v] = rgbToHsv(255, 0, 0);
    const [r, g, b] = hsvToRgb(h, s, v);
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('round-trips white', () => {
    const [h, s, v] = rgbToHsv(255, 255, 255);
    const [r, g, b] = hsvToRgb(h, s, v);
    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
  });

  it('round-trips black', () => {
    const [h, s, v] = rgbToHsv(0, 0, 0);
    const [r, g, b] = hsvToRgb(h, s, v);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });
});

describe('HSL conversions', () => {
  it('round-trips red', () => {
    const [h, s, l] = rgbToHsl(255, 0, 0);
    const [r, g, b] = hslToRgb(h, s, l);
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('round-trips grey', () => {
    const [h, s, l] = rgbToHsl(128, 128, 128);
    const [r, g, b] = hslToRgb(h, s, l);
    expect(r).toBe(128);
    expect(g).toBe(128);
    expect(b).toBe(128);
  });
});
