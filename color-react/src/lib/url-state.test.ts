import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from './url-state';

function makeState(overrides: Record<string, unknown> = {}) {
  return {
    brandHex: '#335A7F',
    bgColorHex: '#335A7F',
    bgAutoMatch: true,
    errorColorHex: '#CC3333',
    errorAutoMatch: true,
    chromaScale: 0.25,
    currentMode: 'balanced' as const,
    brandPin: false,
    brandInvert: false,
    errorPin: false,
    errorInvert: false,
    fgContrastMode: 'best' as const,
    themeName: 'Standby.Design',
    extraAccents: [],
    ...overrides,
  };
}

describe('encodeState / decodeState round-trip', () => {
  it('round-trips default state', () => {
    const state = makeState();
    const encoded = encodeState(state);
    const decoded = decodeState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.brandHex).toBe('#335A7F');
    expect(decoded!.bgColorHex).toBe('#335A7F');
    expect(decoded!.bgAutoMatch).toBe(true);
    expect(decoded!.errorColorHex).toBe('#CC3333');
    expect(decoded!.chromaScale).toBe(0.25);
    expect(decoded!.currentMode).toBe('balanced');
    expect(decoded!.themeName).toBe('Standby.Design');
  });

  it('round-trips exact mode', () => {
    const state = makeState({ currentMode: 'exact' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.currentMode).toBe('exact');
  });

  it('round-trips brandInvert and errorInvert', () => {
    const state = makeState({ brandInvert: true, errorInvert: true });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.brandInvert).toBe(true);
    expect(decoded!.errorInvert).toBe(true);
  });

  it('round-trips fgContrastMode preferDark', () => {
    const state = makeState({ fgContrastMode: 'preferDark' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.fgContrastMode).toBe('preferDark');
  });

  it('round-trips extraAccents', () => {
    const state = makeState({
      extraAccents: [
        { name: 'Success', hex: '#00FF00', pin: false, invert: false, autoMatch: true, autoHue: 145 },
        { name: 'Warning', hex: '#FFAA00', pin: true, invert: true, autoMatch: false, autoHue: 85 },
      ],
    });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.extraAccents).toHaveLength(2);
    expect(decoded!.extraAccents[0].name).toBe('Success');
    expect(decoded!.extraAccents[0].autoMatch).toBe(true);
    expect(decoded!.extraAccents[1].pin).toBe(true);
    expect(decoded!.extraAccents[1].invert).toBe(true);
  });
});

describe('decodeState edge cases', () => {
  it('returns null for empty string', () => {
    expect(decodeState('')).toBeNull();
  });

  it('returns null for too few fields', () => {
    expect(decodeState('335A7F,335A7F,1')).toBeNull();
  });

  it('returns null for invalid hex brand', () => {
    expect(decodeState('ZZZZZZ,335A7F,1,CC3333,1,25,balanced')).toBeNull();
  });

  it('defaults invalid mode to balanced', () => {
    const decoded = decodeState('335A7F,335A7F,1,CC3333,1,25,invalidmode');
    expect(decoded!.currentMode).toBe('balanced');
  });

  it('defaults invalid chroma to 0.25', () => {
    const decoded = decodeState('335A7F,335A7F,1,CC3333,1,NaN,balanced');
    expect(decoded!.chromaScale).toBe(0.25);
  });

  it('defaults missing fgContrastMode to best', () => {
    const decoded = decodeState('335A7F,335A7F,1,CC3333,1,25,balanced,0,0');
    expect(decoded!.fgContrastMode).toBe('best');
  });

  it('defaults brandInvert/errorInvert to false for v1 URLs', () => {
    const decoded = decodeState('335A7F,335A7F,1,CC3333,1,25,balanced,0,0,best,TestTheme');
    expect(decoded!.brandInvert).toBe(false);
    expect(decoded!.errorInvert).toBe(false);
  });

  it('defaults invalid bg hex to brand hex', () => {
    const decoded = decodeState('335A7F,INVALID,1,CC3333,1,25,balanced');
    expect(decoded!.bgColorHex).toBe('#335A7F');
  });

  it('defaults invalid error hex to #CC3333', () => {
    const decoded = decodeState('335A7F,335A7F,1,ZZZZZZ,1,25,balanced');
    expect(decoded!.errorColorHex).toBe('#CC3333');
  });
});

describe('theme name with special characters', () => {
  it('round-trips name with & character', () => {
    const state = makeState({ themeName: 'Brand & Co' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.themeName).toBe('Brand & Co');
  });

  it('round-trips name with = character', () => {
    const state = makeState({ themeName: 'A=B' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.themeName).toBe('A=B');
  });

  it('round-trips name with # character', () => {
    const state = makeState({ themeName: 'Color #1' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.themeName).toBe('Color #1');
  });
});
