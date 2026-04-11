import { describe, it, expect } from 'vitest';
import { generateShadowValues } from './shadows';

describe('generateShadowValues', () => {
  it('returns 5 levels', () => {
    const values = generateShadowValues('#F8F8F8', false);
    expect(values).toHaveLength(5);
  });

  it('levels are named xs, sm, md, lg, xl', () => {
    const values = generateShadowValues('#F8F8F8', false);
    const names = values.map((v) => v.name);
    expect(names).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  });

  it('all shadows are valid CSS shadow strings', () => {
    const values = generateShadowValues('#F8F8F8', false);
    for (const { shadow } of values) {
      expect(shadow).toContain('oklch(');
      expect(shadow).toContain('rem');
      // Two-layer shadow (separated by comma + space)
      const layers = shadow.split(', 0 ');
      expect(layers.length).toBe(2);
    }
  });

  it('dark mode produces higher alpha values than light mode', () => {
    const light = generateShadowValues('#F8F8F8', false);
    const dark = generateShadowValues('#1A1A1A', true);
    // Compare the alpha values of the md level
    const lightAlphas = light[2].shadow.match(/\/ ([\d.]+)/g)!;
    const darkAlphas = dark[2].shadow.match(/\/ ([\d.]+)/g)!;
    const lightAlpha1 = parseFloat(lightAlphas[0].replace('/ ', ''));
    const darkAlpha1 = parseFloat(darkAlphas[0].replace('/ ', ''));
    expect(darkAlpha1).toBeGreaterThan(lightAlpha1);
  });

  it('works with brand color', () => {
    const values = generateShadowValues('#335A7F', false);
    expect(values).toHaveLength(5);
    for (const { shadow } of values) {
      expect(shadow.length).toBeGreaterThan(0);
    }
  });
});
