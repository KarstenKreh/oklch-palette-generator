import { describe, it, expect } from 'vitest';
import { generatePrimitivesOklch, generateSemantic } from './code-export';
import { generatePalette } from '@core/palette';

function makePalettes() {
  const brand = generatePalette('#335A7F');
  const surface = generatePalette('#335A7F', 0.25);
  const error = generatePalette('#CC3333');
  const errorSurface = generatePalette('#CC3333', 0.25);
  const neutral = generatePalette('#335A7F', 0);
  return { brand, surface, error, errorSurface, neutral };
}

describe('generatePrimitivesOklch', () => {
  it('contains :root block', () => {
    const { brand, surface, error, errorSurface, neutral } = makePalettes();
    const output = generatePrimitivesOklch(
      brand, surface, error, errorSurface, neutral,
      [], 0.25, null, 'TestTheme'
    );
    expect(output).toContain(':root {');
  });

  it('contains theme name in header', () => {
    const { brand, surface, error, errorSurface, neutral } = makePalettes();
    const output = generatePrimitivesOklch(
      brand, surface, error, errorSurface, neutral,
      [], 0.25, null, 'TestTheme'
    );
    expect(output).toContain('TestTheme');
  });

  it('contains brand tokens', () => {
    const { brand, surface, error, errorSurface, neutral } = makePalettes();
    const output = generatePrimitivesOklch(
      brand, surface, error, errorSurface, neutral,
      [], 0.25, null, 'TestTheme'
    );
    expect(output).toContain('--color-brand-500');
    expect(output).toContain('oklch(');
  });

  it('contains surface, error, neutral tokens', () => {
    const { brand, surface, error, errorSurface, neutral } = makePalettes();
    const output = generatePrimitivesOklch(
      brand, surface, error, errorSurface, neutral,
      [], 0.25, null, 'TestTheme'
    );
    expect(output).toContain('--color-surface-');
    expect(output).toContain('--color-error-');
    expect(output).toContain('--color-neutral-');
  });

  it('snapshot stability', () => {
    const { brand, surface, error, errorSurface, neutral } = makePalettes();
    const output = generatePrimitivesOklch(
      brand, surface, error, errorSurface, neutral,
      [], 0.25, null, 'TestTheme'
    );
    expect(output).toMatchSnapshot();
  });
});

describe('generateSemantic', () => {
  it('contains :root and .dark blocks', () => {
    const { brand, surface, error, errorSurface } = makePalettes();
    const output = generateSemantic(
      [], brand, error, errorSurface, surface,
      false, null, false,
      false, null, false,
      'best', 'TestTheme'
    );
    expect(output).toContain(':root {');
    expect(output).toContain('.dark {');
  });

  it('contains theme name in header', () => {
    const { brand, surface, error, errorSurface } = makePalettes();
    const output = generateSemantic(
      [], brand, error, errorSurface, surface,
      false, null, false,
      false, null, false,
      'best', 'TestTheme'
    );
    expect(output).toContain('TestTheme');
  });

  it('contains standard semantic tokens', () => {
    const { brand, surface, error, errorSurface } = makePalettes();
    const output = generateSemantic(
      [], brand, error, errorSurface, surface,
      false, null, false,
      false, null, false,
      'best', 'TestTheme'
    );
    expect(output).toContain('--background');
    expect(output).toContain('--foreground');
    expect(output).toContain('--primary');
    expect(output).toContain('--destructive');
    expect(output).toContain('--border');
    expect(output).toContain('--ring');
    expect(output).toContain('--shadow-');
  });

  it('snapshot stability', () => {
    const { brand, surface, error, errorSurface } = makePalettes();
    const output = generateSemantic(
      [], brand, error, errorSurface, surface,
      false, null, false,
      false, null, false,
      'best', 'TestTheme'
    );
    expect(output).toMatchSnapshot();
  });
});
