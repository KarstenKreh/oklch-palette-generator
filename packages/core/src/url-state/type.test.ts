import { describe, it, expect } from 'vitest';
import { encodeState, decodeState, type UrlState } from './type';
import { DEFAULT_TRADITIONAL, DEFAULT_TRADITIONAL_MOBILE } from '../scale';

function makeCustomState(overrides: Partial<UrlState> = {}): UrlState {
  return {
    scaleMode: 'custom',
    baseSize: 1.0,
    customRatio: 1.272,
    mobileRatio: 1.2,
    headingFont: 'satoshi',
    bodyFont: 'satoshi',
    monoFont: 'system-mono',
    headingWeight: 500,
    mobileBaseSize: 1.0,
    mobileRatioMode: 'auto',
    autoShrink: 25,
    lineHeightOverrides: {},
    letterSpacingOverrides: {},
    ...overrides,
  };
}

describe('encodeState / decodeState round-trip', () => {
  it('round-trips custom mode with defaults', () => {
    const state = makeCustomState();
    const decoded = decodeState(encodeState(state));
    expect(decoded).not.toBeNull();
    expect(decoded!.scaleMode).toBe('custom');
    expect(decoded!.baseSize).toBe(1.0);
    expect(decoded!.customRatio).toBe(1.272);
    expect(decoded!.mobileRatio).toBe(1.2);
    expect(decoded!.headingFont).toBe('satoshi');
    expect(decoded!.bodyFont).toBe('satoshi');
    expect(decoded!.monoFont).toBe('system-mono');
    expect(decoded!.headingWeight).toBe(500);
  });

  it('round-trips headingWeight', () => {
    const state = makeCustomState({ headingWeight: 700 });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.headingWeight).toBe(700);
  });

  it('round-trips mobileBaseSize', () => {
    const state = makeCustomState({ mobileBaseSize: 0.875 });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.mobileBaseSize).toBe(0.875);
  });

  it('round-trips mobileRatioMode=custom', () => {
    const state = makeCustomState({ mobileRatioMode: 'custom' });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.mobileRatioMode).toBe('custom');
  });

  it('round-trips autoShrink', () => {
    const state = makeCustomState({ autoShrink: 40 });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.autoShrink).toBe(40);
  });

  it('silently ignores legacy sbm field (moved to /space tool)', () => {
    const decoded = decodeState('custom,1.0,1.272,1.2,satoshi,satoshi,system-mono|sbm=1.5');
    expect(decoded).not.toBeNull();
    // Field is read-and-discarded; URL still decodes cleanly
    expect(decoded!.scaleMode).toBe('custom');
  });

  it('round-trips lineHeightOverrides', () => {
    const state = makeCustomState({ lineHeightOverrides: { h1: 1.1, 'body-m': 1.6 } });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.lineHeightOverrides).toEqual({ h1: 1.1, 'body-m': 1.6 });
  });

  it('round-trips letterSpacingOverrides', () => {
    const state = makeCustomState({ letterSpacingOverrides: { display: -0.05 } });
    const decoded = decodeState(encodeState(state));
    expect(decoded!.letterSpacingOverrides).toEqual({ display: -0.05 });
  });

  it('round-trips traditional mode with assignments', () => {
    const state: UrlState = {
      ...makeCustomState(),
      scaleMode: 'traditional',
      traditionalAssignments: { ...DEFAULT_TRADITIONAL },
      traditionalMobileAssignments: { ...DEFAULT_TRADITIONAL_MOBILE },
    };
    const decoded = decodeState(encodeState(state));
    expect(decoded).not.toBeNull();
    expect(decoded!.scaleMode).toBe('traditional');
    expect(decoded!.traditionalAssignments).toBeDefined();
    expect(decoded!.traditionalAssignments!.display).toBe(72);
    expect(decoded!.traditionalAssignments!.h1).toBe(48);
    expect(decoded!.traditionalMobileAssignments).toBeDefined();
  });

  it('omits extended keys when all defaults', () => {
    const state = makeCustomState();
    const encoded = encodeState(state);
    expect(encoded).not.toContain('|');
  });

  it('includes pipe separator when non-default values exist', () => {
    const state = makeCustomState({ headingWeight: 700 });
    const encoded = encodeState(state);
    expect(encoded).toContain('|hw=700');
  });
});

describe('backward compatibility', () => {
  it('decodes old format (7 fields, no pipe) with defaults', () => {
    const oldHash = 'custom,1.0,1.272,1.2,satoshi,satoshi,system-mono';
    const decoded = decodeState(oldHash);
    expect(decoded).not.toBeNull();
    expect(decoded!.headingWeight).toBe(500);
    expect(decoded!.mobileBaseSize).toBe(1.0);
    expect(decoded!.mobileRatioMode).toBe('auto');
    expect(decoded!.autoShrink).toBe(25);
    expect(decoded!.lineHeightOverrides).toEqual({});
    expect(decoded!.letterSpacingOverrides).toEqual({});
  });

  it('decodes old traditional format (16 fields, no pipe)', () => {
    const parts = ['traditional', '1.0', '1.272', '1.2', 'satoshi', 'satoshi', 'system-mono'];
    for (const level of ['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body-l', 'body-m', 'body-s', 'caption']) {
      parts.push(String(DEFAULT_TRADITIONAL[level as keyof typeof DEFAULT_TRADITIONAL]));
    }
    const decoded = decodeState(parts.join(','));
    expect(decoded).not.toBeNull();
    expect(decoded!.scaleMode).toBe('traditional');
    expect(decoded!.headingWeight).toBe(500);
    expect(decoded!.traditionalAssignments!.display).toBe(72);
  });
});

describe('decodeState edge cases', () => {
  it('returns null for empty string', () => {
    expect(decodeState('')).toBeNull();
  });

  it('returns null for hash with only #', () => {
    expect(decodeState('#')).toBeNull();
  });

  it('returns null for too few fields', () => {
    expect(decodeState('custom,1.0')).toBeNull();
  });

  it('rejects golden mode (by design)', () => {
    expect(decodeState('golden,1.0,1.272,1.2,satoshi,satoshi,system-mono')).toBeNull();
  });

  it('strips leading # from hash', () => {
    const state = makeCustomState();
    const encoded = '#' + encodeState(state);
    const decoded = decodeState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.scaleMode).toBe('custom');
  });

  it('returns null for NaN numeric fields', () => {
    expect(decodeState('custom,abc,1.272,1.2,satoshi,satoshi,system-mono')).toBeNull();
  });
});
