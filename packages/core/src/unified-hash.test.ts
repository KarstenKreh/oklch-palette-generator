import { describe, it, expect } from 'vitest';
import {
  isUnifiedHash,
  parseUnifiedHash,
  buildUnifiedHash,
  getMySegment,
  setMySegment,
} from './unified-hash';

describe('isUnifiedHash', () => {
  it('detects unified format with c= segment', () => {
    expect(isUnifiedHash('c=abc')).toBe(true);
  });

  it('detects unified format with t= segment', () => {
    expect(isUnifiedHash('t=xyz')).toBe(true);
  });

  it('detects unified format with s= segment', () => {
    expect(isUnifiedHash('s=123')).toBe(true);
  });

  it('detects unified format with leading #', () => {
    expect(isUnifiedHash('#c=abc&t=xyz')).toBe(true);
  });

  it('detects combined segments', () => {
    expect(isUnifiedHash('c=abc&t=xyz&s=123')).toBe(true);
  });

  it('rejects legacy hash without segment keys', () => {
    expect(isUnifiedHash('335A7F,335A7F,1,CC3333,1,25,balanced')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isUnifiedHash('')).toBe(false);
  });

  it('rejects bare #', () => {
    expect(isUnifiedHash('#')).toBe(false);
  });
});

describe('parseUnifiedHash', () => {
  it('parses all three segments', () => {
    const result = parseUnifiedHash('c=colordata&t=typedata&s=shapedata');
    expect(result).toEqual({ c: 'colordata', t: 'typedata', s: 'shapedata' });
  });

  it('parses with leading #', () => {
    const result = parseUnifiedHash('#c=colordata&t=typedata');
    expect(result).toEqual({ c: 'colordata', t: 'typedata', s: null });
  });

  it('returns null for missing segments', () => {
    const result = parseUnifiedHash('c=only-color');
    expect(result).toEqual({ c: 'only-color', t: null, s: null });
  });

  it('returns all null for legacy hash', () => {
    const result = parseUnifiedHash('335A7F,335A7F,1');
    expect(result).toEqual({ c: null, t: null, s: null });
  });

  it('returns null value for empty segment (c= without value)', () => {
    const result = parseUnifiedHash('c=&t=data');
    expect(result).toEqual({ c: null, t: 'data', s: null });
  });

  it('handles segments with special characters (commas, colons)', () => {
    const result = parseUnifiedHash('c=335A7F,335A7F,1,CC3333&t=custom,1.0,1.272');
    expect(result.c).toBe('335A7F,335A7F,1,CC3333');
    expect(result.t).toBe('custom,1.0,1.272');
  });

  it('handles URL-encoded content like Standby.Design', () => {
    const result = parseUnifiedHash('c=335A7F,bg,1,err,1,25,balanced,0,0,best,Standby.Design');
    expect(result.c).toContain('Standby.Design');
  });
});

describe('buildUnifiedHash', () => {
  it('builds hash with all segments', () => {
    const hash = buildUnifiedHash({ c: 'color', t: 'type', s: 'shape' });
    expect(hash).toBe('c=color&t=type&s=shape');
  });

  it('omits empty segments', () => {
    const hash = buildUnifiedHash({ c: 'color' });
    expect(hash).toBe('c=color');
  });

  it('omits undefined segments', () => {
    const hash = buildUnifiedHash({ c: 'color', t: undefined, s: 'shape' });
    expect(hash).toBe('c=color&s=shape');
  });

  it('returns empty string when all segments are empty', () => {
    const hash = buildUnifiedHash({});
    expect(hash).toBe('');
  });

  it('does not include leading #', () => {
    const hash = buildUnifiedHash({ c: 'data' });
    expect(hash).not.toMatch(/^#/);
  });
});

describe('getMySegment', () => {
  it('reads color segment', () => {
    expect(getMySegment('c=colordata&t=typedata', 'c')).toBe('colordata');
  });

  it('reads type segment', () => {
    expect(getMySegment('c=colordata&t=typedata', 't')).toBe('typedata');
  });

  it('returns null for missing segment', () => {
    expect(getMySegment('c=colordata', 's')).toBeNull();
  });

  it('returns null for legacy hash', () => {
    expect(getMySegment('335A7F,data', 'c')).toBeNull();
  });
});

describe('setMySegment', () => {
  it('sets a new segment preserving others', () => {
    const result = setMySegment('c=old&t=type', 'c', 'new');
    expect(result).toContain('c=new');
    expect(result).toContain('t=type');
  });

  it('adds a segment to existing hash', () => {
    const result = setMySegment('c=color', 's', 'shape');
    expect(result).toContain('c=color');
    expect(result).toContain('s=shape');
  });

  it('works on legacy hash (creates new unified from scratch)', () => {
    const result = setMySegment('335A7F,data', 'c', 'newcolor');
    expect(result).toContain('c=newcolor');
  });
});

describe('round-trips', () => {
  it('build → parse returns same values', () => {
    const segments = { c: 'color-hash', t: 'type-hash', s: 'shape-hash' };
    const built = buildUnifiedHash(segments);
    const parsed = parseUnifiedHash(built);
    expect(parsed).toEqual(segments);
  });

  it('survives special characters in color hash (commas, colons, exclamations)', () => {
    const colorHash = '335A7F,335A7F,1,CC3333,1,25,balanced,0,0,best,Standby.Design,0,0!Success:00FF00:0:1:145:0';
    const built = buildUnifiedHash({ c: colorHash, t: 'custom,1.0,1.272,1.2,satoshi,satoshi,system-mono' });
    const parsed = parseUnifiedHash(built);
    expect(parsed.c).toBe(colorHash);
  });

  it('set then get returns the set value', () => {
    const hash = buildUnifiedHash({ c: 'old', t: 'type' });
    const updated = setMySegment(hash, 'c', 'new');
    expect(getMySegment(updated, 'c')).toBe('new');
    expect(getMySegment(updated, 't')).toBe('type');
  });
});
