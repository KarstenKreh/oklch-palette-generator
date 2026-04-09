import { describe, it, expect } from 'vitest';
import { generateCssExport, generateTailwindV4Export } from './code-export';
import { customScale } from './scale';
import { computeSpacingTokens } from './spacing';

function makeOpts() {
  const levels = customScale(1.0, 1.272);
  const spacingTokens = computeSpacingTokens(levels);
  return {
    levels,
    spacingTokens,
    headingFont: 'satoshi',
    bodyFont: 'satoshi',
    monoFont: 'system-mono',
    scaleLabel: 'Custom — 1.272',
  };
}

describe('generateCssExport', () => {
  it('contains :root block', () => {
    const output = generateCssExport(makeOpts());
    expect(output).toContain(':root {');
  });

  it('contains font family tokens', () => {
    const output = generateCssExport(makeOpts());
    expect(output).toContain('--font-heading');
    expect(output).toContain('--font-body');
    expect(output).toContain('--font-mono');
  });

  it('contains type scale tokens', () => {
    const output = generateCssExport(makeOpts());
    expect(output).toContain('--text-display');
    expect(output).toContain('--text-h1');
    expect(output).toContain('--text-body-m');
    expect(output).toContain('--text-caption');
  });

  it('contains line height tokens', () => {
    const output = generateCssExport(makeOpts());
    expect(output).toContain('--leading-display');
    expect(output).toContain('--leading-body-m');
  });

  it('contains letter spacing tokens', () => {
    const output = generateCssExport(makeOpts());
    expect(output).toContain('--tracking-display');
  });

  it('contains spacing tokens', () => {
    const output = generateCssExport(makeOpts());
    expect(output).toContain('--space-sm');
    expect(output).toContain('--space-3xl');
  });

  it('snapshot stability', () => {
    const output = generateCssExport(makeOpts());
    expect(output).toMatchSnapshot();
  });
});

describe('generateTailwindV4Export', () => {
  it('contains @theme block', () => {
    const output = generateTailwindV4Export(makeOpts());
    expect(output).toContain('@theme {');
  });

  it('does not contain :root', () => {
    const output = generateTailwindV4Export(makeOpts());
    expect(output).not.toContain(':root');
  });

  it('contains same tokens as CSS export', () => {
    const output = generateTailwindV4Export(makeOpts());
    expect(output).toContain('--text-display');
    expect(output).toContain('--font-heading');
    expect(output).toContain('--leading-display');
    expect(output).toContain('--tracking-display');
    expect(output).toContain('--space-sm');
  });

  it('snapshot stability', () => {
    const output = generateTailwindV4Export(makeOpts());
    expect(output).toMatchSnapshot();
  });
});
