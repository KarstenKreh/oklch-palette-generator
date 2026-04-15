import { describe, it, expect } from 'vitest';
import { encodeState, decodeState, type ShapeUrlState } from './shape';

function makeState(overrides: Partial<ShapeUrlState> = {}): ShapeUrlState {
  return {
    shapeStyle: 'paper',
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
    glassDepth: 1.2,
    glassBlur: 0.5,
    glassDispersion: 0.5,
    ringWidth: 2,
    ringOffset: 2,
    ringColorMode: 'auto',
    ringCustomColor: '#000000',
    separationMode: 'shadow',
    shadowOffsetX: 2,
    shadowOffsetY: 4,
    brutalistVariant: 'outlined',
    ...overrides,
  };
}

describe('encodeState / decodeState round-trip', () => {
  it('round-trips default state', () => {
    const state = makeState();
    const encoded = encodeState(state);
    const decoded = decodeState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.shapeStyle).toBe('paper');
    expect(decoded!.shadowEnabled).toBe(true);
    expect(decoded!.shadowType).toBe('normal');
    expect(decoded!.shadowStrength).toBeCloseTo(1.0);
    expect(decoded!.shadowBlurScale).toBeCloseTo(1.0);
    expect(decoded!.shadowScale).toBeCloseTo(1.272);
    expect(decoded!.borderEnabled).toBe(true);
    expect(decoded!.borderWidth).toBeCloseTo(1);
    expect(decoded!.borderRadius).toBe(8);
    expect(decoded!.glassDepth).toBeCloseTo(1.2);
    expect(decoded!.glassBlur).toBeCloseTo(0.5);
    expect(decoded!.glassDispersion).toBeCloseTo(0.5);
    expect(decoded!.ringWidth).toBe(2);
    expect(decoded!.ringOffset).toBe(2);
    expect(decoded!.separationMode).toBe('shadow');
  });

  it('round-trips glass style', () => {
    const state = makeState({ shapeStyle: 'glass' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shapeStyle).toBe('glass');
  });

  it('round-trips neomorph style', () => {
    const state = makeState({ shapeStyle: 'neomorph' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shapeStyle).toBe('neomorph');
  });

  it('round-trips neobrutalism style with offsets and variant', () => {
    const state = makeState({
      shapeStyle: 'neobrutalism',
      shadowOffsetX: -3,
      shadowOffsetY: 5,
      brutalistVariant: 'solid',
    });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shapeStyle).toBe('neobrutalism');
    expect(decoded!.shadowOffsetX).toBe(-3);
    expect(decoded!.shadowOffsetY).toBe(5);
    expect(decoded!.brutalistVariant).toBe('solid');
  });

  it('round-trips flat shadow type', () => {
    const state = makeState({ shadowType: 'flat' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shadowType).toBe('flat');
  });

  it('migrates legacy shadowType="neumorphic" to shapeStyle="neomorph"', () => {
    // Build a legacy hash by forcing 'neumorphic' into the shadowType slot.
    const parts = encodeState(makeState()).split(',');
    parts[2] = 'neumorphic';
    const decoded = decodeState(parts.join(','));
    expect(decoded).not.toBeNull();
    expect(decoded!.shapeStyle).toBe('neomorph');
    expect(decoded!.shadowType).toBe('normal');
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
    });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shadowEnabled).toBe(false);
    expect(decoded!.borderEnabled).toBe(false);
  });

  it('round-trips glass parameters', () => {
    const state = makeState({
      shapeStyle: 'glass',
      glassDepth: -1.5,
      glassBlur: 3.0,
      glassDispersion: 2.0,
    });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.shapeStyle).toBe('glass');
    expect(decoded!.glassDepth).toBeCloseTo(-1.5);
    expect(decoded!.glassBlur).toBeCloseTo(3.0);
    expect(decoded!.glassDispersion).toBeCloseTo(2.0);
  });
});

describe('decodeState edge cases', () => {
  it('returns null for too few fields (< 21)', () => {
    expect(decodeState('paper,1,normal,100,100,1272,a,,1,10,a,,8')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(decodeState('')).toBeNull();
  });

  it('encodeState produces exactly 24 comma-separated fields', () => {
    const state = makeState();
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts).toHaveLength(24);
  });

  it('validates shape style against allowed set', () => {
    const encoded = encodeState(makeState());
    const parts = encoded.split(',');
    parts[0] = 'invalidstyle';
    const decoded = decodeState(parts.join(','));
    expect(decoded).not.toBeNull();
    expect(decoded!.shapeStyle).toBeUndefined();
  });

  it('validates shadow type against allowed set', () => {
    const encoded = encodeState(makeState());
    const parts = encoded.split(',');
    parts[2] = 'invalidtype';
    const decoded = decodeState(parts.join(','));
    expect(decoded).not.toBeNull();
    expect(decoded!.shadowType).toBeUndefined();
  });

  it('validates separation mode against allowed set', () => {
    const encoded = encodeState(makeState());
    const parts = encoded.split(',');
    parts[20] = 'invalidmode';
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
    expect(parts[3]).toBe('75');
  });

  it('borderWidth is encoded as width * 10', () => {
    const state = makeState({ borderWidth: 1.5 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[9]).toBe('15');
  });

  it('shadowScale is encoded as scale * 1000', () => {
    const state = makeState({ shadowScale: 1.272 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[5]).toBe('1272');
  });

  it('glassDepth is encoded as depth * 10', () => {
    const state = makeState({ glassDepth: 1.2 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[13]).toBe('12');
  });

  it('glassBlur is encoded as blur * 10', () => {
    const state = makeState({ glassBlur: 0.5 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[14]).toBe('5');
  });

  it('glassDispersion is encoded as dispersion * 10', () => {
    const state = makeState({ glassDispersion: 0.5 });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[15]).toBe('5');
  });

  it('shapeStyle is encoded as first field', () => {
    const state = makeState({ shapeStyle: 'glass' });
    const encoded = encodeState(state);
    const parts = encoded.split(',');
    expect(parts[0]).toBe('glass');
  });
});
