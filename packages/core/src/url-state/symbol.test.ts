import { describe, it, expect } from 'vitest';
import { encodeState, decodeState, type UrlState } from './symbol';

const DEFAULT_STATE: UrlState = {
  preferredStyle: 'auto',
  preferredWeight: 'auto',
  preferredCorners: 'auto',
  iconBaseSize: 1.25,
  iconScale: 1.25,
  snapTo4px: true,
  selectedSet: null,
};

describe('encodeState', () => {
  it('encodes default state', () => {
    const encoded = encodeState(DEFAULT_STATE);
    expect(encoded).toBe('a,a,a,125,1250,1,');
  });

  it('encodes non-default values', () => {
    const state: UrlState = {
      preferredStyle: 'outlined',
      preferredWeight: 'bold',
      preferredCorners: 'sharp',
      iconBaseSize: 1.5,
      iconScale: 1.272,
      snapTo4px: false,
      selectedSet: 'lucide',
    };
    const encoded = encodeState(state);
    expect(encoded).toBe('o,b,s,150,1272,0,lucide');
  });
});

describe('decodeState', () => {
  it('decodes default state', () => {
    const decoded = decodeState('a,a,a,125,1250,1,');
    expect(decoded).toEqual(DEFAULT_STATE);
  });

  it('decodes snapTo4px=false', () => {
    const decoded = decodeState('a,a,a,100,1250,0,');
    expect(decoded!.snapTo4px).toBe(false);
  });

  it('decodes with selected set', () => {
    const decoded = decodeState('o,b,s,150,1272,0,lucide');
    expect(decoded).toEqual({
      preferredStyle: 'outlined',
      preferredWeight: 'bold',
      preferredCorners: 'sharp',
      iconBaseSize: 1.5,
      iconScale: 1.272,
      snapTo4px: false,
      selectedSet: 'lucide',
    });
  });

  it('returns null for too few parts', () => {
    expect(decodeState('a,a,a')).toBeNull();
  });
});

describe('round-trip', () => {
  it('encode → decode returns same values', () => {
    const state: UrlState = {
      preferredStyle: 'duotone',
      preferredWeight: 'thin',
      preferredCorners: 'rounded',
      iconBaseSize: 1.0,
      iconScale: 1.5,
      snapTo4px: true,
      selectedSet: 'phosphor-regular',
    };
    const decoded = decodeState(encodeState(state));
    expect(decoded).toEqual(state);
  });

  it('round-trips null selectedSet', () => {
    const decoded = decodeState(encodeState(DEFAULT_STATE));
    expect(decoded!.selectedSet).toBeNull();
  });
});
