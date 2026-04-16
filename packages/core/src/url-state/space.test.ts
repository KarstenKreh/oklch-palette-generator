import { describe, it, expect } from 'vitest';
import { encodeState, decodeState, DEFAULT_SPACE_URL_STATE, type SpaceUrlState } from './space';

describe('space url-state — defaults', () => {
  it('encodes defaults to compact 5-field head only', () => {
    const encoded = encodeState(DEFAULT_SPACE_URL_STATE);
    expect(encoded).toBe('harmonic,1000,1272,100,1');
    expect(encoded).not.toContain('|');
  });

  it('decodes default encoding back to default values', () => {
    const encoded = encodeState(DEFAULT_SPACE_URL_STATE);
    const decoded = decodeState(encoded);
    expect(decoded?.spacingMode).toBe('harmonic');
    expect(decoded?.spacingBaseRem).toBe(1.0);
    expect(decoded?.spacingRatio).toBe(1.272);
    expect(decoded?.spacingMultiplier).toBe(1.0);
    expect(decoded?.spacingSnap).toBe(true);
  });
});

describe('space url-state — spacing variations', () => {
  it('round-trips geometric mode', () => {
    const state: SpaceUrlState = { ...DEFAULT_SPACE_URL_STATE, spacingMode: 'geometric' };
    const decoded = decodeState(encodeState(state));
    expect(decoded?.spacingMode).toBe('geometric');
  });

  it('round-trips custom ratio', () => {
    const state: SpaceUrlState = { ...DEFAULT_SPACE_URL_STATE, spacingRatio: 1.414 };
    const decoded = decodeState(encodeState(state));
    expect(decoded?.spacingRatio).toBe(1.414);
  });

  it('round-trips snap=false', () => {
    const state: SpaceUrlState = { ...DEFAULT_SPACE_URL_STATE, spacingSnap: false };
    const decoded = decodeState(encodeState(state));
    expect(decoded?.spacingSnap).toBe(false);
  });
});

describe('space url-state — extended sections', () => {
  it('omits breakpoints when default', () => {
    const encoded = encodeState(DEFAULT_SPACE_URL_STATE);
    expect(encoded).not.toContain('bp=');
  });

  it('emits bp= when breakpoints differ from default', () => {
    const state: SpaceUrlState = {
      ...DEFAULT_SPACE_URL_STATE,
      breakpoints: [{ name: 'sm', minPx: 600 }, { name: 'lg', minPx: 1200 }],
    };
    const encoded = encodeState(state);
    expect(encoded).toContain('bp=sm:600;lg:1200');
    const decoded = decodeState(encoded);
    expect(decoded?.breakpoints).toEqual([
      { name: 'sm', minPx: 600 },
      { name: 'lg', minPx: 1200 },
    ]);
  });

  it('emits fvw= when fluid viewport anchors differ', () => {
    const state: SpaceUrlState = { ...DEFAULT_SPACE_URL_STATE, fluidMinVw: 320, fluidMaxVw: 1440 };
    const encoded = encodeState(state);
    expect(encoded).toContain('fvw=320,1440');
    const decoded = decodeState(encoded);
    expect(decoded?.fluidMinVw).toBe(320);
    expect(decoded?.fluidMaxVw).toBe(1440);
  });

  it('emits ct= when containers differ', () => {
    const state: SpaceUrlState = {
      ...DEFAULT_SPACE_URL_STATE,
      containers: [{ name: 'narrow', maxPx: 800 }],
    };
    const encoded = encodeState(state);
    expect(encoded).toContain('ct=narrow:800');
    const decoded = decodeState(encoded);
    expect(decoded?.containers).toEqual([{ name: 'narrow', maxPx: 800 }]);
  });

  it('emits pch= when prose column differs', () => {
    const state: SpaceUrlState = { ...DEFAULT_SPACE_URL_STATE, proseMaxCh: 80 };
    const encoded = encodeState(state);
    expect(encoded).toContain('pch=80');
    const decoded = decodeState(encoded);
    expect(decoded?.proseMaxCh).toBe(80);
  });

  it('emits arr=0 when include reciprocals is explicitly disabled', () => {
    const state: SpaceUrlState = { ...DEFAULT_SPACE_URL_STATE, aspectIncludeReciprocals: false };
    const encoded = encodeState(state);
    expect(encoded).toContain('arr=0');
    const decoded = decodeState(encoded);
    expect(decoded?.aspectIncludeReciprocals).toBe(false);
  });

  it('omits arr= when include reciprocals is default (true)', () => {
    const state: SpaceUrlState = { ...DEFAULT_SPACE_URL_STATE, aspectIncludeReciprocals: true };
    const encoded = encodeState(state);
    expect(encoded).not.toContain('arr=');
  });

  it('round-trips custom aspect ratios including golden', () => {
    const state: SpaceUrlState = {
      ...DEFAULT_SPACE_URL_STATE,
      aspectRatios: [
        { name: 'square', w: 1, h: 1 },
        { name: 'golden', w: 1.618, h: 1 },
      ],
    };
    const encoded = encodeState(state);
    expect(encoded).toContain('ar=');
    const decoded = decodeState(encoded);
    expect(decoded?.aspectRatios).toHaveLength(2);
    expect(decoded?.aspectRatios?.[0]).toEqual({ name: 'square', w: 1, h: 1 });
    expect(decoded?.aspectRatios?.[1].name).toBe('golden');
    expect(decoded?.aspectRatios?.[1].w).toBeCloseTo(1.618, 3);
  });
});

describe('space url-state — robustness', () => {
  it('returns null for empty string', () => {
    expect(decodeState('')).toBeNull();
  });

  it('returns null for head with fewer than 5 fields', () => {
    expect(decodeState('harmonic,1000,1272')).toBeNull();
  });

  it('ignores unknown extended keys', () => {
    const decoded = decodeState('harmonic,1000,1272,100,1|unknown=xyz');
    expect(decoded?.spacingMode).toBe('harmonic');
  });

  it('tolerates malformed bp entries', () => {
    const decoded = decodeState('harmonic,1000,1272,100,1|bp=sm:notanumber;md:768');
    expect(decoded?.breakpoints).toEqual([{ name: 'md', minPx: 768 }]);
  });
});
