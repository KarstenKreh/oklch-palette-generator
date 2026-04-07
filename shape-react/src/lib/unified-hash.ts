/**
 * Unified hash format for cross-tool state sharing.
 *
 * Format: c=<color-hash>&t=<type-hash>&s=<shape-hash>
 *
 * Each tool reads/writes only its own segment and preserves the rest.
 * Legacy hashes (without c=, t=, or s= prefix) are detected by the caller.
 */

type SegmentKey = 'c' | 't' | 's';

/** Check whether a raw hash string uses the unified format. */
export function isUnifiedHash(raw: string): boolean {
  const str = raw.replace(/^#/, '');
  return /(?:^|&)[cts]=/.test(str);
}

/** Parse unified hash into segments. Returns null values for missing keys. */
export function parseUnifiedHash(raw: string): { c: string | null; t: string | null; s: string | null } {
  const str = raw.replace(/^#/, '');
  const result: { c: string | null; t: string | null; s: string | null } = { c: null, t: null, s: null };
  if (!isUnifiedHash(str)) return result;

  for (const part of str.split('&')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    const value = part.slice(eq + 1);
    if (key === 'c' || key === 't' || key === 's') {
      result[key] = value || null;
    }
  }
  return result;
}

/** Build a unified hash string (without leading #). */
export function buildUnifiedHash(segments: { c?: string; t?: string; s?: string }): string {
  const parts: string[] = [];
  if (segments.c) parts.push('c=' + segments.c);
  if (segments.t) parts.push('t=' + segments.t);
  if (segments.s) parts.push('s=' + segments.s);
  return parts.join('&');
}

/** Extract a single segment from a unified hash. Returns null if missing or legacy. */
export function getMySegment(raw: string, key: SegmentKey): string | null {
  return parseUnifiedHash(raw)[key];
}

/** Replace one segment in a unified hash, preserving others. Returns hash without #. */
export function setMySegment(raw: string, key: SegmentKey, value: string): string {
  const parsed = parseUnifiedHash(raw);
  parsed[key] = value;
  return buildUnifiedHash(parsed);
}
