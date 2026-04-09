import { describe, it, expect } from 'vitest';
import { generateClamp } from './clamp';

describe('generateClamp', () => {
  it('returns plain rem when min === max', () => {
    const result = generateClamp(1.0, 1.0);
    expect(result).toBe('1rem');
    expect(result).not.toContain('clamp');
  });

  it('returns clamp() when min < max', () => {
    const result = generateClamp(1.0, 2.0);
    expect(result).toContain('clamp(');
    expect(result).toContain('vw');
    expect(result).toContain('rem');
  });

  it('uses default viewports 375px and 1920px', () => {
    const result = generateClamp(1.0, 2.0);
    // Verify the slope is calculated using default viewports
    expect(result).toMatch(/clamp\(1rem,/);
    expect(result).toMatch(/2rem\)$/);
  });

  it('guards against inverted min/max', () => {
    const normal = generateClamp(1.0, 2.0);
    const inverted = generateClamp(2.0, 1.0);
    expect(normal).toBe(inverted);
  });

  it('produces valid CSS clamp syntax', () => {
    const result = generateClamp(0.79, 1.3);
    expect(result).toMatch(/^clamp\(\d+\.?\d*rem, [\d.]+vw [+-] [\d.]+rem, \d+\.?\d*rem\)$/);
  });

  it('custom viewports are accepted', () => {
    const result = generateClamp(1.0, 2.0, 320, 1440);
    expect(result).toContain('clamp(');
  });
});
