import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from './url-state';
import type { ShapeState } from '@/store/shape-store';

function makeState(overrides: Partial<ShapeState> = {}): ShapeState {
  return {
    shadowEnabled: true,
    shadowType: 'normal',
    shadowStrength: 1.0,
    shadowBlurScale: 1.0,
    shadowScale: 1.272,
    shadowColorMode: 'auto',
    shadowCustomColor: '#000000',
    borderEnabled: true,
    borderWidth: 1,
    borderColorMode: 'auto',
    borderCustomColor: '#000000',
    borderRadius: 8,
    glassEnabled: false,
    glassBlur: 12,
    glassOpacity: 0.8,
    ringWidth: 2,
    ringOffset: 2,
    ringColorMode: 'auto',
    ringCustomColor: '#000000',
    separationMode: 'shadow',
    surfaceHex: '#335A7F',
    // Stubs for setter functions — not used in encode/decode
    setShadowEnabled: () => {},
    setShadowType: () => {},
    setShadowStrength: () => {},
    setShadowBlurScale: () => {},
    setShadowScale: () => {},
    setShadowColorMode: () => {},
    setShadowCustomColor: () => {},
    setBorderEnabled: () => {},
    setBorderWidth: () => {},
    setBorderColorMode: () => {},
    setBorderCustomColor: () => {},
    setBorderRadius: () => {},
    setGlassEnabled: () => {},
    setGlassBlur: () => {},
    setGlassOpacity: () => {},
    setRingWidth: () => {},
    setRingOffset: () => {},
    setRingColorMode: () => {},
    setRingCustomColor: () => {},
    setSeparationMode: () => {},
    setSurfaceHex: () => {},
    setFullState: () => {},
    ...overrides,
  } as ShapeState;
}

describe('encodeState / decodeState round-trip', () => {
  it('round-trips default state', () => {
    const state = makeState();
    const encoded = encodeState(state);
    const decoded = decodeState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.shadowEnabled).toBe(true);
    expect(decoded!.shadowType).toBe('normal');
    expect(decoded!.shadowStrength).toBeCloseTo(1.0);
    expect(decoded!.shadowBlurScale).toBeCloseTo(1.0);
    expect(decoded!.shadowScale).toBeCloseTo(1.272);
    expect(decoded!.borderEnabled).toBe(true);
    expect(decoded!.borderWidth).toBeCloseTo(1);
    expect(decoded!.borderRadius).toBe(8);
    expect(decoded!.glassEnabled).toBe(false);
    expect(decoded!.glassBlur).toBe(12);
    expect(decoded!.glassOpacity).toBeCloseTo(0.8);
    expect(decoded!.ringWidth).toBe(2);
    expect(decoded!.ringOffset).toBe(2);
    expect(decoded!.separationMode).toBe('shadow');
  });

  it('round-trips neumorphic shadow type', () => {
    const state = makeState({ shadowType: 'neumorphic' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shadowType).toBe('neumorphic');
  });

  it('round-trips flat shadow type', () => {
    const state = makeState({ shadowType: 'flat' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shadowType).toBe('flat');
  });

  it('round-trips custom color modes', () => {
    const state = makeState({
      shadowColorMode: 'custom',
      shadowCustomColor: '#FF0000',
      borderColorMode: 'custom',
      borderCustomColor: '#00FF00',
      ringColorMode: 'custom',
      ringCustomColor: '#0000FF',
    });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shadowColorMode).toBe('custom');
    expect(decoded!.shadowCustomColor).toBe('#FF0000');
    expect(decoded!.borderColorMode).toBe('custom');
    expect(decoded!.borderCustomColor).toBe('#00FF00');
    expect(decoded!.ringColorMode).toBe('custom');
    expect(decoded!.ringCustomColor).toBe('#0000FF');
  });

  it('round-trips all separation modes', () => {
    const modes = ['shadow', 'border', 'contrast', 'gap', 'mixed'] as const;
    for (const mode of modes) {
      const state = makeState({ separationMode: mode });
      const decoded = decodeState(encodeState(state));
      expect(decoded!.separationMode).toBe(mode);
    }
  });

  it('round-trips disabled features', () => {
    const state = makeState({
      shadowEnabled: false,
      borderEnabled: false,
      glassEnabled: true,
    });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shadowEnabled).toBe(false);
    expect(decoded!.borderEnabled).toBe(false);
    expect(decoded!.glassEnabled).toBe(true);
  });
});

describe('decodeState edge cases', () => {
  it('returns null for too few fields (< 20)', () => {
    expect(decodeState('1,normal,100,100,1272,a,,1,10,a,,8')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(decodeState('')).toBeNull();
  });

  it('encodeState produces exactly 20 comma-separated fields', () => {
    const state = makeState();
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts).toHaveLength(20);
  });

  it('validates shadow type against allowed set', () => {
    const encoded = encodeState(makeState());
    // Replace shadow type with invalid value
    const parts = encoded.split(',');
    parts[1] = 'invalidtype';
    const decoded = decodeState(parts.join(','));
    expect(decoded).not.toBeNull();
    expect(decoded!.shadowType).toBeUndefined();
  });

  it('validates separation mode against allowed set', () => {
    const encoded = encodeState(makeState());
    const parts = encoded.split(',');
    parts[19] = 'invalidmode';
    const decoded = decodeState(parts.join(','));
    expect(decoded).not.toBeNull();
    expect(decoded!.separationMode).toBeUndefined();
  });
});

describe('scaling factors', () => {
  it('strength is encoded as strength * 100', () => {
    const state = makeState({ shadowStrength: 0.75 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[2]).toBe('75');
  });

  it('borderWidth is encoded as width * 10', () => {
    const state = makeState({ borderWidth: 1.5 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[8]).toBe('15');
  });

  it('shadowScale is encoded as scale * 1000', () => {
    const state = makeState({ shadowScale: 1.272 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[4]).toBe('1272');
  });

  it('glassOpacity is encoded as opacity * 100', () => {
    const state = makeState({ glassOpacity: 0.6 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[14]).toBe('60');
  });
});
